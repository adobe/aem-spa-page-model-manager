// @ts-nocheck

import * as assert from 'assert';
import fetchMock from 'jest-fetch-mock';
import { Model } from '../src/Model';
import { ModelClient } from '../src/ModelClient';
import { content_test_child_page_1, PAGE_MODEL } from './data/MainPageData';

const NON_EXISTING_URL = '/content/test/undefined';
const PAGE_URL = '/content/test/page';
const CHILD_PAGE_URL = '/content/test/child_page_1';
const CHILD_PAGE_404_URL = '/content/test/child_page_404';
const myEndPoint = 'http://localhost:4523';

function getJSONResponse(body: Model) {
    return {
        status: 200,
        body: JSON.stringify(body),
        headers: {
            'Content-type': 'application/json'
        }
    };
}

function mockTheFetch() {
    fetchMock.doMock((req) => {
        switch (req.url) {
            case myEndPoint + CHILD_PAGE_URL:
                return Promise.resolve(getJSONResponse(content_test_child_page_1));

            case myEndPoint + PAGE_URL:
                return Promise.resolve(getJSONResponse(PAGE_MODEL));

            case myEndPoint + CHILD_PAGE_404_URL:
            default:
                return Promise.reject({ code: 404, body: 'Not found' })
        }
    });
}

describe('ModelClient ->', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
        mockTheFetch();
    });

    describe('fetch ->', () => {
        it('should reject when the remote model endpoint is not found', () => {
            const modelClient = new ModelClient(myEndPoint);

            return modelClient.fetch(NON_EXISTING_URL).then((data) => {
                assert.fail(data, undefined);
            }).catch((error) => {
                expect(error.code).toEqual(404);
            });
        });

        it('should return the expected data', () => {
            const modelClient = new ModelClient(myEndPoint);

            return modelClient.fetch(PAGE_URL).then((data) => {
                assert.deepEqual(data, PAGE_MODEL);

                return modelClient.fetch(CHILD_PAGE_URL);
            }).then((data) => {
                assert.deepEqual(data, content_test_child_page_1);

                return modelClient.fetch(CHILD_PAGE_404_URL);
            }).catch((error) => {
                expect(error.code).toEqual(404);
            });
        });

        describe('handling incorrect parameter', () => {
            const modelClient = new ModelClient(myEndPoint);

            // failing as the undefined is passed to the PathUtils which can not handle this case
            // it('should resolve with Error - when no URL provided', (done) => {
            //
            //     modelClient.fetch(undefined).catch((e) => {
            //         assert.isNotNull(e);
            //         done();
            //     });
            // });

            it('should resolve with Error - when empty URL provided', (done) => {
                modelClient.fetch('').catch((error) => {
                    expect(error.message).toBeDefined();
                    done();
                });
            });
        });
    });
});
