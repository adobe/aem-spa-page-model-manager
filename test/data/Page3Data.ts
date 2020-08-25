import { Model } from '../../src/Model';
import { PageModel, ResponsiveGridModel } from './types';

export const content_test_groot_child1000: ResponsiveGridModel = {
    'gridClassNames': 'aem-Grid aem-Grid--12 aem-Grid--default--12',
    'columnCount': 12,
    ':type': 'wcm/foundation/components/responsivegrid'
};

export const content_test_groot_child1001: Model = { ':type': 'test/components/componentchild1' }

export const content_test_groot: ResponsiveGridModel = {
    'gridClassNames': 'aem-Grid aem-Grid--12 aem-Grid--default--12',
    'columnCount': 12,
    ':itemsOrder': ['child1000', 'child1001'],
    ':items': {
        'child1000': content_test_groot_child1000,
        'child1001': content_test_groot_child1001
    },
    ':type': 'wcm/foundation/components/responsivegrid'
};

export const PAGE3: PageModel = {
    ':type': 'we-retail-journal/react/components/structure/page',
    ':path': '/content/test',
    ':items': {
        'groot': content_test_groot
    },
    ':itemsOrder': [
        'groot'
    ]
};
