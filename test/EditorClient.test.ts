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
import clone from 'clone';
import fetchMock from 'jest-fetch-mock';
import Constants from '../src/Constants';
import InternalConstants from '../src/InternalConstants';
import { Model } from '../src/Model';
import ModelManager from '../src/ModelManager';
import { PAGE_MODEL_JSON } from './data/EditorClientData';

describe('EditorClient ->', () => {
    const DEFAULT_PAGE_MODEL_PATH = window.location.pathname.replace(/\.htm(l)?$/, '');
    const DEFAULT_PAGE_MODEL_URL = DEFAULT_PAGE_MODEL_PATH + InternalConstants.DEFAULT_MODEL_JSON_EXTENSION;
    const CHILD0000_PATH = DEFAULT_PAGE_MODEL_PATH + '/jcr:content/root/child0000';
    const CHILD0010_PATH = CHILD0000_PATH + '/child0010';
    const CHILD0011_PATH = CHILD0000_PATH + '/child0011';
    const CHILDXXXX_TYPE = 'test/components/componentChildType';
    const CHILDXXXX_KEY = 'childXXXX';

    function getJSONResponse(body: Model) {
        return {
            status: 200,
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json'
            }
        };
    }

    const dispatchEvent_PageModelUpdate = function(cmd: string, path: string, data: any) {
        const detail = {
            msg: { cmd, path, data }
        };

        const event = new CustomEvent('cq-pagemodel-update', { detail });

        window.dispatchEvent(event);
    };

    beforeEach(() => {
        fetchMock.doMock(() => {
            return Promise.resolve(getJSONResponse(PAGE_MODEL_JSON));
        });
    });

    afterEach(() => {
        fetchMock.resetMocks();
    });

    describe('"cq-pagemodel-update" event ->', () => {
        let origConsoleError: any;

        beforeEach(() => {
            const config = {
                path: DEFAULT_PAGE_MODEL_URL,
                model: clone(PAGE_MODEL_JSON)
            };

            ModelManager.initialize(config);
            origConsoleError = console.error;
            console.error = jest.fn();
        });

        afterEach(() => {
            console.error = origConsoleError;
        });

        it('should log an error if no msg is passed', () => {
            const eventData = { detail: { msg: {} } };

            expect(console.error).not.toHaveBeenCalled();
            window.dispatchEvent(new CustomEvent('cq-pagemodel-update', eventData));
            expect(console.error).toHaveBeenCalled();
        });

        it('should log a warning when the event data is empty', () => {
            expect(console.error).not.toHaveBeenCalled();
            window.dispatchEvent(new CustomEvent('cq-pagemodel-update', {}));
            expect(console.error).toHaveBeenCalled();
        });

        it('should delete child0010 when triggered with the "delete" cmd', (done) => {
            // validation
            ModelManager.addListener(CHILD0000_PATH, () => {
                ModelManager.getData(CHILD0000_PATH).then(pageModel => {
                    // @ts-expect-error
                    assert.equal(pageModel[Constants.ITEMS_ORDER_PROP].indexOf('child0010'), -1);
                    done();
                });
            });

            // trigger
            dispatchEvent_PageModelUpdate('delete', CHILD0010_PATH, {
                key: CHILDXXXX_KEY,
                value: {
                    ':type': CHILDXXXX_TYPE
                }
            });
        });

        it('should replace child0010 when triggered with the "replace" cmd', (done) => {
            // validation
            ModelManager.addListener(CHILD0010_PATH, () => {
                ModelManager.getData(CHILD0010_PATH).then(pageModel => {
                    assert.equal(pageModel[Constants.TYPE_PROP], CHILDXXXX_TYPE);
                    done();
                });
            });

            // trigger
            dispatchEvent_PageModelUpdate('replace', CHILD0010_PATH, {
                key: CHILDXXXX_KEY,
                value: {
                    ':type': CHILDXXXX_TYPE
                }
            });
        });

        describe('when triggered with the "insert" cmd', () => {
            it('should insert before child0010', (done) => {
                // validation
                ModelManager.addListener(CHILD0000_PATH, () => {
                    ModelManager.getData(CHILD0000_PATH).then(pageModel => {
                        // @ts-expect-error
                        assert.equal(pageModel[Constants.ITEMS_PROP][CHILDXXXX_KEY][Constants.TYPE_PROP], CHILDXXXX_TYPE);

                        const order = pageModel[Constants.ITEMS_ORDER_PROP];

                        // @ts-expect-error
                        assert.equal(order.indexOf('childXXXX') + 1, order.indexOf('child0011'));
                        done();
                    });
                });

                // trigger
                dispatchEvent_PageModelUpdate('insertBefore', CHILD0011_PATH, {
                    key: CHILDXXXX_KEY,
                    value: {
                        ':type': CHILDXXXX_TYPE
                    }
                });
            });

            it('should insert after child0010', done => {
                ModelManager.addListener(CHILD0000_PATH, () => {
                    ModelManager.getData(CHILD0000_PATH).then(pageModel => {
                            if (!pageModel) {
                                throw 'should find pagemodel';
                            }

                            // @ts-expect-error
                            assert.equal(pageModel[Constants.ITEMS_PROP][CHILDXXXX_KEY][Constants.TYPE_PROP], CHILDXXXX_TYPE);

                            const order = pageModel[Constants.ITEMS_ORDER_PROP];

                            // @ts-expect-error
                            assert.equal(order.indexOf('childXXXX') - 1, order.indexOf('child0011'));

                            done();
                        });
                    }
                );

                dispatchEvent_PageModelUpdate('insertAfter', CHILD0011_PATH, {
                    key: CHILDXXXX_KEY,
                    value: {
                        ':type': CHILDXXXX_TYPE
                    }
                });
            });
        });

    });

    describe('listeners ->', () => {
        beforeEach(() => {
            ModelManager.initialize({ path: DEFAULT_PAGE_MODEL_URL, model: clone(PAGE_MODEL_JSON) });

        });

        it('should be notified when updating the model', done => {
            ModelManager.addListener(CHILD0000_PATH, done);

            dispatchEvent_PageModelUpdate('insertAfter', CHILD0010_PATH, {
                key: CHILDXXXX_KEY,
                value: {
                    ':type': CHILDXXXX_TYPE
                }
            });
        });

        it('should be notified when reloading the model', done => {
            ModelManager.addListener(CHILD0000_PATH, done);

            ModelManager.getData({
                path: CHILD0000_PATH,
                forceReload: true
            });
        });

        it('should remove a listener', () => {
            let flag = false;
            const spy = () => {
                flag = true;
            };

            ModelManager.addListener(CHILD0000_PATH, spy);
            ModelManager.removeListener(CHILD0000_PATH, spy);

            dispatchEvent_PageModelUpdate('insertAfter', CHILD0010_PATH, {
                key: CHILDXXXX_KEY,
                value: {
                    ':type': CHILDXXXX_TYPE
                }
            });

            expect(flag).toEqual(false);
        });
    });
});
