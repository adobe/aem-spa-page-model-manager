import * as assert from 'assert';
import {Utils} from "../src/Utils";

describe('Utils ->', () => {
    describe('generateClientLibsUrl', () => {
        it('generateClientLibsUrl', () => {
            assert.equal(Utils.generateClientLibsUrl('http://abc.com').length,
                4);
        });
    });
});