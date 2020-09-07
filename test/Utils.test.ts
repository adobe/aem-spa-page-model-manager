import * as assert from 'assert';
import {Utils} from "../src/Utils";

describe('Utils ->', () => {
    describe('generateClientLibsUrl', () => {
        it('generateClientLibsUrl', () => {
            assert.equal(Utils.generateClientLibsUrl('/content/mysite/us/en.model.json', 'http://abc.com'),
                'http://abc.com/etc.clientlibs/mysite/clientlibs/clientlib-base.min.js');
        });
    });
});