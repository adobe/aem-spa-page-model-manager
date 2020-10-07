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
import fetchMock from 'jest-fetch-mock';
import { anyString, instance, mock, reset, verify, when } from 'ts-mockito';
import EventType from '../src/EventType';
import InternalConstants from '../src/InternalConstants';
import MetaProperty from '../src/MetaProperty';
import { ModelClient } from '../src/ModelClient';
import ModelManager from '../src/ModelManager';
import { PathUtils } from '../src/PathUtils';
import { content_test_page_root_child0000_child0010, PAGE_MODEL } from './data/MainPageData';

const PAGE_PATH = '/content/test/page';
const PAGE_MODEL_URL = PAGE_PATH + InternalConstants.DEFAULT_MODEL_JSON_EXTENSION;
const CHILD_PATH = PAGE_PATH + '/jcr:content/root/child0000/child0010';
const CHILD_MODEL_URL = CHILD_PATH + InternalConstants.DEFAULT_MODEL_JSON_EXTENSION;
const ModelClientMock = mock(ModelClient);
let modelClient: ModelClient;

describe('ModelManager ->', () => {
    const PAGE_MODEL_LOAD_EVENT_OPTIONS = {
        detail: {
            model: PAGE_MODEL
        }
    };

    function expectPageModelLoadedEventFired() {
        expect(PathUtils.dispatchGlobalCustomEvent).toHaveBeenCalled();
        expect(PathUtils.dispatchGlobalCustomEvent).toHaveBeenCalledWith(EventType.PAGE_MODEL_LOADED, PAGE_MODEL_LOAD_EVENT_OPTIONS);
    }

    function assertAsyncModelFetched() {
        expectPageModelLoadedEventFired();

        return ModelManager.getData().then((data) => {
            assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
        });
    }

    function mockTheFetch(path: any, data: any) {
        fetchMock.mockIf(path, () => {
           return Promise.resolve({
               body: JSON.stringify(data)
           });
        });
    }

    let pathName = '';
    let metaProps: { [key: string]: string } = {};

    beforeEach(() => {
        metaProps = {};
        metaProps[MetaProperty.PAGE_MODEL_ROOT_URL] = PAGE_MODEL_URL;
        pathName = PAGE_PATH;

        when(ModelClientMock.fetch(anyString())).thenReturn(Promise.resolve(PAGE_MODEL));
        when(ModelClientMock.fetch(PAGE_MODEL_URL)).thenReturn(Promise.resolve(PAGE_MODEL));
        when(ModelClientMock.fetch(CHILD_MODEL_URL)).thenReturn(Promise.resolve(content_test_page_root_child0000_child0010));
        modelClient = instance(ModelClientMock);
        jest.spyOn(PathUtils, 'getMetaPropertyValue').mockImplementation((val) => metaProps[val]);
        jest.spyOn(PathUtils, 'dispatchGlobalCustomEvent');
        jest.spyOn(PathUtils, 'getCurrentPathname').mockImplementation(() => pathName);
        mockTheFetch(PAGE_MODEL_URL, PAGE_MODEL);
    });

    afterEach(() => {
        reset(ModelClientMock);
        pathName = '';
    });

    describe('initialize ->', () => {
        describe('Initialization without config object ->', () => {
            it('should NOT fetch remote data on initialization when the model is provided', () => {
                return ModelManager.initialize({ model: PAGE_MODEL }).then((data) => {
                    expectPageModelLoadedEventFired();
                    expect(data).toEqual(PAGE_MODEL);
                    assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
                });
            });

            it('should fetch remote data on initialization - root path as meta property', () => {
                metaProps[MetaProperty.PAGE_MODEL_ROOT_URL] = PAGE_MODEL_URL;

                return ModelManager.initialize().then((data) => {
                    expectPageModelLoadedEventFired();
                    assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
                });
            });

            it('should fetch remote data on initialization - root path as currentPathname', () => {
                pathName = PAGE_MODEL_URL;

                return ModelManager.initialize().then((data) => {
                    expectPageModelLoadedEventFired();
                    assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
                });
            });

            it('should fetch remote data on initialization - root path as a parameter', () => {
                return ModelManager.initialize(PAGE_PATH).then((data) => {
                    expectPageModelLoadedEventFired();
                    assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
                });
            });
        });

        it('should fetch remote data on initialization', () => {
            return ModelManager.initialize({ path: PAGE_PATH, modelClient: modelClient }).then((data) => {
                verify(modelClient.fetch(anyString()));
                assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
            });
        });

        it('should fail when initialized on non-browser with invlid config', () => {
            pathName = '';

            // disable console.error within the test
            jest.spyOn(console, 'error').mockImplementation();

            //simulate non browser for the test
            const windowSpy = jest.spyOn(global, 'window', 'get');

            windowSpy.mockImplementation();

            try {
                ModelManager.initialize();
            } catch (err) {
                assert.strictEqual(err.name, 'Error');
            }
        });

        it('should throw error when initialized without model url', () => {
            metaProps = {};
            pathName = '';
            try {
                ModelManager.initialize();
            } catch (err) {
                assert.strictEqual(err.name, 'Error');
            }
        });

        it('should throw error when initialized with invalid model url', () => {
            try {
                ModelManager.initialize({ path: '?abc' });
            } catch (err) {
                assert.strictEqual(err.name, 'Error');
            }
        });

        it('should not make concurrent server calls on duplicate request', () => {
            return ModelManager.initialize({ path: PAGE_PATH, model: PAGE_MODEL, modelClient: modelClient }).then(() => {
                expectPageModelLoadedEventFired();
                pathName = '/content/test/duplicate/request';

                when(ModelClientMock.fetch(pathName)).thenReturn(new Promise((resolve) => {
                    setTimeout(() => resolve(PAGE_MODEL), 200);
                }));

                const promises: any[] = [];

                promises.push(ModelManager._fetchData(pathName));
                promises.push(ModelManager._fetchData(pathName));
                promises.push(ModelManager._fetchData(pathName));

                return Promise.all(promises).then(() => {
                    for (let i = 0; i < promises.length - 1; ++i) {
                        assert.equal(promises[i], promises[i + 1]);
                    }
                });
            });
        });

        describe('when the request is for an asynchronous subpage -- ', () => {
            beforeEach(() => {
                pathName = '/content/test/pageNotInModel';
                metaProps[MetaProperty.PAGE_MODEL_ROOT_URL] = '/content/test';
            });

            it('should fetch data twice on initialization', () => {
                return ModelManager.initialize({ path: PAGE_PATH, modelClient: modelClient }).then((data) => {
                    expectPageModelLoadedEventFired();
                    verify(ModelClientMock.fetch(anyString())).times(2);
                    assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
                });
            });
        });

        it('should not fetch data on initialization', () => {
            return ModelManager.initialize({ path: PAGE_PATH, model: PAGE_MODEL, modelClient: modelClient }).then((data) => {
                expectPageModelLoadedEventFired();
                // verify(ModelClientMock.fetch(anyString())).never();
                assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
            });
        });

        it('should not fetch data', () => {
            return ModelManager.initialize({ path: PAGE_PATH, model: PAGE_MODEL, modelClient: modelClient }).then(() => {
                expectPageModelLoadedEventFired();

                return ModelManager.getData(CHILD_PATH).then((data) => {
                    verify(ModelClientMock.fetch(CHILD_MODEL_URL)).never();
                    assert.deepEqual(data, content_test_page_root_child0000_child0010, 'data should be correct');
                });
            });
        });

        it('should fetch all the data', () => {
            return ModelManager.initialize({ path: PAGE_PATH, model: PAGE_MODEL, modelClient: modelClient }).then(() => {
                expectPageModelLoadedEventFired();

                return ModelManager.getData().then((data) => {
                    verify(ModelClientMock.fetch(CHILD_MODEL_URL)).never();
                    assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
                });
            });
        });

        it('should fetch data if forced', () => {
            return ModelManager.initialize({ path: PAGE_PATH, model: PAGE_MODEL, modelClient: modelClient }).then(() => {
                expectPageModelLoadedEventFired();

                return ModelManager.getData({ path: CHILD_PATH, forceReload: true }).then((data) => {
                    verify(ModelClientMock.fetch(anyString())).times(1);
                    assert.deepEqual(data, content_test_page_root_child0000_child0010, 'data should be correct');
                });
            });
        });
    });

    describe('initializeAsync ->', () => {
        describe('Initialization without config object ->', () => {
            it('should fetch remote data on initialization - root path as meta property', () => {
                metaProps[MetaProperty.PAGE_MODEL_ROOT_URL] = PAGE_MODEL_URL;
                ModelManager.initializeAsync();
                assertAsyncModelFetched();
            });

            it('should fetch remote data on initialization - root path as currentPathname', () => {
                pathName = PAGE_MODEL_URL;
                ModelManager.initializeAsync();
                assertAsyncModelFetched();
            });

            it('should initialize model store when no root path is provided', () => {
                metaProps = {};
                pathName = '';
                ModelManager.initializeAsync();

                return ModelManager.getData({ path: PAGE_MODEL_URL }).then((data) => {
                    assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
                });
            });
        });

        it('should throw error when fetching data without initialization', () => {
            ModelManager.getData({ path: PAGE_MODEL_URL }).then((data) => {
                assert.deepEqual(data, PAGE_MODEL, 'data should be correct');
            });
        });

        it('should NOT fetch remote data on initialization when the model is provided', () => {
            ModelManager.initializeAsync({ model: PAGE_MODEL });
            assertAsyncModelFetched();
        });

        it('should fetch remote data on initialization - root path as a parameter', () => {
            ModelManager.initializeAsync(PAGE_PATH);
            assertAsyncModelFetched();
        });

        it('should fetch remote data on initialization', () => {
            ModelManager.initializeAsync({ path: PAGE_PATH, modelClient: modelClient });
            verify(modelClient.fetch(anyString()));
            assertAsyncModelFetched();
        });
    });
});
