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

import { normalize as normalizePath } from 'path';
import url from 'url';
import Constants from './Constants';
import InternalConstants from './InternalConstants';
import MetaProperty from './MetaProperty';

/**
 * Regexp used to extract the context path of a location.
 * The context path is extracted by assuming that the location starts with the context path followed by one of the following node names.
 * @private
 */
const CONTEXT_PATH_REGEXP = /(?:\/)(?:content|apps|libs|etc|etc.clientlibs|conf|mnt\/overlay)(?:\/)/;

/**
 * @private
 */
const JCR_CONTENT_PATTERN = "(.+)/" + Constants.JCR_CONTENT + "/(.+)";

/**
 * Helper functions related to path manipulation.
 * @private
 */
export class PathUtils {
    /**
     * Returns if the code executes in the browser context or not by checking for the
     * existance of the window object
     *
     * @returns The result of the check of the existance of the window object.
     */
    public static isBrowser(): boolean {
        return typeof window !== 'undefined';
    }

    /**
     * Returns the context path of the given location.
     * If no location is provided, it fallbacks to the current location.
     * @param [location] Location to be used to detect the context path from.
     * @returns
     */
    public static getContextPath(location?: string | null): string {
        const path = location || this.getCurrentPathname();

        if (!path) {
            return '';
        }

        const matches = path.match(CONTEXT_PATH_REGEXP);
        const index = (matches === null) ? -1 : (matches.index || -1);
        const contextPath = (index > 0) ? path.slice(0, index) : '';

        return contextPath;
    }

    /**
     * Adapts the provided path to a valid model path.
     * Returns an empty string if the given path is equal to the root model path.
     * This function is a utility tool that converts a provided root model path into an internal specific empty path
     *
     * @param [path] Raw model path.
     * @private
     * @return The valid model path.
     */
    public static adaptPagePath(path: string, rootPath?: string) {
        if (!path) {
            return '';
        }

        const localPath = PathUtils.internalize(path);

        if (!rootPath) {
            return localPath;
        }

        const localRootModelPath = PathUtils.sanitize(rootPath);

        return (localPath === localRootModelPath) ? '' : localPath;
    }

    /**
     * Returns the given URL externalized by adding the optional context path.
     * @param url URL to externalize.
     * @returns
     */
    public static externalize(url: string): string {
        const contextPath = this.getContextPath();
        const externalizedPath = url.startsWith(contextPath) ? url : `${contextPath}${url}`;

        return externalizedPath;
    }

    /**
     * Returns the given URL internalized by removing the optional context path.
     * @param url URL to internalize.
     * @returns
     */
    public static internalize(url: string | null): string {
        if (!url || (typeof url !== 'string')) {
            return '';
        }

        const contextPath = this.getContextPath();
        const internalizedPath = url.replace(new RegExp(`^${contextPath}/`), '/');

        return internalizedPath;
    }

    /**
     * Returns the value of the meta property with the given key.
     * @param propertyName Name of the meta property.
     * @return
     */
    public static getMetaPropertyValue(propertyName: string): string | null {
        let value = null;

        if (this.isBrowser()) {
            const meta = document.head.querySelector(`meta[property="${propertyName}"]`);

            value = meta ? meta.getAttribute('content') : null;
        }

        return value;
    }

    /**
     * Returns a model path for the given URL.
     * @param url Raw URL for which to get a model URL.
     */
    public static convertToModelUrl(url: string): string | undefined {
        return url && url.replace && url.replace(/\.htm(l)?$/, InternalConstants.DEFAULT_MODEL_JSON_EXTENSION);
    }

    /**
     * Returns the model URL as contained in the current page URL.
     */
    public static getCurrentPageModelUrl(): string | null {
        // extract the model from the pathname
        const currentPath: string | null  = this.getCurrentPathname();
        let url = null;

        if (currentPath) {
            url = this.convertToModelUrl(currentPath) || null;
        }

        return url;
    }

    /**
     * Returns the URL of the page model to initialize the page model manager with.
     * It is either derived from a meta tag property called 'cq:pagemodel_root_url' or from the given location.
     * If no location is provided, it derives it from the current location.
     * @param [url]   - path or URL to be used to derive the page model URL from
     * @returns
     */
    public static getModelUrl(url?: string) {
        // Model path extracted from the given url
        if (url && url.replace) {
            return this.convertToModelUrl(url);
        }

        // model path from the meta property
        const metaModelUrl = this.getMetaPropertyValue(MetaProperty.PAGE_MODEL_ROOT_URL);

        if (metaModelUrl) {
            return metaModelUrl;
        }

        // Model URL extracted from the current page URL
        return this.getCurrentPageModelUrl();
    }

    /**
     * Returns the given path after sanitizing it.
     * This function should be called on page paths before storing them in the page model,
     * to make sure only properly formatted paths (e.g., "/content/mypage") are stored.
     * @param path - Path of the page to be sanitized.
     */
    public static sanitize(path: string | null) {
        if (!path || (typeof path !== 'string')) {
            return null;
        }

        // Parse URL, then remove protocol and domain (if they exist).
        // Important: URLs starting with "//some/path" will resolve to
        // "http://some/path" or "https://some/path" (note that the first
        // substring will be used as the hostname)
        let sanitizedPath = url.parse(path, false, true).pathname;

        // Remove context path (if it exists)
        if (sanitizedPath) {
            sanitizedPath = this.internalize(sanitizedPath);

            // Remove selectors (if they exist)
            const selectorIndex = sanitizedPath.indexOf('.');

            if (selectorIndex > -1) {
                sanitizedPath = sanitizedPath.substr(0, selectorIndex);
            }

            // Normalize path (replace multiple consecutive slashes with a single
            // one). It's important that the final sanitized URL does not start with
            // "//" as this might lead to resources from other sites being loaded
            sanitizedPath = normalizePath(sanitizedPath);
        }

        return sanitizedPath;
    }

    /**
     * Returns the given path extended with the given extension.
     * @param path - Path to be extended.
     * @param extension - Extension to be added.
     */
    public static addExtension(path: string, extension: string): string {
        if (!extension || extension.length < 1) {
            return path;
        }

        if (!extension.startsWith('.')) {
            extension = `.${extension}`;
        }

        if (!path || (path.length < 1) || (path.indexOf(extension) > -1)) {
            return path;
        }

        let extensionPath = path;

        // Groups
        // 1. the resource
        // 2. the selectors and the extension
        // 3. the suffix
        // 4. the parameters
        const match = /^((?:[/a-zA-Z0-9:_-]*)+)(?:\.?)([a-zA-Z0-9._-]*)(?:\/?)([a-zA-Z0-9/._-]*)(?:\??)([a-zA-Z0-9=&]*)$/g.exec(
            path,
        );

        let queue = '';

        if (match && (match.length > 2)) {
            // suffix
            queue = match[3] ? `/${match[3]}` : '';

            // parameters
            queue += match[4] ? `?${match[4]}` : '';

            extensionPath =
                match[1] +
                '.' +
                match[2].replace(/\.htm(l)?/, extension) +
                queue;
        }

        return (extensionPath.indexOf(extension) > -1)
            ? extensionPath
            : (extensionPath + extension + queue).replace(/\.\./g, '.');
    }

    /**
     * Returns the given path extended with the given selector.
     * @param path - Path to be extended.
     * @param selector - Selector to be added.
     */
    public static addSelector(path: string, selector: string) {
        if (!selector || (selector.length < 1)) {
            return path;
        }

        if (!selector.startsWith('.')) {
            selector = `.${selector}`;
        }

        if (!path || (path.length < 1) || (path.indexOf(selector) > -1)) {
            return path;
        }

        const index = path.indexOf('.') || path.length;

        if (index < 0) {
            return path + selector;
        }

        return path.slice(0, index) + selector + path.slice(index, path.length);
    }

    /**
     * Returns the current location as a string.
     */
    public static getCurrentPathname(): string | null {
        return this.isBrowser() ? window.location.pathname : null;
    }

    /**
     * Returns empty string or current URL if called in the browser.
     * @returns Current URL.
     */
    public static getCurrentURL(): string {
        return this.isBrowser() ? window.location.href : '';
    }

    /**
     * Dispatches a custom event on the window object, when in the browser context.
     * @param eventName The name of the custom event.
     * @param options The custom event options.
     */
    public static dispatchGlobalCustomEvent(eventName: string, options: any): void {
        if (this.isBrowser()) {
            window.dispatchEvent(new CustomEvent(eventName, options));
        }
    }

    /**
     * Joins given path segments into a string using slash.
     */
    public static join(paths?: string[]): string {
        return paths ? this.normalize(paths.filter((path) => path).join('/')) : '';
    }

    /**
     * Normalizes given path by replacing repeated slash with a single one.
     */
    public static normalize(path?: string): string {
        const normalizedPath = path ? path.replace(/\/+/g, '/') : '';

        return normalizedPath;
    }

    /**
     * Returns path that starts with slash.
     */
    public static makeAbsolute(path?: string): string {
        if (!path || (typeof path !== 'string')) {
            return '';
        }

        return path.startsWith('/') ? path : `/${path}`;
    }

    /**
     * Returns path without the leading slash.
     */
    public static makeRelative(path?: string): string {
        if (!path || (typeof path !== 'string')) {
            return '';
        }

        return path.startsWith('/') ? path.slice(1) : path;
    }

    /**
     * Returns path to the direct parent.
     */
    public static getParentNodePath(path: string | null) {
        if (path && (path.length > 0)) {
            const splashIndex = path.lastIndexOf('/') + 1;

            if (splashIndex < path.length) {
                return path.substring(0 , splashIndex - 1);
            }
        }

        return null;
    }

    /**
     * Checks if given path is an JCR path.
     */
    public static isItem(path: string): boolean {
        return new RegExp(JCR_CONTENT_PATTERN).test(path);
    }

    /**
     * Returns the name of the last node of the given path.
     */
    public static getNodeName(path: string): string | null {
        const chunks = (typeof path === 'string') ? path.replace(/\/+/g, '/').split(/\//).filter(Boolean) : [];
        const result = chunks.pop() || null;

        return result;
    }

    /**
     * Returns the subpath of the targetPath relative to the rootPath,
     * or the targetPath if the rootPath is not a root of the targetPath.
     */
    public static subpath(targetPath?: string, rootPath?: string) {
        if (!targetPath) {
            return '';
        }

        const targetPathChildren = PathUtils.makeRelative(targetPath).split('/');
        const rootPathChildren = PathUtils.makeRelative(rootPath).split('/');

        if (targetPathChildren.length < rootPathChildren.length) {
            return targetPath;
        }

        let index;

        for (index = 0; index < rootPathChildren.length; ++index) {
            if (targetPathChildren[index] !== rootPathChildren[index]) {
                break;
            }
        }

        if (index === rootPathChildren.length) {
            return targetPathChildren.slice(index).join('/');
        } else {
            return targetPath;
        }
    }

    /**
     * Returns an array of segments of the path, split by the custom set of delimitators passed as an array.
     */
    public static splitByDelimitators(path: string, delimitators: string[]) {
        let paths = [path];

        delimitators.forEach((delimitator) => {
            let newPaths: string[] = [];
            const delim = PathUtils.normalize(PathUtils.makeAbsolute(delimitator) + '/');

            paths.forEach((path) => {
                newPaths = newPaths.concat(path.split(delim));

                if (path.endsWith(delimitator)) {
                    const lastPath = newPaths.splice(newPaths.length - 1, 1)[0];

                    if (lastPath !== delimitator) {
                        newPaths = newPaths.concat(lastPath.split(PathUtils.makeAbsolute(delimitator)));
                    }
                }

                newPaths = newPaths.filter((path) => path);
            });

            paths = newPaths;
        });

        return paths;
    }

    /**
     * Returns an JCR path based on pagePath and dataPath.
     * @param pagePath Path to the page.
     * @param dataPath Path to the item on the page.
     */
    public static _getJCRPath(pagePath: string, dataPath: string): string {
        return [ pagePath, Constants.JCR_CONTENT, dataPath ].join('/');
    }

    /**
     * Returns object containing pagePath (path to a page) and, if exists, itemPath (path to the item on that page)
     * from the passed path.
     */
    public static splitPageContentPaths(path: string): {itemPath?: string; pagePath: string} | undefined {
        if (!path && (typeof path !== 'string')) {
            return;
        }

        const splitPaths = path.split(`/${Constants.JCR_CONTENT}/`);

        const split = {
            pagePath: splitPaths[0],
        };

        if (splitPaths.length > 1) {
            // @ts-ignore
            split.itemPath = splitPaths[1];
        }

        return split;
    }

    /**
     * Returns path that is no longer prefixed nor suffixed by the set of strings passed as an array.
     */
    public static trimStrings(path: string, strings: string[]): string {
        strings.forEach((str) => {
            while (path.startsWith(str)) {
                path = PathUtils.makeRelative(path.slice(str.length));
            }

            while (path.endsWith(str)) {
                path = path.slice(0, path.length - str.length);

                if (path.endsWith('/')) {
                    path = path.slice(0, path.length - 1);
                }
            }
        });

        return path;
    }

    public static _getStartStrings(path: string, strings: string[]): string {
        let returnStr = '';

        strings.forEach((str) => {
            while (path.startsWith(str)) {
                path = PathUtils.makeRelative(path.slice(str.length));
                returnStr = `${returnStr}/${str}`;
            }
        });

        return PathUtils.makeRelative(returnStr);
    }
}
