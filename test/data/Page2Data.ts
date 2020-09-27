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

export const content_test_page2_root_child2001: Model = { ':type': 'test/components/componentchild1' };

export const content_test_page2_root_child2000: ResponsiveGridModel = {
    'gridClassNames': 'aem-Grid aem-Grid--12 aem-Grid--default--12',
    'columnCount': 12,
    ':type': 'wcm/foundation/components/responsivegrid'
};

export const content_test_page2_root: ResponsiveGridModel = {
    'gridClassNames': 'aem-Grid aem-Grid--12 aem-Grid--default--12',
    'columnCount': 12,
    ':itemsOrder': [ 'child2000', 'child2001' ],
    ':items': {
        'child2000': content_test_page2_root_child2000,
        'child2001': content_test_page2_root_child2001
    },
    ':type': 'wcm/foundation/components/responsivegrid'
};

export const PAGE2: PageModel = {
    ':type': 'we-retail-journal/react/components/structure/page',
    ':path': '/content/test/page2',
    ':items': {
        'root': content_test_page2_root
    },
    ':itemsOrder': [
        'root'
    ]
};
