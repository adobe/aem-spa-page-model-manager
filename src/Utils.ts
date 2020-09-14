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

import Constants from "./Constants";
import { PathUtils } from "./PathUtils";
import MetaProperty from "./MetaProperty";
import { ModelManager } from "./ModelManager";

export class Utils {
    /**
     * Returns all the tags for requested state
     *
     * @returns {String} all the tags for requested state
     */
    public static getTagsForState(state : string) : string {
        let tags = '';
        if (state === Constants.AUTHORING) {
            const clientLibs = this.generateClientLibsUrl();
            clientLibs.forEach(clientlib => {
                if (clientlib.endsWith('.js')) {
                    tags = tags.concat(this.generateElementString('script', 'src', clientlib));
                }
                else if (clientlib.endsWith('.css')) {
                    tags = tags.concat(this.generateElementString('stylesheet', 'href', clientlib));
                }
            });
        }
        return tags;
    }

    /**
     * Returns string value of all the concatenated tags
     *
     * @returns {String} concatenated tags
     */
    private static generateElementString(tagType : string, attr : string, attrValue : string) : string {
        let tag = '';
        if (tagType === 'script') {
            tag = `<script ${attr}='${attrValue}'></script>`;
        }
        else if (tagType === 'stylesheet') {
            tag = `<link ${attr}='${attrValue}'/>`;
        }
        return tag;
    }

    /**
     * Returns if requested state is active
     *
     * @returns {boolean} the result of the check of the state
     */
    public static isState(state : string) : boolean {
        if (state === Constants.AUTHORING) {
            const viaMetaProperty = PathUtils.getMetaPropertyValue(MetaProperty.WCM_MODE) === Constants.AEM_MODE_EDIT;
            const viaQueryParam = PathUtils.isBrowser() && (Utils.getEditParam() === Constants.AEM_MODE_EDIT);

            return viaMetaProperty || viaQueryParam;
        }
        return false;
    }

    /**
     * Returns query parameter value for aem mode.
     *
     * @returns {String | null} the result of the check of the Editor mode
     */
    public static getEditParam() : string | null {
        return new URL(PathUtils.getCurrentURL()).searchParams.get(Constants.AEM_MODE_KEY);
    }

    /**
     * Generates clientlib url
     */
    public static generateClientLibsUrl() : string[] {
        const clientlibs: string[] =  Array<string>();
        const path = '/etc.clientlibs/cq/gui/components/authoring/editors/clientlibs/internal/';
        const domain = this.getDomain();
        clientlibs.push(`${domain}${path}page.js`);
        clientlibs.push(`${domain}${path}page.css`);
        clientlibs.push(`${domain}${path}pagemodel/messaging.js`);
        clientlibs.push(`${domain}${path}messaging.js`);
        return clientlibs;
    }


    /**
     * Gets the domain name of API host
     */
    public static getDomain() : string{
        return ModelManager._domain;
    }
}