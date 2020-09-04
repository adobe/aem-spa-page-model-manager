/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import Constants from './Constants';
import { EditorClient, triggerPageModelLoaded } from './EditorClient';
import MetaProperty from './MetaProperty';
import { Model } from './Model';
import { ModelClient } from './ModelClient';
import { ModelStore } from './ModelStore';
import { PathUtils } from './PathUtils';

/**
 * Does the provided model object contains an entry for the given child path
 *
 * @param {{}} model            - model to be evaluated
 * @param {string} childPath    - path of the child
 * @return {boolean}
 *
 * @private
 */
function hasChildOfPath(model: any, childPath: string): boolean {
    const sanited = PathUtils.sanitize(childPath);

    if (!sanited) {
        return false;
    }

    return !!(model && childPath && model[Constants.CHILDREN_PROP] && model[Constants.CHILDREN_PROP][sanited]);
}

/**
 * Does the provided page path correspond to the model root path
 *
 * @param {string} pagePath         - path of the page model
 * @param {string} modelRootPath    - current model root path
 * @return {boolean}
 *
 * @private
 */
function isPageURLRoot(pagePath: string, modelRootPath: string): boolean {
    return !pagePath || !modelRootPath || (PathUtils.sanitize(pagePath) === PathUtils.sanitize(modelRootPath));
}

export interface ModelManagerConfiguration {
    forceReload?: boolean;
    model?: Model;
    modelClient?: ModelClient;
    path?: string;
}

export type ListenerFunction = () => void;

export class ModelManager {
    private _modelClient: ModelClient | undefined;
    private _modelStore: ModelStore | undefined;
    private _listenersMap: { [key: string]: ListenerFunction[] } = {};
    private _fetchPromises: { [key: string]: Promise<Model> } = {};
    private _initPromise: any;
    private _editorClient: EditorClient | undefined;

    public get modelClient() {
        if (!this._modelClient) {
            throw new Error('ModelClient is undefined. Call initialize first!');
        }

        return this._modelClient;
    }

    public get modelStore() {
        if (!this._modelStore) {
            throw new Error('ModelStore is undefined. Call initialize first!');
        }

        return this._modelStore;
    }

    /**
     * Initializes the ModelManager using the given path to resolve a data model.
     * If no path is provided, fallbacks are applied in the following order:
     *
     * - meta property: cq:pagemodel_root_url
     * - current pathname of the browser
     *
     * Once the initial model is loaded and if the data model doesn't contain the path of the current pathname, the library attempts to fetch a fragment of model.
     *
     * @param {string|InitializationConfig} [config]                - URL to the data model or configuration object
     * @fires cq-pagemodel-loaded
     * @return {Promise}
     */
    public initialize<M extends Model>(config?: ModelManagerConfiguration | string): Promise<M> {
        this.destroy();
        let path;
        let initialModel = null;
        if (!config || (typeof config === 'string')) {
            path = config;
        } else if (config) {
            path = config.path;
            this._modelClient = config.modelClient;
            initialModel = config.model;
        }

        this._listenersMap = {};
        this._fetchPromises = {};
        this._initPromise = null;

        const pageModelRoot = PathUtils.getMetaPropertyValue(MetaProperty.PAGE_MODEL_ROOT_URL);
        const metaPropertyModelUrl = PathUtils.internalize(pageModelRoot);
        const currentPathname = PathUtils.getCurrentPathname();
        const sanitizedCurrentPathname = currentPathname ? PathUtils.sanitize(currentPathname) : '';

        // Fetch the app root model
        // 1. consider the provided page path
        // 2. consider the meta property value
        // 3. fallback to the model path contained in the URL
        const rootModelURL = path || metaPropertyModelUrl || sanitizedCurrentPathname;
        // @ts-ignore
        const rootModelPath = PathUtils.sanitize(rootModelURL);

        if (!rootModelPath) {
            throw new Error('No root modelpath resolved! This should never happen.');
        }

        if (!rootModelURL) {
            throw new Error("ModelManager.js Cannot initialize without an URL to fetch the root model");
        }

        if (!this._modelClient) {
            this._modelClient = new ModelClient();
        }
        let domain = "";
        if (this._modelClient) {
            domain = this._modelClient.apiHost != null ? this._modelClient.apiHost : "";
        }
        // Check if async is required. This will be true only in remote rendering.
        const asyncFlag =  domain === PathUtils.getCurrentPathname() ? false : true;
        if (asyncFlag && PathUtils.isEditMode()) {
            const clientLibUrl = this.generateClientLibsUrl(rootModelPath, domain);
            this.appendClientLibs(clientLibUrl);
        }
        this._editorClient = new EditorClient(this);
        this._modelStore = (initialModel) ? new ModelStore(rootModelPath, initialModel) : new ModelStore(rootModelPath);


        this._initPromise = this._checkDependencies().then(() => {

            const data = this.modelStore.getData(rootModelPath);

            if (data && (Object.keys(data).length > 0)) {
                triggerPageModelLoaded(data);
                return data;
            } else {
                return this._fetchData(rootModelURL).then((rootModel: Model) => {
                    this.modelStore.initialize(rootModelPath, rootModel);

                    // Append the child page if the page model doesn't correspond to the URL of the root model
                    // and if the model root path doesn't already contain the child model (asynchronous page load)
                    if (!!currentPathname && !!sanitizedCurrentPathname) {
                        if (!isPageURLRoot(currentPathname, metaPropertyModelUrl) && !hasChildOfPath(rootModel, currentPathname)) {
                            return this._fetchData(currentPathname).then((model: any) => {
                                this.modelStore.insertData(sanitizedCurrentPathname, model);
                                const data = this.modelStore.getData();
                                triggerPageModelLoaded(data);

                                return data;
                            });
                        } else {
                            const data = this.modelStore.getData();
                            triggerPageModelLoaded(data);

                            return data;
                        }
                    } else {
                        throw new Error('Attempting to retrieve model data from a non-browser. Please provide the initial data with the property key model');
                    }
                });
            }
        });

        return this._initPromise;
    }

    /**
     * Appends client lib to the page
     */
    private appendClientLibs(clientLibUrl : string) {
        const script = document.createElement('script');
        const scripts = document.getElementsByTagName('script')[0];
        script.src = clientLibUrl;
        if (scripts.parentNode) {
            scripts.parentNode.insertBefore(script, scripts);
        }
    }

    /**
     * Generates clientlib url
     */
    private generateClientLibsUrl(pageModelRoot : string, domain : string) : string {
        let clientLibPath = '';
        if (pageModelRoot != null) {
            clientLibPath = domain + '/etc.clientlibs/' +  pageModelRoot.split("/")[2] + '/clientlibs/clientlib-react.min.js';
        }
        else {
            throw new Error('Clientlib path cannot be determined! This should never happen.');
            return "";
        }
        return domain + clientLibPath;
    }

    /**
     * Returns the path of the data model root.
     *
     * @return {string}
     */
    public get rootPath(): string {
        return this.modelStore.rootPath;
    }

    /**
     * Returns the model for the given configuration
     * @param {string|GetDataConfig} [config]     - Either the path of the data model or a configuration object. If no parameter is provided the complete model is returned
     * @return {Promise}
     */
    public getData<M extends Model>(config?: ModelManagerConfiguration | string): Promise<M> {
        let path: string;
        let forceReload = false;

        if (typeof config === 'string') {
            path = config;
        } else if (config) {
            path = config.path || '';
            forceReload = !!config.forceReload || false;
        } else {
            path = '';
        }

        const initPromise = this._initPromise || Promise.resolve();

        return initPromise.then(() => this._checkDependencies())
            .then(() => {
                if (!forceReload) {
                    const item = this.modelStore.getData(path);

                    if (item) {
                        return Promise.resolve(item);
                    }
                }

                // We are not having any items
                // We want to reload the item
                return this._fetchData(path).then((data: any) => this._storeData(path, data));
            });
    }

    /**
     * Fetches a model for the given path
     *
     * @param {string} path - Model path
     * @return {Promise}
     * @private
     */
    public _fetchData(path: string): Promise<Model> {
        if (Object.prototype.hasOwnProperty.call(this._fetchPromises, path)) {
            return this._fetchPromises[path];
        }

        if (this.modelClient) {
            const promise = this.modelClient.fetch(this._toModelPath(path));

            this._fetchPromises[path] = promise;

            promise.then((obj) => {
                delete this._fetchPromises[path];
                return obj;
            }).catch((error) => {
                delete this._fetchPromises[path];
                return error;
            });

            return promise;
        } else {
            throw new Error('ModelClient not initialized!');
        }
    }

    /**
     * Notifies the listeners for a given path
     *
     * @param {string} path - Path of the data model
     * @private
     */
    public _notifyListeners(path: string): void {
        path = PathUtils.adaptPagePath.call(this, path);

        if (!this._listenersMap) {
            throw new Error('ListenersMap is undefined.');
        }

        const listenersForPath: ListenerFunction[] = this._listenersMap[path];

        if (!listenersForPath) {
            return;
        }

        if (listenersForPath.length) {
            listenersForPath.forEach((listener: ListenerFunction) => {
                try {
                    listener();
                } catch (e) {
                    console.error(`Error in listener ${listenersForPath} at path ${path}: ${e}`);
                }
            });
        }
    }

    /**
     * Add the given callback as a listener for changes at the given path.
     *
     * @param {String}  [path]  Absolute path of the resource (e.g., "/content/mypage"). If not provided, the root page path is used.
     * @param {String}  [callback]  Function to be executed listening to changes at given path
     */
    public addListener(path: string | undefined, callback: ListenerFunction): void {
        if (!this._listenersMap) {
            throw new Error('ListenersMap is undefined.');
        }

        if (!path && (typeof path !== 'string')) {
            return;
        }

        const adaptedPath = this.adaptPagePath(path);

        this._listenersMap[adaptedPath] = this._listenersMap[path] || [];
        this._listenersMap[adaptedPath].push(callback);
    }

    /**
     * Remove the callback listener from the given path path.
     *
     * @param {String}  [path] Absolute path of the resource (e.g., "/content/mypage"). If not provided, the root page path is used.
     * @param {String}  [callback]  Listener function to be removed.
     */
    public removeListener(path: string | undefined, callback: ListenerFunction): void {
        if (!this._listenersMap) {
            throw new Error('ListenersMap is undefined.');
        }

        if (!path) {
            return;
        }

        const adaptedPath = this.adaptPagePath(path);
        const listenersForPath = this._listenersMap[adaptedPath];

        if (listenersForPath) {
            const index = listenersForPath.indexOf(callback);

            if (index !== -1) {
                listenersForPath.splice(index, 1);
            }
        }
    }

    /**
     * Adapts the provided path to a valid model path.
     * Returns an empty string if the given path is equal to the root model path.
     * This function is a utility tool that converts a provided root model path into an internal specific empty path
     *
     * @param {string} [path]   - raw model path
     * @return {string} the valid model path
     *
     * @private
     */
    public adaptPagePath(path: string): string {
        // duplicate? spa-page-model-manager/src/PathUtils.ts
        if (!path) {
            return '';
        }

        const localPath = PathUtils.internalize(path);

        if (!this.modelStore || !this.modelStore.rootPath) {
            return localPath;
        }

        const localRootModelPath = PathUtils.sanitize(this.modelStore.rootPath);

        return (localPath === localRootModelPath) ? '' : localPath;
    }

    /**
     * @private
     */
    private destroy() {
        delete this._fetchPromises;
        delete this._listenersMap;

        if (this._modelClient && this._modelClient.destroy) {
            this._modelClient.destroy();
        }

        if (this._modelStore && this._modelStore.destroy) {
            this._modelStore.destroy();
        }

        if (this._editorClient && this._editorClient.destroy) {
            this._editorClient.destroy();
        }
    }

    private _storeData(path: string, data: Model) {
        let isItem = false;

        if (this._modelStore) {
            isItem = PathUtils.isItem(path);
        }

        this.modelStore.insertData(path, data);

        // If the path correspond to an item notify either the parent item
        // Otherwise notify the app root
        this._notifyListeners(path);

        if (!isItem) {
            // As we are expecting a page, we notify the root
            this._notifyListeners('');
        }

        return data;
    }

    /**
     * Transforms the given path into a model URL
     *
     * @param path
     * @return {*}
     * @private
     */
    private _toModelPath(path: string) {
        let url = PathUtils.addSelector(path, 'model');
        url = PathUtils.addExtension(url, 'json');
        url = PathUtils.externalize(url);

        return PathUtils.makeAbsolute(url);
    }

    /**
     * Verifies the integrity of the provided dependencies
     *
     * @return {Promise}
     * @private
     */
    private _checkDependencies() {
        if (!this.modelClient) {
            return Promise.reject('No ModelClient registered.');
        }

        if (!this.modelStore) {
            return Promise.reject('No ModelManager registered.');
        }

        return Promise.resolve();
    }
}

export default new ModelManager();
