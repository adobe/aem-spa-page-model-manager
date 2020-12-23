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

import { AEM_MODE } from './Constants';
import { PathUtils } from './PathUtils';
import MetaProperty from './MetaProperty';

export class AuthoringUtils {
    private readonly _apiDomain: string | null;

    /**
     * Base path for editor clientlibs.
     */
    public static readonly EDITOR_CLIENTLIB_PATH = '/etc.clientlibs/cq/gui/components/authoring/editors/clientlibs/';

    /**
     * Authoring libraries.
     */
    public static readonly AUTHORING_LIBRARIES = {
        JS: [
            AuthoringUtils.EDITOR_CLIENTLIB_PATH + 'internal/messaging.js',
            AuthoringUtils.EDITOR_CLIENTLIB_PATH + 'utils.js',
            AuthoringUtils.EDITOR_CLIENTLIB_PATH + 'internal/page.js',
            AuthoringUtils.EDITOR_CLIENTLIB_PATH + 'internal/pagemodel/messaging.js'
        ],
        CSS: [
            AuthoringUtils.EDITOR_CLIENTLIB_PATH + 'internal/page.css'
        ],
        META: {
            'cq:datatype': 'JSON'
        }
    };

    /**
     * @private
     */
    constructor(domain: string | null) {
        this._apiDomain = domain;
    }

    /**
     * @private
     */
    getApiDomain(): string | null {
        return this._apiDomain;
    }

    /**
     * Generates <script> and <link> tags.
     * The document fragment needs to be added to the page to enable AEM Editing capabilities.
     *
     * Example:
     * ```
     * import ModelManager, Constants, { AEM_MODE } from '@adobe/aem-spa-page-model-manager';
     *
     * await ModelManager.initialize({modelClient: new ModelClient(REMOTE_AEM_HOST)});
     * const docFragment = ModelManager.clientlibUtil.getAemLibraries();
     * window.document.head.appendChild(docFragment);
     * ```
     *
     * If you don't want to inject arbitrary html tags, please refer to AuthoringUtils.AUTHORING_LIBRARIES and create the tags manually.
     *
     * @returns HTML markup including state specific libraries.
     */
    public getAemLibraries(): DocumentFragment {
        const docFragment: DocumentFragment = document.createDocumentFragment();

        if (!AuthoringUtils.isEditMode()) {
            return docFragment;
        }

        const jsUrls = this.prependDomain(AuthoringUtils.AUTHORING_LIBRARIES.JS);
        const cssUrls = this.prependDomain(AuthoringUtils.AUTHORING_LIBRARIES.CSS);
        const metaInfo = AuthoringUtils.AUTHORING_LIBRARIES.META;

        jsUrls.forEach((url: string) => {
            const htmlScriptElement = document.createElement('script');

            htmlScriptElement.type = 'text/javascript';
            htmlScriptElement.src = url;
            docFragment.appendChild(htmlScriptElement);
        });

        cssUrls.forEach((url: string) => {
            const linkElement = document.createElement('link');

            linkElement.type = 'text/css';
            linkElement.rel = 'stylesheet';
            linkElement.href = url;
            docFragment.appendChild(linkElement);
        });

        Object.entries(metaInfo).forEach((entry) => {
            const [ key, val ] = entry;
            const metaElement = document.createElement('meta');

            metaElement.setAttribute('property', key);
            metaElement.content = val;
            docFragment.appendChild(metaElement);
        });

        return docFragment;
    }

    /**
     * Checks if edit mode is on.
     * @returns `true` if application is in AEM `EDIT` mode.
     */
    public static isEditMode(): boolean {
        const viaMetaProperty = PathUtils.getMetaPropertyValue(MetaProperty.WCM_MODE) === AEM_MODE.EDIT;
        const viaQueryParam = PathUtils.isBrowser() && (AuthoringUtils.getAemMode() === AEM_MODE.EDIT);

        return viaMetaProperty || viaQueryParam;
    }

    /**
     * Checks AEM mode.
     * @private
     * @returns AEM mode or `null`.
     */
    private static getAemMode(): string {
        let url: URL;

        try {
            url = new URL(PathUtils.getCurrentURL());

            return url.searchParams.get(MetaProperty.WCM_MODE) || '';
        } catch (e) {
            // invalid url
        }

        return '';
    }

    /**
     * Generates urls to authoring clientlibs.
     * @private
     * @returns Clientlib URLs.
     */
    private prependDomain(libraries: string[]): string[] {
        const result: string[] = [];
        const domain = this.getApiDomain();

        libraries.forEach((library) => {
            result.push(`${domain ? domain : ''}${library}`);
        });

        return result;
    }
}
