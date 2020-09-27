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
 * Meta property names associated with the PageModelProvider and ModelRouter.
 * @private
 */
export class MetaProperty {
    /**
     * Meta property pointing to page model root.
     */
    public static readonly PAGE_MODEL_ROOT_URL = 'cq:pagemodel_root_url';

    /**
     * Meta property pointing to route filters.
     */
    public static readonly PAGE_MODEL_ROUTE_FILTERS = 'cq:pagemodel_route_filters';

    /**
     * Meta property pointing to model router.
     */
    public static readonly PAGE_MODEL_ROUTER = 'cq:pagemodel_router';

    /**
     * Meta property pointing to wcm mode.
     */
    public static readonly WCM_MODE = 'cq:wcmmode';

    private constructor() {
        // hide constructor
    }
}

export default MetaProperty;
