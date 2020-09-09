import * as assert from 'assert';
import { Utils } from "../src/Utils";
import { PathUtils } from "../src/PathUtils";
import Constants from "../src/Constants";

describe('Utils ->', () => {
    describe('generateClientLibsUrl', () => {
        it('Check if all the required clientlibs paths got generated', () => {
            assert.equal(Utils.generateClientLibsUrl('http://abc.com').length,
                4);
        });
    });
    describe('isEditMode', () => {
        it('Check if editor is in edit mode via Meta Property', () => {
            jest.spyOn(PathUtils, 'isBrowser').mockReturnValue(false);
            jest.spyOn(Utils, 'getEditParam').mockReturnValue(null);
            jest.spyOn(PathUtils, 'getMetaPropertyValue').mockReturnValue(Constants.AEM_MODE_EDIT);
            assert.equal(Utils.isEditMode(), true);
        });
        it('Check if editor is in edit mode via Query Param', () => {
            jest.spyOn(Utils, 'getEditParam').mockReturnValue(Constants.AEM_MODE_EDIT);
            jest.spyOn(PathUtils, 'getMetaPropertyValue').mockReturnValue(null);
            jest.spyOn(PathUtils, 'isBrowser').mockReturnValue(true);
            assert.equal(Utils.isEditMode(), true);
        });
        it('Check if editor is in edit mode when no meta property or query param', () => {
            jest.spyOn(Utils, 'getEditParam').mockReturnValue(null);
            jest.spyOn(PathUtils, 'getMetaPropertyValue').mockReturnValue(null);
            jest.spyOn(PathUtils, 'isBrowser').mockReturnValue(false);
            assert.equal(Utils.isEditMode(), false);
        });
    });
    describe('appendClientLibs', () => {
        it('Check if all the clientlibs are added to the page', () => {
            const clientlibs = ['http://www.abc.com/xyz.js', 'http://www.abc.com/xyz.css'];
            jest.spyOn(Utils, 'generateClientLibsUrl').mockReturnValue(clientlibs);
            Utils.appendClientLibs("http://www.abc.com");
            const scripts = document.getElementsByTagName('script')[0];
            const link = document.getElementsByTagName('link')[0];
            assert.equal(scripts.src,'http://www.abc.com/xyz.js');
            assert.equal(link.href,'http://www.abc.com/xyz.css');
        });
    });
    describe('isAsync', () => {
        const domain = 'http://www.abc.com';
        const asyncDomain = 'http://www.diffdomain.com'
        it('Should return false in case of different domains', () => {
            jest.spyOn(PathUtils, 'getCurrentPathname').mockReturnValue(asyncDomain);
            const domainMatch = Utils.isAsync(domain);
            expect(domainMatch).toEqual(true);
        });
        it('Should return false in case of different domains', () => {
            jest.spyOn(PathUtils, 'getCurrentPathname').mockReturnValue(domain);
            const domainMatch = Utils.isAsync(domain);
            expect(domainMatch).toEqual(false);
        });
    });
});