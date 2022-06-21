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

import * as assert from 'assert';
import { AuthoringUtils } from '../src/AuthoringUtils';
import { PathUtils } from '../src/PathUtils';
import { AEM_MODE } from '../src/Constants';
import MetaProperty from '../src/MetaProperty';

describe('AuthoringUtils ->', () => {
    let authoringUtils: AuthoringUtils;

    beforeEach(() => {
        authoringUtils = new AuthoringUtils('http://www.abc.com');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getAemLibraries', () => {

        it('should return empty DocumentFragment if not in edit mode', () => {
            // given
            jest.spyOn(AuthoringUtils, 'isEditMode').mockReturnValue(false);
            // when

            const libs: DocumentFragment = authoringUtils.getAemLibraries();

            // then
            assert.ok(libs.hasChildNodes() === false);
        });

        it('should return DocumentFragment based on AuthoringUtils.AUTHORING_LIBRARIES', () => {
            // given
            jest.spyOn(AuthoringUtils, 'isRemoteApp').mockReturnValue(true);
            jest.spyOn(AuthoringUtils, 'isEditMode').mockReturnValue(true);
            // when

            const libs: DocumentFragment = authoringUtils.getAemLibraries();

            // then
            assert.ok(libs.hasChildNodes());
            assert.ok(libs.querySelectorAll('script').length === AuthoringUtils.AUTHORING_LIBRARIES.JS.length);
            assert.ok(libs.querySelectorAll('link').length === AuthoringUtils.AUTHORING_LIBRARIES.CSS.length);
            assert.ok(libs.querySelectorAll('meta').length === Object.entries(AuthoringUtils.AUTHORING_LIBRARIES.META).length);
        });

        describe('scripts', () => {
            it('should contain proper script tags', () => {
                // given
                jest.spyOn(AuthoringUtils, 'isRemoteApp').mockReturnValue(true);
                jest.spyOn(AuthoringUtils, 'isEditMode').mockReturnValue(true);
                // when

                const libs: DocumentFragment = authoringUtils.getAemLibraries();

                // then
                AuthoringUtils.AUTHORING_LIBRARIES.JS.forEach((scriptUrl) => {
                    assert.ok(libs.querySelectorAll('script[src="' + scriptUrl + '"][type="text/javascript"]'));
                });
            });
        });
        describe('css', () => {
            it('should contain proper css tags', () => {
                // given
                jest.spyOn(AuthoringUtils, 'isEditMode').mockReturnValue(true);
                // when

                const libs: DocumentFragment = authoringUtils.getAemLibraries();

                // then
                AuthoringUtils.AUTHORING_LIBRARIES.CSS.forEach((scriptUrl) => {
                    assert.ok(libs.querySelectorAll('link[href="' + scriptUrl + '"][type="text/css"][rel="stylesheet"]'));
                });
            });
        });
        describe('meta', () => {
            it('should contain proper meta tags', () => {
                // given
                jest.spyOn(AuthoringUtils, 'isEditMode').mockReturnValue(true);
                // when

                const libs: DocumentFragment = authoringUtils.getAemLibraries();

                // then
                Object.entries(AuthoringUtils.AUTHORING_LIBRARIES.META).forEach((entry) => {
                    const [ key, val ] = entry;

                    assert.ok(libs.querySelectorAll('meta[property="' + key + '"][content="' + val + '"]'));
                });
            });
        });

    });

    describe('setOnLoadCallback', () => {
        it('should resolve immediately when no scripts', () => {
            // given
            const docFragment = new DocumentFragment();
            let called = false;
            const callback = () => {
                called = true;
            };

            docFragment.appendChild(document.createElement('div'));
            docFragment.appendChild(document.createElement('meta'));
            docFragment.appendChild(document.createElement('link'));
            // when
            authoringUtils.setOnLoadCallback(docFragment, callback);

            // then
            expect(called).toBeTruthy();
        });

        it('should resolve immediately when empty', () => {
            // given
            const docFragment = new DocumentFragment();
            let called = false;
            const callback = () => {
                called = true;
            };

            // when
            authoringUtils.setOnLoadCallback(docFragment, callback);

            // then
            expect(called).toBeTruthy();
        });

        it('should resolve when script\'s onload is triggered', async () => {
            // given
            const docFragment = new DocumentFragment();
            let called = false;
            let outResolve: () => void;
            const promise = new Promise(resolve => {
                outResolve = resolve;
            });
            const callback = () => {
                called = true;
                outResolve();
            };

            const htmlScriptElement = document.createElement('script');

            htmlScriptElement.type = 'text/javascript';
            docFragment.appendChild(htmlScriptElement);
            document.head.appendChild(docFragment);
            // when
            authoringUtils.setOnLoadCallback(docFragment, callback);

            // then
            await promise;
            expect(called).toBeTruthy();
            docFragment.parentElement?.removeChild(docFragment);
        });

        it('should resolve when last script onload is triggered', async () => {
            // given
            const docFragment = new DocumentFragment();
            let called = false;
            let outResolve: () => void;
            const promise = new Promise(resolve => {
                outResolve = resolve;
            });
            const callback = () => {
                called = true;
                outResolve();
            };

            const htmlScriptElement = document.createElement('script');
            const secondScriptElement = document.createElement('script');

            htmlScriptElement.type = 'text/javascript';
            htmlScriptElement.async = false;
            htmlScriptElement.onload = () => {
                // called will only be true when the last element has loaded.
                expect(called).toBeFalsy();
            };
            secondScriptElement.type = 'text/javascript';
            secondScriptElement.async = false;
            docFragment.appendChild(htmlScriptElement);
            docFragment.appendChild(secondScriptElement);
            document.head.appendChild(docFragment);
            // when
            authoringUtils.setOnLoadCallback(docFragment, callback);

            // then
            await promise;
            expect(called).toBeTruthy();
            docFragment.parentElement?.removeChild(docFragment);
        });
    });

    describe('isEditMode', () => {
        it('should be false if both indicators are falsy', () => {
            jest.spyOn(PathUtils, 'getMetaPropertyValue').mockReturnValue(AEM_MODE.PREVIEW);
            jest.spyOn<any, string>(PathUtils, 'getCurrentURL').mockReturnValue('');

            assert.ok(AuthoringUtils.isEditMode() === false);
        });

        it('should be true based on meta property', () => {
            jest.spyOn(PathUtils, 'getMetaPropertyValue').mockReturnValue(AEM_MODE.EDIT);
            jest.spyOn<any, string>(PathUtils, 'getCurrentURL').mockReturnValue('');

            assert.ok(AuthoringUtils.isEditMode());
        });

        it('should be true based on meta property', () => {
            jest.spyOn(PathUtils, 'getMetaPropertyValue').mockReturnValue(AEM_MODE.PREVIEW);
            jest.spyOn<any, string>(PathUtils, 'getCurrentURL').mockReturnValue('http://localhost/?' + MetaProperty.WCM_MODE + '=' + AEM_MODE.EDIT);

            assert.ok(AuthoringUtils.isEditMode());
        });

        it('should be false when url is malformed and metaproperty not edit', () => {
            jest.spyOn(PathUtils, 'getMetaPropertyValue').mockReturnValue(AEM_MODE.PREVIEW);
            jest.spyOn<any, string>(PathUtils, 'getCurrentURL').mockReturnValue('a/b');

            assert.ok(!AuthoringUtils.isEditMode());
        });
    });

    describe('isPreviewMode', () => {
        it('should be false if both indicators are falsy', () => {
            jest.spyOn(PathUtils, 'getMetaPropertyValue').mockReturnValue(AEM_MODE.EDIT);
            jest.spyOn<any, string>(PathUtils, 'getCurrentURL').mockReturnValue('');

            assert.ok(AuthoringUtils.isPreviewMode() === false);
        });

        it('should be true based on meta property', () => {
            jest.spyOn(PathUtils, 'getMetaPropertyValue').mockReturnValue(AEM_MODE.PREVIEW);
            jest.spyOn<any, string>(PathUtils, 'getCurrentURL').mockReturnValue('');

            assert.ok(AuthoringUtils.isPreviewMode());
        });

        it('should be true based on meta property', () => {
            jest.spyOn(PathUtils, 'getMetaPropertyValue').mockReturnValue(AEM_MODE.EDIT);
            jest.spyOn<any, string>(PathUtils, 'getCurrentURL').mockReturnValue('http://localhost/?' + MetaProperty.WCM_MODE + '=' + AEM_MODE.PREVIEW);

            assert.ok(AuthoringUtils.isPreviewMode());
        });

        it('should be false when url is malformed and metaproperty not edit', () => {
            jest.spyOn(PathUtils, 'getMetaPropertyValue').mockReturnValue(AEM_MODE.EDIT);
            jest.spyOn<any, string>(PathUtils, 'getCurrentURL').mockReturnValue('a/b');

            assert.ok(!AuthoringUtils.isPreviewMode());
        });
    });

});
