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
 * Type of events triggered or listened by the PageModelManager and ModelRouter.
 * @private
 */
export class EventType {
    /**
     * Event which indicates that the PageModelManager has been initialized
     */
    public static readonly PAGE_MODEL_INIT = 'cq-pagemodel-init';

    /**
     * Event which indicates that the PageModelManager has loaded new content
     */
    public static readonly PAGE_MODEL_LOADED = 'cq-pagemodel-loaded';

    /**
     * Event that indicates a request to update the page model
     */
    public static readonly PAGE_MODEL_UPDATE = 'cq-pagemodel-update';

    /**
     * Event which indicates that ModelRouter has identified that model route has changed
     */
    public static readonly PAGE_MODEL_ROUTE_CHANGED = 'cq-pagemodel-route-changed';

    private constructor() {
        // hide constructor
    }
}

export default EventType;
