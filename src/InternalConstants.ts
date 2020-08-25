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

const DEFAULT_SLING_MODEL_SELECTOR = 'model';

export class InternalConstants {
    /**
     * Sling model selector.
     */
    public static readonly DEFAULT_SLING_MODEL_SELECTOR = DEFAULT_SLING_MODEL_SELECTOR;

    /**
     * JSON model extension.
     */
    public static readonly DEFAULT_MODEL_JSON_EXTENSION = `.${DEFAULT_SLING_MODEL_SELECTOR}.json`;

    private constructor() {
        // hide constructor
    }
}

export default InternalConstants;
