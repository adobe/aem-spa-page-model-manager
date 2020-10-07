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

import EventType from './EventType';
import MetaProperty from './MetaProperty';
import ModelManager from './ModelManager';
import { PathUtils } from './PathUtils';

/**
 * <p>The ModelRouter listens for HTML5 History API <i>popstate</i> events and calls {@link PageModelManager#getData()} with the model path it extracted from the URL.</p>
 *
 * <h2>Configuration</h2>
 *
 * <p>The Model Router can be configured using meta properties located in the head section of the document.</p>
 *
 * <h3>Meta properties</h3>
 * <ul>
 *     <li>cq:page_model_router - default=undefined, options=disable</li>
 *     <li>cq:page_model_route_filters - default=undefined, options=RegExp<></li>
 * </ul>
 *
 * <h3>Defaults</h3>
 * <ul>
 *     <li>The ModelRouter is enabled and uses the <i>History</i> API to extract the model path from the current content path</li>
 * </ul>
 *
 * <h3>Examples and Usages</h3>
 *
 * <h4>Disables the page model router</h4>
 * <pre>
 *     <code>e.g. &lt;meta property="cq:page_model_router" content="disable"\&gt;</code>
 * </pre>
 *
 * <h4>Filters paths from the model routing with the given patterns</h4>
 * <pre>
 *     <code>e.g. &lt;meta property="cq:page_model_route_filters" content="route/not/found,^(.*)(?:exclude/path)(.*)"\&gt;</code>
 * </pre>
 *
 * @module ModelRouter
 */

/**
 * Modes in which the Model Router operates.
 * @private
 */
export class RouterModes {
    /**
     * Flag that indicates that the model router should be disabled.
     */
    public static readonly DISABLED = 'disabled';

    /**
     * Flag that indicates that the model router should extract the model path from the content path section of the URL.
     */
    public static readonly CONTENT_PATH = 'path';

    private constructor() {
       // hide constructor
    }
}

/**
 * Returns the model path. If no URL is provided the current window URL is used
 * @param [url] url from which to extract the model path
 * @private
 * @return
 */
export function getModelPath(url?: string | null): string {
    const localUrl = url || window.location.pathname;

    // The default value model path comes as the the content path
    let endPosition = localUrl.indexOf('.');

    if (endPosition < 0) {
        // If the path is missing extension and has query params instead eg. http://zyx/abc?test=test
        const queryPosition = localUrl.indexOf('?');

        endPosition = (queryPosition < 0) ? localUrl.length : queryPosition;
    }

    return localUrl.substr(0, endPosition);
}

/**
 * Returns the list of provided route filters
 *
 * @returns {string[]}
 *
 * @private
 */
export function getRouteFilters(): string[] {
    const routeFilters = PathUtils.getMetaPropertyValue(MetaProperty.PAGE_MODEL_ROUTE_FILTERS);

    return routeFilters ? routeFilters.split(',') : [];
}

/**
 * Should the route be excluded
 *
 * @param route
 * @returns {boolean}
 *
 * @private
 */
export function isRouteExcluded(route: string): boolean {
    const routeFilters = getRouteFilters();

    for (let i = 0, length = routeFilters.length; i < length; i++) {
        if (new RegExp(routeFilters[i]).test(route)) {
            return true;
        }
    }

    return false;
}

/**
 * Is the model router enabled. Enabled by default
 * @returns {boolean}
 * @private
 */
export function isModelRouterEnabled(): boolean {
    if (!PathUtils.isBrowser()) {
        return false;
    }

    const modelRouterMetaType = PathUtils.getMetaPropertyValue(MetaProperty.PAGE_MODEL_ROUTER);

    // Enable the the page model routing by default
    return !modelRouterMetaType || (RouterModes.DISABLED !== modelRouterMetaType);
}

/**
 * Fetches the model from the PageModelManager and then dispatches it
 *
 * @fires cq-pagemodel-route-changed
 *
 * @param {string} [path]   - path of the model to be dispatched
 *
 * @private
 */
export function dispatchRouteChanged(path: string): void {
    // Triggering the page model manager to load a new child page model
    // No need to use a cache as the PageModelManager already does it
    ModelManager.getData({ path }).then((model) => {
        PathUtils.dispatchGlobalCustomEvent(EventType.PAGE_MODEL_ROUTE_CHANGED, {
            detail: {
                model
            }
        });
    });
}

/**
 * Triggers the PageModelManager to fetch data based on the current route
 *
 * @fires cq-pagemodel-route-changed - with the root page model object
 *
 * @param {string} [url]    - url from which to extract the model path
 *
 * @private
 */
export function routeModel(url?: string | null): void {
    if (!isModelRouterEnabled()) {
        return;
    }

    const path = getModelPath(url);

    // don't fetch the model
    // for the root path
    // or when the route is excluded
    if (!path || ('/' === path) || isRouteExcluded(path)) {
        return;
    }

    dispatchRouteChanged(path);
}

// Activate the model router
if (isModelRouterEnabled()) {
    // Encapsulate the history.pushState and history.replaceState functions to prefetch the page model for the current route
    const pushState = window.history.pushState;
    const replaceState = window.history.replaceState;

    window.history.pushState = (state, title, url) => {
        routeModel(url || null);

        return pushState.apply(history, [ state, title, url ]);
    };

    window.history.replaceState = (state, title, url) => {
        routeModel(url || null);

        return replaceState.apply(history, [ state, title, url ]);
    };

    window.onpopstate = (history: any) => {
        const currentPath = history?.target?.location?.pathname;

        routeModel(currentPath || null);
    };

}
