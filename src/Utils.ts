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
import { PathUtils } from "./PathUtils";
import Constants from "./Constants";

export class Utils {

    /**
     * Returns true if the editor is in Edit Mode
     *
     * @returns {Boolean} the result of the check of the Editor mode
     */
    public static isEditMode(): boolean {
        const aemMode = PathUtils.getMetaPropertyValue(MetaProperty.WCM_MODE);
        if (aemMode != null) {
            return aemMode === Constants.AEM_MODE_EDIT;
        }
        else {
            if (PathUtils.isBrowser()) {
                const param = new URL(document.location.href).searchParams.get(Constants.AEM_MODE_KEY);
                return param === Constants.AEM_MODE_EDIT;
            }
            else {
                return false;
            }
        }
    }

    /**
     * Appends javascript to the page
     */
    public static appendScripts(clientLibUrl : string) : void {
        const script = document.createElement('script');
        const scripts = document.getElementsByTagName('script')[0];
        script.src = clientLibUrl;
        if (scripts.parentNode) {
            scripts.parentNode.insertBefore(script, scripts);
        }
    }
    /**
     * Appends stylesheets to the page
     */
    public static appendStyleSheets(clientLibUrl : string) : void {
        const link = document.createElement('link');
        const links = document.getElementsByTagName('link')[0];
        link.href = clientLibUrl;
        if (links.parentNode) {
            links.parentNode.insertBefore(link, links);
        }
    }

    /**
     * Generates clientlib url
     */
    public static generateClientLibsUrl(domain : string) : string[] {
        const clientlibs: string[] =  Array<string>();
        const path = '/etc.clientlibs/cq/gui/components/authoring/editors/clientlibs/internal/';
        clientlibs.push(`${domain}${path}page.js`);
        clientlibs.push(`${domain}${path}page.css`);
        clientlibs.push(`${domain}${path}pagemodel/messaging.js`);
        clientlibs.push(`${domain}${path}messaging.js`);
        return clientlibs;
    }

    /**
     * Returns true if editor loaded remotely
     */
    public static appendClientLibs(domain : string) : void {
        const clientLibUrls = Utils.generateClientLibsUrl(domain);
        clientLibUrls.forEach(lib => {
            if (lib.endsWith('.js')) {
                this.appendScripts(lib);
            }
            else {
                this.appendStyleSheets(lib);
            }
        });
    }

    /**
     * Returns true if editor loaded remotely
     */
    public static isAsync(domain : string) : boolean {
        return domain === PathUtils.getCurrentPathname() ? false :  true;
    }
}