import { PageModel, ResponsiveGridModel } from './types';

export const content_test_page1_stem_child0000 = { ':type': 'test/components/componentchild1' };

export const content_test_page1_stem: ResponsiveGridModel = {
    'gridClassNames': 'aem-Grid aem-Grid--12 aem-Grid--default--12',
    'columnCount': 12,
    ':itemsOrder': ['child0000'],
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
