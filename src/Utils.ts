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

import MetaProperty from "./MetaProperty";
import {PathUtils} from "./PathUtils";

export class Utils {

    /**
     * Returns true if the editor is in Edit Mode
     *
     * @returns {Boolean} the result of the check of the Editor mode
     */
    public static isEditMode(): boolean {
        return PathUtils.getMetaPropertyValue(MetaProperty.WCM_MODE) === "edit" ? true : false;
    }

    /**
     * Appends client lib to the page
     */
    public static appendClientLibs(clientLibUrl : string) {
        const script = document.createElement('script');
        const scripts = document.getElementsByTagName('script')[0];
        script.src = clientLibUrl;
        if (scripts.parentNode) {
            scripts.parentNode.insertBefore(script, scripts);
        }
    }


    /**
     * Generates clientlib url
     */
    public static generateClientLibsUrl(pageModelRoot : string, domain : string) : string {
        let clientLibPath = '';
        if (pageModelRoot != null) {
            clientLibPath = domain + '/etc.clientlibs/' +  pageModelRoot.split("/")[2] + '/clientlibs/clientlib-base.min.js';
        }
        else {
            throw new Error('Clientlib path cannot be determined! This should never happen.');
            return "";
        }
        return clientLibPath;
    }
}