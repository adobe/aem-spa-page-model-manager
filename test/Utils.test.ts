import * as assert from 'assert';
import { Utils } from "../src/Utils";
import Constants, { AEM_MODE } from "../src/Constants";
import { PathUtils } from "../src/PathUtils";

describe('Utils ->', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('Check for clientlibs urls created correctly', () => {
        // given
        const expectedResult = [
            "http://www.abc.com/etc.clientlibs/cq/gui/components/authoring/editors/clientlibs/internal/page.js",
            "http://www.abc.com/etc.clientlibs/cq/gui/components/authoring/editors/clientlibs/internal/page.css",
            "http://www.abc.com/etc.clientlibs/cq/gui/components/authoring/editors/clientlibs/internal/pagemodel/messaging.js",
            "http://www.abc.com/etc.clientlibs/cq/gui/components/authoring/editors/clientlibs/internal/messaging.js"
        ];

        jest.spyOn(Utils, 'getApiDomain').mockReturnValue('http://www.abc.com');

        // when
        const data = Utils.generateClientLibsUrl();
        // then
        assert.strictEqual(JSON.stringify(data), JSON.stringify(expectedResult));
    });

    it('Check for clientlibs text that will be added on client', () => {
        // given
        const expectedResult = "<script src='http://www.test1.js'></script><script src='http://www.test2.js'></script><link href='http://www.test1.css'/><link href='http://www.test2.css'/>";
        const clientLibUrls = ['http://www.test1.js', 'http://www.test2.js', 'http://www.test1.css', 'http://www.test2.css'];

        jest.spyOn(Utils, 'generateClientLibsUrl').mockReturnValue(clientLibUrls)

        // when
        const data = Utils.getTagsForState(Constants.AUTHORING);

        // then
        assert.strictEqual(data, expectedResult);
    });

    it('Check for clientlibs text that will be added on client', () => {
        // given
        const expectedResult = "<script src='http://www.test1.js'></script><script src='http://www.test2.js'></script><link href='http://www.test1.css'/><link href='http://www.test2.css'/>";
        const clientLibUrls = ['http://www.test1.js', 'http://www.test2.js', 'http://www.test1.css', 'http://www.test2.css'];

        jest.spyOn(Utils, 'generateClientLibsUrl').mockReturnValue(clientLibUrls)

        // when
        const data = Utils.getTagsForState(Constants.AUTHORING);

        // then
        assert.strictEqual(data, expectedResult);
    });

    it('Test query param for aem modes', () => {
        // given
        jest.spyOn(PathUtils, 'getCurrentURL')
            .mockReturnValueOnce(`http://www.abc.com?aemmode=${AEM_MODE.PREVIEW.toString()}`)
            .mockReturnValueOnce(`http://www.abc.com?aemmode=${AEM_MODE.EDIT.toString()}`)
            .mockReturnValueOnce('http://www.abc.com')
            .mockReturnValue('');

        // when and then
        assert.strictEqual(Utils.getEditParam(), AEM_MODE.PREVIEW);
        assert.strictEqual(Utils.getEditParam(), AEM_MODE.EDIT);
        assert.strictEqual(Utils.getEditParam(), null);
        assert.strictEqual(Utils.getEditParam(), null);
    });

    it('Check authoring state from meta data', () => {
        // given
        jest.spyOn(PathUtils, 'getMetaPropertyValue')
            .mockReturnValueOnce(AEM_MODE.EDIT)
            .mockReturnValue(AEM_MODE.PREVIEW);
        jest.spyOn(PathUtils, 'isBrowser').mockReturnValue(true);
        jest.spyOn(Utils, 'getEditParam')
            .mockReturnValueOnce(AEM_MODE.EDIT)
            .mockReturnValue(null);

        // when and then
        assert.strictEqual(Utils.isStateActive(Constants.AUTHORING), true);
        assert.strictEqual(Utils.isStateActive(Constants.AUTHORING), false);
        assert.strictEqual(Utils.isStateActive(''), false);
    });

    it('Check authoring state from query param', () => {
        // given
        jest.spyOn(PathUtils, 'getMetaPropertyValue').mockReturnValue(null);
        jest.spyOn(PathUtils, 'isBrowser').mockReturnValue(true);
        jest.spyOn(Utils, 'getEditParam')
            .mockReturnValueOnce(AEM_MODE.EDIT)
            .mockReturnValue(AEM_MODE.PREVIEW);

        // when and then
        assert.strictEqual(Utils.isStateActive(Constants.AUTHORING), true);
        assert.strictEqual(Utils.isStateActive(Constants.AUTHORING), false);
    });
});
