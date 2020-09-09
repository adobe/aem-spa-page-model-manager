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
});