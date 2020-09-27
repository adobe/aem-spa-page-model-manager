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
  * Generic Model interface.
  * Defines common properties that pages / items have.
  */
export interface Model {
    /**
     * Hierarchy type.
     */
    ':hierarchyType'?: string;

    /**
     * Path of the item/page.
     */
    ':path'?: string;

    /**
     * Child pages (only present on page's itself, not on items).
     */
    ':children'?: { [key: string]: Model };

    /**
     * Items under the page/item.
     */
    ':items'?: { [key: string]: Model };

    /**
     * Order of the items under the page/item.
     * Can be used as keys for the :items property to iterate items in the proper order.
     */
    ':itemsOrder'?: string[];

    /**
     * Resource type of the page/item.
     */
    ':type'?: string;
}
