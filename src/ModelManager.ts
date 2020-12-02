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
    metaPropertyModelURL?: string;
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
 *
 *
 * For asynchronous loading of root model/standalone item model
 * ```
 * import { ModelManager } from '@adobe/aem-spa-page-model-manager';
 *
 * ModelManager.initializeAsync();
 * ...
 * // Render the App independent of the model
 * render();
 *
 * ```
 * For root model, custom event is fired on window with fetched model - cq-pagemodel-loaded
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

    public get modelClient(): ModelClient {
        if (!this._modelClient) {
            throw new Error('ModelClient is undefined. Call initialize first!');
        }

        return this._modelClient;
    }

    public get modelStore(): ModelStore {
        if (!this._modelStore) {
            throw new Error('ModelStore is undefined. Call initialize first!');
        }

        return this._modelStore;
    }

    public get clientlibUtil(): AuthoringUtils {
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
     * @fires cq-pagemodel-loaded
     * @return {Promise}
     */
    public initialize<M extends Model>(config?: ModelManagerConfiguration | string): Promise<M> {
        this.initializeAsync(config);

        const { rootModelURL, rootModelPath } = this._modelPaths;

        if (!rootModelURL) {
            throw new Error('Provide root model url to initialize ModelManager.');
        }

        if (!rootModelPath) {
            throw new Error('No root modelpath resolved! This should never happen.');
        }

        return this._initPromise;
    }

    /**
     * Initializes the ModelManager asynchronously using the given path to resolve a data model.
     * Ideal use case would be for remote apps which do not need the page model to be passed down from the root.
     * For remote apps with no model path, an empty store is initialized and data is fetched on demand by components.
     *
     * Once the initial model is loaded and if the data model doesn't contain the path of the current pathname,
     * the library attempts to fetch a fragment of model.
     *
     * Root model path is resolved in the following order of preference:
     * - page path provided via config
     * - meta property: `cq:pagemodel_root_url`
     * - current path of the page for default SPA
     * - if none, it defaults to empty string
     *
     * @fires cq-pagemodel-loaded if root model path is available
     */
    public initializeAsync(config?: ModelManagerConfiguration | string): void {
        this.destroy();

        const modelConfig = this._toModelConfig(config);
        const initialModel = modelConfig && modelConfig.model;

        this._initializeFields(modelConfig);

        const { rootModelPath } = this._modelPaths;

        this._modelStore = new ModelStore(rootModelPath, initialModel);

        if (rootModelPath) {
            this._setInitializationPromise(rootModelPath);
        }
    }

    /**
     * Initializes the class fields for ModelManager
     */
    private _initializeFields(config?: ModelManagerConfiguration) {
        this._listenersMap = {};
        this._fetchPromises = {};
        this._initPromise = null;

        this._modelClient = ((config && config.modelClient) || new ModelClient());

        this._editorClient = new EditorClient(this);
        this._clientlibUtil = new AuthoringUtils(this.modelClient.apiHost);
        this._modelPaths = this._getPathsForModel(config);
    }

    /**
     * Returns paths required for fetching root model
     */
    private _getPathsForModel(config?: ModelManagerConfiguration) {
        // Model path explicitly provided by user in config
        const path = config?.path;

        // Model path set statically via meta property
        const pageModelRoot = PathUtils.getMetaPropertyValue(MetaProperty.PAGE_MODEL_ROOT_URL);
        const metaPropertyModelURL = PathUtils.internalize(pageModelRoot);

        const currentPathname = !this._isRemoteApp() ? PathUtils.getCurrentPathname() : '';
        // For remote apps in edit mode, to fetch path via parent URL

        const sanitizedCurrentPathname = ((currentPathname && PathUtils.sanitize(currentPathname)) || '') as string;

        // Fetch the app root model
        // 1. consider the provided page path
        // 2. consider the meta property value
        // 3. fallback to the model path contained in the URL for the default SPA
        const rootModelURL = path || metaPropertyModelURL || sanitizedCurrentPathname;
        const rootModelPath = PathUtils.sanitize(rootModelURL) || '';

        return {
            currentPathname,
            metaPropertyModelURL,
            rootModelURL,
            rootModelPath
        };
    }

    /**
     * Fetch page model from store and trigger cq-pagemodel-loaded event
     * @returns Root page model
     */
    private _fetchPageModelFromStore() {
        const data = this.modelStore.getData();

        triggerPageModelLoaded(data);

        return data;
    }

    /**
     * Sets initialization promise to fetch model if root path is available
     * Also, to be returned on synchronous initialization
     */
    private _setInitializationPromise(rootModelPath: string) {
        const {
            rootModelURL
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

                            // If currently active url model isn't available in the stored model, fetch and return it
                            // If already available, return the root page model from the store
                            return (
                                this._fetchActivePageModel(rootModel) || this._fetchPageModelFromStore()
                            );

                        } catch (e) {
                            console.error(`Error on initialization - ${e}`);
                        }
                    });
                }
            })
        );
    }

    /**
     * Fetch model for the currently active page
     */
    private _fetchActivePageModel(rootModel: Model) {
        const {
            currentPathname,
            metaPropertyModelURL
        } = this._modelPaths;

        const sanitizedCurrentPathname = ((currentPathname && PathUtils.sanitize(currentPathname)) || '') as string;

        // Fetch and store model of currently active page
        if (
            !!currentPathname &&
            !!sanitizedCurrentPathname && // active page path is available for fetching model
            !isPageURLRoot(currentPathname, metaPropertyModelURL) && // verify currently active URL is not same as the URL of the root model
            !hasChildOfPath(rootModel, currentPathname) // verify fetched root model doesn't already contain the active path model
        ) {
            return this._fetchData(currentPathname).then((model: Model) => {
                this.modelStore.insertData(sanitizedCurrentPathname, model);

                return this._fetchPageModelFromStore();
            });
        } else if (!PathUtils.isBrowser()) {
            throw new Error(`Attempting to retrieve model data from a non-browser.
                Please provide the initial data with the property key model`
            );
        }
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
    public getData<M extends Model>(config?: ModelManagerConfiguration | string): Promise<M> {
        let path = '';
        let forceReload = false;

        if (typeof config === 'string') {
            path = config;
        } else if (config) {
            path = config.path || '';
            forceReload = !!config.forceReload;
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

                // If data to be fetched for a component in a page not yet retrieved
                // 1.Fetch the page data and store it
                // 2.Return the required item data from the fetched page data
                if (PathUtils.isItem(path)) {
                    const { pageData, pagePath } = this._fetchParentPage(path);

                    if (!pageData) {
                        return this._fetchData(pagePath).then((data: Model) => {
                            this._storeData(pagePath, data);

                            return this.modelStore.getData(path);
                        });
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
                if (this._isRemoteApp()) {
                    triggerPageModelLoaded(obj);
                }

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
     * Removes redundant string or object check for path
     * @return {object}
     * @private
     */
    private _toModelConfig(config?: ModelManagerConfiguration | string): ModelManagerConfiguration {
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

    /**
     * Fetches parent page information of the given component path
     * Returns object containing
     * 1. Parent page path
     * 2. Parent page data if already available in the store
     * @return {object}
     * @private
     */
    private _fetchParentPage(path: string) {
        const dataPaths = PathUtils.splitPageContentPaths(path);
        const pagePath = dataPaths?.pagePath || '';
        const pageData = this.modelStore.getData(pagePath);

        return {
            pageData,
            pagePath
        };
    }

    /**
     * Checks if the currently open app in aem editor is a remote app
     * @private
     * @returns true if remote app
     */
    private _isRemoteApp() {
        const aemApiHost = this.modelClient.apiHost;

        return PathUtils.isBrowser() && aemApiHost && (PathUtils.getCurrentURL() !== aemApiHost);
    }
}

export default new ModelManager();
