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

import Constants, { AEM_MODE, TAG_ATTR, TAG_TYPE } from "./Constants";
import { PathUtils } from "./PathUtils";
import MetaProperty from "./MetaProperty";

export class Utils {
    private static _apiDomain: string | null;

    constructor(domain : string | null) {
        Utils._apiDomain = domain;
    }

    static getApiDomain(): string | null {
        return this._apiDomain;
    }

    /**
     * Returns all the tags for requested state
     *
     * @returns {String} all the tags for requested state
     */
    public static getTagsForState(state : string) : string {
        let tags = '';

        if (state === Constants.AUTHORING) {
            const clientLibs = this.generateClientLibsUrl();

            tags = clientLibs.map(resource => {
                if (resource.endsWith('.js')) {
                    return this.generateElementString(TAG_TYPE.JS, TAG_ATTR.SRC, resource);
                } else if (resource.endsWith('.css')) {
                    return this.generateElementString(TAG_TYPE.STYLESHEET, TAG_ATTR.HREF, resource);
                }
            }).join('');
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

        if (tagType === TAG_TYPE.JS) {
            tag = `<script ${attr}='${attrValue}'></script>`;
        } else if (tagType === TAG_TYPE.STYLESHEET) {
            tag = `<link ${attr}='${attrValue}'/>`;
        }

        return tag;
    }

    /**
     * Returns if requested state is active
     *
     * @returns {boolean} the result of the check of the state
     */
    public static isStateActive(state : string) : boolean {
        if (state === Constants.AUTHORING) {
            const viaMetaProperty = PathUtils.getMetaPropertyValue(MetaProperty.WCM_MODE) === AEM_MODE.EDIT;
            const viaQueryParam = PathUtils.isBrowser() && (Utils.getEditParam() === AEM_MODE.EDIT);

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
        let url : URL;

        try {
            url = new URL(PathUtils.getCurrentURL());
            return url.searchParams.get(Constants.AEM_MODE_KEY);
        } catch (e) {
            // Invalid current url
        }

        return null;
    }

    /**
     * Generates clientlib url
     * @returns {string[]} all the clientlib urls
     */
    public static generateClientLibsUrl() : string[] {
        const clientlibs: string[] =  [];
        const path = Constants.EDITOR_CLIENTLIB_PATH;
        const domain = Utils.getApiDomain();

        if (domain) {
            clientlibs.push(`${domain}${path}page.js`);
            clientlibs.push(`${domain}${path}page.css`);
            clientlibs.push(`${domain}${path}pagemodel/messaging.js`);
            clientlibs.push(`${domain}${path}messaging.js`);
        }

        return clientlibs;
    }
}
