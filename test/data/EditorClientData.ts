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

import { PageModel, ResponsiveGridModel } from './types';

const DEFAULT_PAGE_MODEL_PATH = window.location.pathname.replace(/\.htm(l)?$/, '');

export const CHILD0000_MODEL_JSON: ResponsiveGridModel = {
    'gridClassNames': 'aem-Grid aem-Grid--12 aem-Grid--default--12',
    'columnCount': 12,
    ':itemsOrder': [ 'child0010', 'child0011' ],
    ':items': {
        'child0010': { ':type': 'test/components/componentchild0' },
        'child0011': { ':type': 'test/components/componentchild1' }
    },
    ':type': 'wcm/foundation/components/responsivegrid'
};

export const root: ResponsiveGridModel = {
    'gridClassNames': 'aem-Grid aem-Grid--12 aem-Grid--default--12',
    'columnCount': 12,
    ':itemsOrder': [ 'child0000', 'child0001' ],
    ':items': {
        'child0000': CHILD0000_MODEL_JSON,
        'child0001': { ':type': 'test/components/componentchild1' }
    },
    ':type': 'wcm/foundation/components/responsivegrid'
};

export const dummyResponsiveGrid: ResponsiveGridModel = {
    'gridClassNames': 'aem-Grid aem-Grid--12 aem-Grid--default--12',
    'columnCount': 12,
    ':type': 'wcm/foundation/components/responsivegrid'
};

export const childPage1Root: ResponsiveGridModel = {
    'gridClassNames': 'aem-Grid aem-Grid--12 aem-Grid--default--12',
    'columnCount': 12,
    ':itemsOrder': [ 'child1000', 'child1001' ],
    ':items': {
        'child1000': dummyResponsiveGrid,
        'child1001': { ':type': 'test/components/componentchild1' }
    },
    ':type': 'wcm/foundation/components/responsivegrid'
};

export const childPage2Root: ResponsiveGridModel = {
    'gridClassNames': 'aem-Grid aem-Grid--12 aem-Grid--default--12',
    'columnCount': 12,
    ':itemsOrder': [ 'child2000', 'child2001' ],
    ':items': {
        'child2000': dummyResponsiveGrid,
        'child2001': { ':type': 'test/components/componentchild1' }
    },
    ':type': 'wcm/foundation/components/responsivegrid'
};

export const PAGE_MODEL_JSON: PageModel = {
    ':path': DEFAULT_PAGE_MODEL_PATH,
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
        'root': root
    },
    ':hierarchyType': 'page',
    ':children': {
        '/content/test/child_page_1': {
            ':type': 'we-retail-journal/react/components/structure/page',
            ':items': {
                'root': childPage1Root
            },
            ':itemsOrder': [
                'root'
            ]
        },
        '/content/test/subpage2': {
            ':type': 'we-retail-journal/react/components/structure/page',
            ':items': {
                'root': childPage2Root
            },
            ':itemsOrder': [
                'root'
            ]
        }
    },
    ':type': 'we-retail-react/components/structure/page'
};
