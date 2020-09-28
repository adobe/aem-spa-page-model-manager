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
import Constants from '../src/Constants';
import { Model } from '../src/Model';
import { ModelStore } from '../src/ModelStore';
import {
    PAGE_MODEL,
    content_test_child_page_1,
    content_test_child_page_1_root,
    content_test_child_page_1_root_child1001,
    content_test_child_page_1_root_child1000,
    content_test_page_root_child0001,
    content_test_page_root_child0000,
    content_test_page_root_child0000_child0010,
    content_test_subpage2_root,
    content_test_subpage2_root_child2001
} from './data/MainPageData';
import { content_test_page1_stem_child0000, PAGE1 } from './data/Page1Data';
import { content_test_page2_root, content_test_page2_root_child2001 } from './data/Page2Data';

interface MutableModel extends Model{
    mutation?: boolean;
}

describe('ModelStore ->', () => {
    const modelStore: ModelStore = new ModelStore('/');

    beforeEach(() => {
        const cloned: Model = clone(PAGE_MODEL);

        modelStore.initialize(PAGE_MODEL[Constants.PATH_PROP] || '/', cloned);
    });

    const checkNestedScenario = () => {
        let item: Model | undefined = modelStore.getData('/content/test/child_page_1/jcr:content/root/child1001');

        assert.deepEqual(item, content_test_child_page_1_root_child1001);

        item = modelStore.getData('/content/test/child_page_1/jcr:content/root/child1000');
        assert.deepEqual(item, content_test_child_page_1_root_child1000);

        item = modelStore.getData('/content/test/child_page_1/jcr:content/root');
        assert.deepEqual(item, content_test_child_page_1_root);

        item = modelStore.getData('/content/test/page/jcr:content/root/child0000/child0010');
        assert.deepEqual(item, content_test_page_root_child0000_child0010);

        item = modelStore.getData('/content/test/page/jcr:content/root/child0000');
        assert.deepEqual(item, content_test_page_root_child0000);

        item = modelStore.getData('/content/test/page/jcr:content/root/child0001');
        assert.deepEqual(item, content_test_page_root_child0001);
    };

    it('initialization', () => {
        assert.deepEqual(modelStore.getData(), PAGE_MODEL);
    });

    describe('getData ->', () => {
        it('should return the full model', () => {
            const item: any = modelStore.getData();

            assert.deepEqual(item, PAGE_MODEL);
        });

        it('should return the full model', () => {
            const item: any = modelStore.getData(PAGE_MODEL[Constants.PATH_PROP]);

            assert.deepEqual(item, PAGE_MODEL);
        });

        it('should return the full model with a path ending with the jcr:content node', () => {
            const item: any = modelStore.getData(PAGE_MODEL[Constants.PATH_PROP] + '/' + Constants.JCR_CONTENT);

            assert.deepEqual(item, PAGE_MODEL);
        });

        it('should find a child page', () => {
            const item: any = modelStore.getData(content_test_child_page_1[Constants.PATH_PROP]);

            assert.deepEqual(item, content_test_child_page_1);
        });

        it('should find nested children', () => {
            checkNestedScenario();
        });

        it('should return the whole structure by default', () => {
            const item: any = modelStore.getData();

            assert.deepEqual(item, PAGE_MODEL);
        });

        it('should not find wrong path', () => {
            let item: any = modelStore.getData('/content/test/child_page_1/root/child1001/child_no_loaded');

            expect(item).toBeUndefined();
            item = modelStore.getData('/content/test/child_page_1/unknown');
            expect(item).toBeUndefined();
        });

        it('should find element with jcr:content', () => {
            let item: any = modelStore.getData('/content/test/subpage2/jcr:content/root/child2001');

            assert.deepEqual(item, content_test_subpage2_root_child2001);
            item = modelStore.getData('/content/test/subpage2/jcr:content/root');
            assert.deepEqual(item, content_test_subpage2_root);
        });
    });

    describe('insertData', () => {
        it('should add a page', () => {
            modelStore.insertData('/content/test/page1', PAGE1);
            checkNestedScenario();

            const item: any = modelStore.getData('/content/test/page1/jcr:content/stem/child0000');

            assert.deepEqual(item, content_test_page1_stem_child0000);
        });

        it('should add an item at the content root after a sibling', () => {
            modelStore.insertData('/content/test/child_page_1/jcr:content/sibling', content_test_page2_root, 'root');
            checkNestedScenario();

            let item: any = modelStore.getData('/content/test/child_page_1');

            assert.equal(item[Constants.ITEMS_ORDER_PROP].length, 2);
            expect(item[Constants.ITEMS_PROP]).toHaveProperty('sibling');
            assert.deepEqual(item[Constants.ITEMS_ORDER_PROP], [ 'root', 'sibling' ]);
            assert.deepEqual(item[Constants.ITEMS_PROP].sibling, content_test_page2_root);

            item = modelStore.getData('/content/test/child_page_1/jcr:content/sibling');
            assert.deepEqual(item, content_test_page2_root);

            item = modelStore.getData('/content/test/child_page_1/jcr:content/sibling/child2001');
            assert.deepEqual(item, content_test_page2_root_child2001);
        });

        it('should add an item at the content root before a sibling', () => {
            modelStore.insertData('/content/test/child_page_1/jcr:content/sibling', content_test_page2_root, 'root', true);
            checkNestedScenario();

            let item: any = modelStore.getData('/content/test/child_page_1');

            expect(item).toBeDefined();
            assert.equal(item[Constants.ITEMS_ORDER_PROP].length, 2);
            expect(item[Constants.ITEMS_PROP]).toHaveProperty('sibling');
            assert.deepEqual(item[Constants.ITEMS_ORDER_PROP], [ 'sibling', 'root' ]);
            assert.deepEqual(item[Constants.ITEMS_PROP].sibling, content_test_page2_root);

            item = modelStore.getData('/content/test/child_page_1/jcr:content/sibling');
            assert.deepEqual(item, content_test_page2_root);

            item = modelStore.getData('/content/test/child_page_1/jcr:content/sibling/child2001');
            assert.deepEqual(item, content_test_page2_root_child2001);
        });

        it('should add an item at a nested level after a sibling', () => {
            modelStore.insertData('/content/test/child_page_1/jcr:content/root/sibling', content_test_page2_root, 'child1001');

            let item: any = modelStore.getData('/content/test/child_page_1/jcr:content/root');

            assert.equal(item[Constants.ITEMS_ORDER_PROP].length, 3);
            expect(item[Constants.ITEMS_PROP]).toHaveProperty('sibling');
            assert.deepEqual(item[Constants.ITEMS_ORDER_PROP], [ 'child1000', 'child1001', 'sibling' ]);
            assert.deepEqual(item[Constants.ITEMS_PROP].sibling, content_test_page2_root);

            item = modelStore.getData('/content/test/child_page_1/jcr:content/root/sibling');
            assert.deepEqual(item, content_test_page2_root);

            item = modelStore.getData('/content/test/child_page_1/jcr:content/root/sibling/child2001');
            assert.deepEqual(item, content_test_page2_root_child2001);
        });
    });

    describe('removeData', () => {
        it('should remove a page', () => {
            expect(modelStore.getData()![Constants.CHILDREN_PROP] && modelStore.getData()![Constants.CHILDREN_PROP]).toHaveProperty('/content/test/subpage2');

            modelStore.removeData('/content/test/subpage2');
            expect(modelStore.getData()![Constants.CHILDREN_PROP]).not.toHaveProperty('/content/test/subpage2');

            const item: any = modelStore.getData('/content/test/subpage2');

            expect(item).toBeUndefined();
        });

        it('should remove an item at a nested level', () => {
            let item: any = modelStore.getData('/content/test/child_page_1/jcr:content/root');

            assert.deepEqual(item, content_test_child_page_1_root);

            expect(item[Constants.ITEMS_PROP]).toHaveProperty('child1001');
            modelStore.removeData('/content/test/child_page_1/jcr:content/root/child1001');

            item = modelStore.getData('/content/test/child_page_1/jcr:content/root');
            expect(item![Constants.ITEMS_PROP]).not.toHaveProperty('child1001');

            item = modelStore.getData('/content/test/child_page_1/jcr:content/root/child1001');
            expect(item).toBeUndefined();
        });

        it('should remove an item under the jcr:content', () => {
            let item: any = modelStore.getData('/content/test/subpage2/jcr:content/root');

            assert.deepEqual(item, content_test_subpage2_root);
            expect(item[Constants.ITEMS_PROP]).toHaveProperty('child2000');

            modelStore.removeData('/content/test/subpage2/jcr:content/root/child2000');
            item = modelStore.getData('/content/test/subpage2/jcr:content/root');
            expect(item![Constants.ITEMS_PROP]).not.toHaveProperty('child2000');

            item = modelStore.getData('/content/test/subpage2/jcr:content/root/child2000');
            expect(item).toBeUndefined();
        });
    });

    describe('immutability', () => {
        it('should not alter the data stored in the model', () => {
            const item: MutableModel | undefined = modelStore.getData('/content/test/subpage2/jcr:content/root');

            if (item) {
                item.mutation = true;
            } else {
                assert.fail('item should be found');
            }

            const item2: MutableModel | undefined = modelStore.getData('/content/test/subpage2/jcr:content/root');

            if (item2) {
                expect(item2.mutation).toBeUndefined();
            } else {
                assert.fail('item2 should be found');
            }
        });

        it('should alter the data stored in the model', () => {
            const item: MutableModel | undefined = modelStore.getData('/content/test/subpage2/jcr:content/root', false);

            if (item) {
                item.mutation = true;
            } else {
                assert.fail('item2 should be found');
            }

            const item2: MutableModel | undefined = modelStore.getData('/content/test/subpage2/jcr:content/root');

            if (item2) {
                expect(item2.mutation).toBeDefined();
            } else {
                assert.fail('item2 should be found');
            }
        });
    });
});
