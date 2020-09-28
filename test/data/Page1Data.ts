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

export const content_test_page1_stem_child0000 = { ':type': 'test/components/componentchild1' };

export const content_test_page1_stem: ResponsiveGridModel = {
    'gridClassNames': 'aem-Grid aem-Grid--12 aem-Grid--default--12',
    'columnCount': 12,
    ':itemsOrder': [ 'child0000' ],
    ':items': {
        'child0000': content_test_page1_stem_child0000
    },
    ':type': 'wcm/foundation/components/responsivegrid'
};

export const PAGE1: PageModel = {
    'designPath': '/libs/settings/wcm/designs/default',
    'title': 'React sample page Custom',
    'lastModifiedDate': 1512116041058,
    'templateName': 'sample-template',
    'cssClassNames': 'page',
    'language': 'en-US',
    ':itemsOrder': [
        'stem'
    ],
    ':items': {
        'stem': content_test_page1_stem
    },
    ':path': '/content/test/page1',
    ':type': 'we-retail-react/components/structure/page'
};
