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

import clone from 'clone';
import Constants from './Constants';
import { Model } from './Model';
import { PathUtils } from './PathUtils';

/**
 * Item wrapper containing information about the item parent.
 * @private
 */
interface ItemWrapper {
    parent?: Model;
    parentPath?: string;
    data?: Model;
    key?: string;
}
/**
 * The ModelStore is in charge of providing access to the data model. It provides the CRUD operations over the model.
 * To protect the integrity of the data it initially returns immutable data. If needed, you can request a mutable object.
 */
export class ModelStore {
    private _pageContentDelimiter: string[] | null;
    private _data: Model | null = null;
    private _rootPath: string | null = null;

    /**
     * @param [rootPath] Root path of the model.
     * @param [data] Initial model.
     * @private
     */
    constructor(rootPath?: string, data?: Model) {
        this._data = {};
        if (rootPath) {
            this.initialize(rootPath, data ? data : {});
        }
        this._pageContentDelimiter = [Constants.JCR_CONTENT];
    }

    /**
     * Initializes the the ModelManager.
     * @param rootPath Model root path.
     * @param data Initial model.
     * @private
     */
    public initialize(rootPath: string, data: Model) {
        if (data) {
            this._data = data;
        }

        this._rootPath = rootPath;
    }

    /**
     * Returns the current root path.
     * @returns Model root path.
     */
    public get rootPath(): string {
        return this._rootPath || '';
    }

    /**
     * Returns page model.
     * @returns Page model.
     */
    public get dataMap(): any {
        return this._data;
    }

    /**
     * Replaces the data in the given location.
     * @param path Path of the data.
     * @param newData New data to be set.
     * @private
     */
    public setData(path: string, newData: any = {}) {
        const itemKey = PathUtils.getNodeName(path);

        if (itemKey) {
            const data = this.getData(PathUtils.getParentNodePath(path), false);

            if (data && data[Constants.ITEMS_PROP]) {
                const localData = clone(newData);
                const items = data[Constants.ITEMS_PROP] || {};

                items[itemKey] = localData.value;
                data[Constants.ITEMS_PROP] = items;
            }
        }
    }

    /**
     * Returns the data for the given path. If no path is provided, it returns the whole data.
     * @param [path] Path to the data.
     * @param [immutable=true] Indicates whether a data clone should be returned.
     * @return Data for given path, whole data or `undefined`.
     */
    public getData<M extends Model>(path?: string | null, immutable = true): M | undefined {
        if (!path && (typeof path !== 'string')) {
            return (immutable ? clone(this._data) : this._data) as M;
        }

        // Request for the root path
        // Returns the full data
        if ((path === this._rootPath) || (path === `${this._rootPath}/${Constants.JCR_CONTENT}`)) {
            return (immutable ? clone(this._data) : this._data) as M;
        }

        const dataPaths = PathUtils.splitPageContentPaths(path);

        if (dataPaths) {
            const pageData = this._getPageData(dataPaths.pagePath);

            // If there is no page
            // or if we are getting the data of a page
            // return the page data
            if (!pageData || !dataPaths.itemPath) {
                return (immutable ? clone(pageData) : pageData) as M;
            }

            const result = this._findItemData(dataPaths.itemPath, pageData);

            if (result) {
                return (immutable ? clone(result.data) : result.data) as M;
            }
        }
    }

    /**
     * Insert the provided data at the location of the given path. If no sibling name is provided the data is added at the end of the list.
     * @param path Path to the data.
     * @param data Data to be inserted.
     * @param [siblingName] Name of the item before or after which to add the data.
     * @param [insertBefore=false] Should the data be inserted before the sibling.
     * @private
     */
    public insertData(path: string, data: Model, siblingName?: string | null, insertBefore = false) {
        data = clone(data);

        // We need to find the parent
        if (!path) {
            console.warn(`No path provided for data: ${data}`);
            return;
        }

        const isItem = PathUtils.isItem(path);

        if (!isItem && this._data) {
            // Page data
            if (!this._data[Constants.CHILDREN_PROP]) {
                this._data[Constants.CHILDREN_PROP] = {};
            }

            // @ts-ignore
            this._data[Constants.CHILDREN_PROP][path] = data;

            return;
        }

        // Item data
        const dataPaths = PathUtils.splitPageContentPaths(path);

        if (dataPaths && dataPaths.itemPath) {
            const pageData = this._getPageData(dataPaths.pagePath);
            const result = this._findItemData(dataPaths.itemPath, pageData);
            const parent = result.parent || pageData || this._data;
            const itemName = PathUtils.getNodeName(dataPaths.itemPath);

            if ((itemName != null) && parent && Object.prototype.hasOwnProperty.call(parent, Constants.ITEMS_PROP)) {
                const items = parent[Constants.ITEMS_PROP];

                if (items) {
                    items[itemName] = data;
                    const itemsOrder: string[] | undefined = parent[Constants.ITEMS_ORDER_PROP];

                    if ((itemsOrder != null) && (itemsOrder.length > 0) && (siblingName != null)) {
                        const index = itemsOrder.indexOf(siblingName);

                        if (index > -1) {
                            itemsOrder.splice(insertBefore ? index : (index + 1), 0, itemName);
                        } else {
                            itemsOrder.push(itemName);
                        }
                    }
                }
            }
        }
    }

    /**
     * Removes the data located at the provided location.
     * @param path Path of the data.
     * @private
     * @return {string|null} Path to the parent item initially containing the removed data.
     */
    public removeData(path: string): string | null {
        if (!path) {
            return null;
        }

        const isItem = PathUtils.isItem(path);

        if (!isItem && this._data && this._data[Constants.CHILDREN_PROP]) {
            // Page data
            delete this._data[Constants.CHILDREN_PROP]?.[path];

            return null;
        }

        // Item data
        const dataPaths = PathUtils.splitPageContentPaths(path);

        if (dataPaths && dataPaths.itemPath) {
            const pageData = this._getPageData(dataPaths.pagePath);
            const result = this._findItemData(dataPaths.itemPath, pageData);

            if (result.data) {
                if (result && result.parent && Object.prototype.hasOwnProperty.call(result.parent, Constants.ITEMS_PROP)) {
                    const { parent } = result;
                    const items = parent[Constants.ITEMS_PROP];
                    const itemName = PathUtils.getNodeName(dataPaths.itemPath);

                    if (itemName) {
                        if (items) {
                            delete items[itemName];
                        }

                        delete result.data;
                        delete result.parent;

                        const itemsOrder: string[] | undefined = parent[Constants.ITEMS_ORDER_PROP];

                        if (itemsOrder && (itemsOrder.length > 0)) {
                            const index = itemsOrder.indexOf(itemName);
                            itemsOrder.splice(index, 1);
                        }

                        return result.parentPath ? result.parentPath : null;
                    }
                }
            }
        }

        console.warn(`Item for path ${path} was not found! Nothing to remove then.`);

        return null;
    }

    /**
     * @private
     */
    public destroy(): void {
        this._data = null;
        this._rootPath = null;
        this._pageContentDelimiter = null;
    }

    /**
     * Retrieves the item and eventually returns the data wrapped with the parent information.
     * @param path Path of the item.
     * @param [data=_data] Data to be explored (must not be null!)
     * @param [parent] Parent data.
     * @param  [parentPath=''] Path of the parent data.
     * @private
     * @return
     */
    private _findItemData(path: string, data= this._data, parent: any = null, parentPath = ''): ItemWrapper {
        const answer: ItemWrapper = {
            parent,
            parentPath
        };

        if (!data) {
            throw new Error('Assertion error: No data provided. This should never happen.');
        }

        const items: { [key: string]: Model } | undefined = data[Constants.ITEMS_PROP];

        if (!items) {
            return answer;
        }

        for (const pathKey in items) {
            if (!Object.prototype.hasOwnProperty.call(items, pathKey)) {
                continue;
            }

            const childItem: Model = items[pathKey];

            // Direct child. We reached the leaf
            if (pathKey === path) {
                answer.data = items[pathKey];
                answer.key = pathKey;

                return answer;
            } else {
                // Continue traversing
                let subPath = PathUtils.subpath(path, pathKey);

                if (this._pageContentDelimiter) {
                    const pageDelimiter = PathUtils._getStartStrings(subPath, this._pageContentDelimiter);
                    const childParentPath = PathUtils.join([parentPath, pathKey, pageDelimiter]);
                    subPath = PathUtils.trimStrings(subPath, this._pageContentDelimiter);

                    if (subPath !== path) {
                        const childItemWrapped: ItemWrapper = this._findItemData(subPath, childItem, childItem, childParentPath);

                        if (childItemWrapped) {
                            return childItemWrapped;
                        }
                    }
                } else {
                    throw new Error('_pageContentDelimiter not set. this should never happen as its set in constructor.');
                }
            }
        }

        return answer;
    }

    /**
     * @param pagePath Path of the page.
     * @private
     * @return Data of the page.
     */
    private _getPageData(pagePath: string): Model | undefined {
        if (!this._data) {
            return;
        }

        if ((pagePath === '') || (pagePath === this._data[Constants.PATH_PROP]) || (pagePath === this.rootPath)) {
            return this._data;
        }

        const children = this._data[Constants.CHILDREN_PROP];

        return children && children[pagePath];
    }
}
