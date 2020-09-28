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
import { AuthoringUtils } from './AuthoringUtils';

/**
 * Checks whether provided child path exists in the model.
 * @param model Model to be evaluated.
 * @param childPath Path of the child.
 * @private
 * @returns `true` if childPath exists in the model.
 */
function hasChildOfPath(model: any, childPath: string): boolean {
    const sanited = PathUtils.sanitize(childPath);

    if (!sanited) {
        return false;
    }

    return !!(model && childPath && model[Constants.CHILDREN_PROP] && model[Constants.CHILDREN_PROP][sanited]);
}

/**
 * Checks whether provided path corresponds to model root path.
 * @param pagePath Page model path.
 * @param modelRootPath Model root path.
 * @returns `true` if provided page path is root
 * @private
 */
function isPageURLRoot(pagePath: string, modelRootPath: string | undefined): boolean {
    return !pagePath || !modelRootPath || (PathUtils.sanitize(pagePath) === PathUtils.sanitize(modelRootPath));
}

export interface ModelManagerConfiguration {
    forceReload?: boolean;
    model?: Model;
    modelClient?: ModelClient;
    path?: string;
}

interface ModelPaths {
    rootModelURL?: string;
    rootModelPath?: string;
    currentPathname?: string | null;
    sanitizedCurrentPathname?: string;
    metaPropertyModelUrl?: string;
}

/**
 * @private
 */
export type ListenerFunction = () => void;

/**
 * ModelManager is main entry point of this module.
 *
 * Example:
 *
 * Boostrap: `index.html`
 * ```
 * <head>
 *     <meta property="cq:pagemodel_root_url" content="{PATH}.model.json"/>
 * </head>
 * ```
 *
 * Bootstrap: `index.js`
 * ```
 * import { ModelManager } from '@adobe/aem-spa-page-model-manager';
 *
 * ModelManager.initialize().then((model) => {
 *     // Render the App content using the provided model
 *     render(model);
 * });
 *
 * // Loading a specific portion of model
 * ModelManager.getData("/content/site/page/jcr:content/path/to/component").then(...);
 * ```
 */
export class ModelManager {
    private _modelClient: ModelClient | undefined;
    private _modelStore: ModelStore | undefined;
    private _listenersMap: { [key: string]: ListenerFunction[] } = {};
    private _fetchPromises: { [key: string]: Promise<Model> } = {};
    private _initPromise: any;
    private _editorClient: EditorClient | undefined;
    private _clientlibUtil: AuthoringUtils | undefined;
    private _modelPaths: ModelPaths = {};

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

    public get clientlibUtil() {
        if (!this._clientlibUtil) {
            throw new Error('AuthoringUtils is undefined. Call initialize first!');
        }

        return this._clientlibUtil;
    }

    /**
     * Initializes the ModelManager using the given path to resolve a data model.
     * If no path is provided, fallbacks are applied in the following order:
     * - meta property: `cq:pagemodel_root_url`
     * - current path of the page
     *
     * If page model does not contain information about current path it performs additional fetch.
     *
     * @param [config] URL to the data model or configuration object.
     * @fires cq-pagemodel-loaded
     * @return {Promise}
     */
    public initialize<M extends Model>(config?: ModelManagerConfiguration | string): Promise<M> {
        this.initializeAsync(config);
        const { rootModelURL, rootModelPath } = this._modelPaths;

        if (!rootModelURL) {
            throw new Error("ModelManager.js Cannot initialize without a URL to fetch the root model");
        }

        if (!rootModelPath) {
            throw new Error('No root modelpath resolved! This should never happen.');
        }

        return this._initPromise;
    }

    /**
     * Initializes the ModelManager asynchronously using the rootModelPath to resolve a data model.
     * For remote apps with no defined root model, an empty store is initialized and data is fetched on demand by components.
     *
     * Once the initial model is loaded and if the data model doesn't contain the path of the current pathname,
     * the library attempts to fetch a fragment of model.
     *
     * @param {string|InitializationConfig} [config]                - URL to the data model or configuration object
     * @fires cq-pagemodel-loaded if root model path is available
     */
    public initializeAsync(config?: ModelManagerConfiguration | string): void {
        this.destroy();

        const modelConfig = this._toModelConfig(config);
        this._initializeFields(modelConfig);

        const initialModel = modelConfig && modelConfig.model;

        this._getPathsForModel(modelConfig);
        const { rootModelPath } = this._modelPaths;

        this._modelStore = new ModelStore(rootModelPath, initialModel);

        if (rootModelPath) {
            this._setInitializationPromise(rootModelPath);
        }
    }

    /**
     * Initializes the class fields for ModelManager
     * If no path is provided, fallbacks are applied in the following order:
     *
     * @param {string|InitializationConfig} [config]                - configuration object
     */
    private _initializeFields(config?: ModelManagerConfiguration) {
        this._listenersMap = {};
        this._fetchPromises = {};
        this._initPromise = null;

        this._modelClient = ((config && config.modelClient) || new ModelClient());

        this._editorClient = new EditorClient(this);
        this._clientlibUtil = new AuthoringUtils(this.modelClient.apiHost);
    }

    /**
     * Returns paths required for fetching root model
     * Order of preference for determining the root model url -
     * 1. Page path provided via config
     * 2. Meta property value for cq:pagemodel_root_url, if set
     * 3. Model path contained in URL for default SPA.
     * To add - For remote SPA opened within editor, path contained in parent i.e. AEM url
     * 4. If none, it defaults to empty string
     *
     * @param {string|InitializationConfig} [config]                - configuration object
     */
    private _getPathsForModel(config?: ModelManagerConfiguration) {
        // Model path explicitly provided by user in config
        const path = config && config.path;

        // Model path set statically via meta property
        const pageModelRoot = PathUtils.getMetaPropertyValue(MetaProperty.PAGE_MODEL_ROOT_URL);
        const metaPropertyModelUrl = PathUtils.internalize(pageModelRoot);

        const aemApiHost = this.modelClient.apiHost;
        const isRemoteApp = PathUtils.isBrowser() && aemApiHost && (PathUtils.getCurrentURL() !== aemApiHost);
        const currentPathname = !isRemoteApp ? PathUtils.getCurrentPathname() : '';
        // For remote apps in edit mode, to fetch path via parent URL

        const sanitizedCurrentPathname = ((currentPathname && PathUtils.sanitize(currentPathname)) || '') as string;

        // Fetch the app root model
        // 1. consider the provided page path
        // 2. consider the meta property value
        // 3. fallback to the model path contained in the URL for the default SPA
        const rootModelURL = path || metaPropertyModelUrl || sanitizedCurrentPathname;
        const rootModelPath = PathUtils.sanitize(rootModelURL) || '';

        this._modelPaths = {
            currentPathname,
            sanitizedCurrentPathname,
            metaPropertyModelUrl,
            rootModelURL,
            rootModelPath
        };
    }

    /**
     * Sets initialization promise to fetch model if root path is available
     * Also, to be returned on synchronous initialization
     * @param rootModelPath Root model path
     */
    private _setInitializationPromise(rootModelPath: string) {
        const {
            rootModelURL,
            currentPathname,
            sanitizedCurrentPathname,
            metaPropertyModelUrl
        } = this._modelPaths;

        this._initPromise = (
            this._checkDependencies().then(() => {
                const data = this.modelStore.getData(rootModelPath);

                if (data && (Object.keys(data).length > 0)) {
                    triggerPageModelLoaded(data);
                    return data;
                } else if (rootModelURL) {
                    return this._fetchData(rootModelURL).then((rootModel: Model) => {
                        try {
                            this.modelStore.initialize(rootModelPath, rootModel);

                            // Append the child page if the page model doesn't correspond to the URL of the root model
                            // and if the model root path doesn't already contain the child model (asynchronous page load)
                            if (!!currentPathname && !!sanitizedCurrentPathname) {
                                if (!isPageURLRoot(currentPathname, metaPropertyModelUrl)
                                && !hasChildOfPath(rootModel, currentPathname)) {
                                    return this._fetchData(currentPathname).then((model: Model) => {
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
                            } else if (!PathUtils.isBrowser()){
                                throw new Error(`Attempting to retrieve model data from a non-browser.
                                    Please provide the initial data with the property key model`
                                );
                            }
                        } catch (e) {
                            console.error(`Error on initialization - ${e}`);
                        }
                    });
                }
            })
        );
    }

    /**
     * Returns the path of the data model root.
     * @returns Page model root path.
     */
    public get rootPath(): string {
        return this.modelStore.rootPath;
    }

    /**
     * Returns the model for the given configuration.
     * @param [config] Either the path of the data model or a configuration object. If no parameter is provided the complete model is returned.
     * @returns Model object for specific path.
     */
    public getData<M extends Model>(config?: ModelManagerConfiguration | string): Promise<M>{
        let path: string;
        let forceReload = false;

        if (typeof config === 'string') {
            path = config;
        } else if (config) {
            path = config.path || '';
            forceReload = !!config.forceReload;
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

                return this._fetchData(path).then((data: Model) => this._storeData(path, data));
        });
    }

    /**
     * Fetches the model for the given path.
     * @param path Model path.
     * @private
     * @returns Model object for specific path.
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
     * Notifies the listeners for a given path.
     * @param path Path of the data model.
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
     * @param path Absolute path of the resource (e.g., "/content/mypage"). If not provided, the root page path is used.
     * @param callback Function to be executed listening to changes at given path.
     */
    public addListener(path: string, callback: ListenerFunction): void {
        if (!path || (typeof path !== 'string') || (typeof callback !== 'function')) {
            return;
        }

        const adaptedPath = PathUtils.adaptPagePath(path, this.modelStore?.rootPath);

        this._listenersMap[adaptedPath] = this._listenersMap[path] || [];
        this._listenersMap[adaptedPath].push(callback);
    }

    /**
     * Remove the callback listener from the given path path.
     * @param path Absolute path of the resource (e.g., "/content/mypage"). If not provided, the root page path is used.
     * @param callback Listener function to be removed.
     */
    public removeListener(path: string, callback: ListenerFunction): void {
        if (!path || (typeof path !== 'string') || (typeof callback !== 'function')) {
            return;
        }

        const adaptedPath = PathUtils.adaptPagePath(path, this.modelStore?.rootPath);
        const listenersForPath = this._listenersMap[adaptedPath];

        if (listenersForPath) {
            const index = listenersForPath.indexOf(callback);

            if (index !== -1) {
                listenersForPath.splice(index, 1);
            }
        }
    }

    /**
     * @private
     */
    private destroy() {
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

        if (data && (Object.keys(data).length > 0)) {
            this.modelStore.insertData(path, data);
            // If the path correspond to an item notify either the parent item
            // Otherwise notify the app root
            this._notifyListeners(path);
        }

        if (!isItem) {
            // As we are expecting a page, we notify the root
            this._notifyListeners('');
        }

        return data;
    }

    /**
     * Transforms the given path into a model URL.
     * @param path
     * @private
     * @return {*}
     */
    private _toModelPath(path: string) {
        let url = PathUtils.addSelector(path, 'model');

        url = PathUtils.addExtension(url, 'json');
        url = PathUtils.externalize(url);

        return PathUtils.makeAbsolute(url);
    }

    /**
     * Transforms the given config into a ModelManagerConfiguration object
     * Removes redundant string or object check
     * @param path
     * @return {object}
     * @private
     */
    private _toModelConfig(config?: ModelManagerConfiguration | string): ModelManagerConfiguration{
        if (!config || typeof config !== 'string') {
          return ((config || {}) as ModelManagerConfiguration);
        }
        return {
          path: config
        };
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
