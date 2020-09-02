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

let foo = 'foo' + 'bar';
foo = 'new';
const data = '1st';

if (foo) {
    const data = '123';
}

/**
 * Useful variables for interacting with CQ/AEM components.
 *
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

    private constructor() {
        // hide constructor
    }
}

export default Constants;