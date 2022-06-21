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

import { Model } from '../../src/Model';
import { PageModel, ResponsiveGridModel } from './types';

export const content_test_page_root_child0000_child0010: Model = { ':type': 'test/components/componentchild0' };
export const content_test_page_root_child0000_child0011: Model = { ':type': 'test/components/componentchild1' };

export const content_test_page_root_child0000: ResponsiveGridModel = {
    'gridClassNames': 'aem-Grid aem-Grid--12 aem-Grid--default--12',
    'columnCount': 12,
    ':itemsOrder': [ 'child0010', 'child0011' ],
    ':items': {
        'child0010': content_test_page_root_child0000_child0010,
        'child0011': content_test_page_root_child0000_child0011
    },
    ':type': 'wcm/foundation/components/responsivegrid'
};

export const content_test_page_root_child0001: Model = { ':type': 'test/components/componentchild1' };
export const content_test_page_root: ResponsiveGridModel = {
    'gridClassNames': 'aem-Grid aem-Grid--12 aem-Grid--default--12',
    'columnCount': 12,
    ':itemsOrder': [ 'child0000', 'child0001' ],
    ':items': {
        'child0000': content_test_page_root_child0000,
        'child0001': content_test_page_root_child0001
    },
    ':type': 'wcm/foundation/components/responsivegrid'
};

export const content_test_child_page_1_root_child1001: Model = { ':type': 'test/components/componentchild1' };

export const content_test_child_page_1_root_child1000: ResponsiveGridModel = {
    'gridClassNames': 'aem-Grid aem-Grid--12 aem-Grid--default--12',
    'columnCount': 12,
    ':type': 'wcm/foundation/components/responsivegrid'
};

export const content_test_child_page_1_root: ResponsiveGridModel = {
    'gridClassNames': 'aem-Grid aem-Grid--12 aem-Grid--default--12',
    'columnCount': 12,
    ':itemsOrder': [ 'child1000', 'child1001' ],
    ':items': {
        'child1000': content_test_child_page_1_root_child1000,
        'child1001': content_test_child_page_1_root_child1001
    },
    ':type': 'wcm/foundation/components/responsivegrid'
};

export const content_test_child_page_1: PageModel = {
    ':type': 'we-retail-journal/react/components/structure/page',
    ':path': '/content/test/child_page_1',
    ':items': {
        'root': content_test_child_page_1_root
    },
    ':itemsOrder': [
        'root'
    ]
};

export const content_test_subpage2_root_child2000: ResponsiveGridModel = {
    'gridClassNames': 'aem-Grid aem-Grid--12 aem-Grid--default--12',
    'columnCount': 12,
    ':type': 'wcm/foundation/components/responsivegrid'
};

export const content_test_subpage2_root_child2001: Model = { ':type': 'test/components/componentchild1' };

export const content_test_subpage2_root: ResponsiveGridModel = {
    'gridClassNames': 'aem-Grid aem-Grid--12 aem-Grid--default--12',
    'columnCount': 12,
    ':itemsOrder': [ 'child2000', 'child2001' ],
    ':items': {
        'child2000': content_test_subpage2_root_child2000,
        'child2001': content_test_subpage2_root_child2001
    },
    ':type': 'wcm/foundation/components/responsivegrid'
};

export const content_test_subpage2: PageModel = {
    ':type': 'we-retail-journal/react/components/structure/page',
    ':items': {
        'root': content_test_subpage2_root
    },
    ':itemsOrder': [
        'root'
    ]
};

export const content_test_subpage2_root_page: PageModel = { ':type': 'test/components/page' };

export const content_test_subpage2_rootPage: PageModel = {
    ':type': 'we-retail-journal/react/components/structure/page',
    ':items': {
        'page': content_test_subpage2_root_page
    },
    ':itemsOrder': [
        'page'
    ]
};

export const PAGE_MODEL: PageModel = {
    'designPath': '/libs/settings/wcm/designs/default',
    'title': 'React sample page',
    'lastModifiedDate': 1512116041058,
    'templateName': 'sample-template',
    'cssClassNames': 'page',
    'language': 'en-US',
    ':itemsOrder': [
        'root'
    ],
    ':items': {
        'root': content_test_page_root
    },
    ':hierarchyType': 'page',
    ':children': {
        '/content/test/child_page_1': content_test_child_page_1,
        '/content/test/subpage2/subpage22': content_test_subpage2_rootPage,
        '/content/test/subpage2': content_test_subpage2
    },
    ':path': '/content/test/page',
    ':type': 'we-retail-react/components/structure/page'
};

export const ERROR_PAGE_MODEL_404: PageModel = {
    'designPath': '/libs/settings/wcm/designs/default',
    'title': 'Example Error Page 404',
    'lastModifiedDate': 1512116041058,
    'templateName': 'sample-template',
    'cssClassNames': 'page',
    'language': 'en-US',
    ':itemsOrder': [
        'root'
    ],
    ':items': {
        'root': content_test_page_root
    },
    ':hierarchyType': 'page',
    ':children': {},
    ':path': '/content/test/page',
    ':type': 'we-retail-react/components/structure/page'
};

export const ERROR_PAGE_MODEL_500: PageModel = {
    'designPath': '/libs/settings/wcm/designs/default',
    'title': 'Example Error Page 500',
    'lastModifiedDate': 1512116041058,
    'templateName': 'sample-template',
    'cssClassNames': 'page',
    'language': 'en-US',
    ':itemsOrder': [
        'root'
    ],
    ':items': {
        'root': content_test_page_root
    },
    ':hierarchyType': 'page',
    ':children': {},
    ':path': '/content/test/page',
    ':type': 'we-retail-react/components/structure/page'
};
