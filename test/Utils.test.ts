import * as assert from 'assert';
import { Utils } from "../src/Utils";
import Constants, { AEM_MODE } from "../src/Constants";
import { PathUtils } from "../src/PathUtils";

describe('Utils ->', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('Check for clientlibs urls created correctly', () => {
        const expectedResult = [
            "http://www.abc.com/etc.clientlibs/cq/gui/components/authoring/editors/clientlibs/internal/page.js",
            "http://www.abc.com/etc.clientlibs/cq/gui/components/authoring/editors/clientlibs/internal/page.css",
            "http://www.abc.com/etc.clientlibs/cq/gui/components/authoring/editors/clientlibs/internal/pagemodel/messaging.js",
            "http://www.abc.com/etc.clientlibs/cq/gui/components/authoring/editors/clientlibs/internal/messaging.js"
        ];
        jest.spyOn(Utils, 'getDomain').mockReturnValue('http://www.abc.com');
        const data = Utils.generateClientLibsUrl();
        assert.equal(JSON.stringify(data), JSON.stringify(expectedResult));
    });
    it('Check for clientlibs text that will be added on client', () => {
        const expectedResult = "<script src='http://www.test1.js'></script><script src='http://www.test2.js'></script><link href='http://www.test1.css'/><link href='http://www.test2.css'/>";
        const clientLibUrls = ['http://www.test1.js', 'http://www.test2.js', 'http://www.test1.css', 'http://www.test2.css'];
        jest.spyOn(Utils, 'generateClientLibsUrl').mockReturnValue(clientLibUrls)
        const data = Utils.getTagsForState(Constants.AUTHORING);
        assert.equal(data, expectedResult);
    });
    it('Check for clientlibs text that will be added on client', () => {
        const expectedResult = "<script src='http://www.test1.js'></script><script src='http://www.test2.js'></script><link href='http://www.test1.css'/><link href='http://www.test2.css'/>";
        const clientLibUrls = ['http://www.test1.js', 'http://www.test2.js', 'http://www.test1.css', 'http://www.test2.css'];
        jest.spyOn(Utils, 'generateClientLibsUrl').mockReturnValue(clientLibUrls)
        const data = Utils.getTagsForState(Constants.AUTHORING);
        assert.equal(data, expectedResult);
    });
    it('Check authoring state from meta data', () => {
        jest.spyOn(PathUtils, 'getMetaPropertyValue').mockReturnValue(AEM_MODE.EDIT);
        jest.spyOn(PathUtils, 'isBrowser').mockReturnValue(true);
        jest.spyOn(Utils, 'getEditParam').mockReturnValue(AEM_MODE.EDIT);
        let data = Utils.isStateActive(Constants.AUTHORING);
        assert.equal(data, true);
        jest.spyOn(PathUtils, 'getMetaPropertyValue').mockReturnValue(AEM_MODE.PREVIEW);
        jest.spyOn(Utils, 'getEditParam').mockReturnValue(null);
        data = Utils.isStateActive(Constants.AUTHORING);
        assert.equal(data, false);
        data = Utils.isStateActive('');
        assert.equal(data, false);
    });
    it('Check authoring state from query param', () => {
        jest.spyOn(PathUtils, 'getMetaPropertyValue').mockReturnValue(null);
        jest.spyOn(PathUtils, 'isBrowser').mockReturnValue(true);
        jest.spyOn(Utils, 'getEditParam').mockReturnValue(AEM_MODE.EDIT);
        let data = Utils.isStateActive(Constants.AUTHORING);
        assert.equal(data, true);
        jest.spyOn(PathUtils, 'getMetaPropertyValue').mockReturnValue(null);
        jest.spyOn(PathUtils, 'isBrowser').mockReturnValue(true);
        jest.spyOn(Utils, 'getEditParam').mockReturnValue(AEM_MODE.PREVIEW);
        data = Utils.isStateActive(Constants.AUTHORING);
        assert.equal(data, false);
    });
});