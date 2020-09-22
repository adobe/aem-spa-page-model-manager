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

/**
 * Useful variables for interacting with CQ/AEM components.
 * @namespace Constants
 */
export class Constants {
    /**
     * Type of the item.
     */
    public static readonly TYPE_PROP = ':type';

    /**
     * List of child items of an item.
     */
    public static readonly ITEMS_PROP = ':items';

    /**
     * Order in which the items should be listed.
     */
    public static readonly ITEMS_ORDER_PROP = ':itemsOrder';

    /**
     * Path of an item.
     */
    public static readonly PATH_PROP = ':path';

    /**
     * Children of a hierarchical item.
     */
    public static readonly CHILDREN_PROP = ':children';

    /**
     * Hierarchical type of the item.
     */
    public static readonly HIERARCHY_TYPE_PROP = ':hierarchyType';

    /**
     * JCR content node.
     */
    public static readonly JCR_CONTENT = 'jcr:content';

    /**
     * States.
     */
    public static readonly AUTHORING = 'authoring';

    /**
     * Query param for aem mode flag name.
     */
    public static readonly AEM_MODE_KEY = 'aemmode';

    /**
     * Base path for editor clientlibs.
     */
    public static readonly EDITOR_CLIENTLIB_PATH = '/etc.clientlibs/cq/gui/components/authoring/editors/clientlibs/internal/';

    /**
     * Authoring libraries.
     */
    public static readonly AUTHORING_LIBRARIES = [
        'page.js',
        'page.css',
        'pagemodel/messaging.js',
        'messaging.js'
    ];

    private constructor() {
        // hide constructor
    }
}

/**
 * AEM modes
 */
export enum AEM_MODE {
    EDIT = 'edit',
    PREVIEW = 'preview'
}

/**
 * Valid tag types
 */
export enum TAG_TYPE {
    JS = 'script',
    STYLESHEET = 'stylesheet'
}

/**
 * Valid tag attributes
 */
export enum TAG_ATTR {
    SRC = 'src',
    HREF = 'href'
}

export default Constants;
