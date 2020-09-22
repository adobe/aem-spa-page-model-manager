// @ts-nocheck

import * as assert from 'assert';
import InternalConstants from '../src/InternalConstants';
import MetaProperty from '../src/MetaProperty';
import { PathUtils } from '../src/PathUtils';

describe('PathUtils ->', () => {
    let currentPathName;
    let metaProps: { [key: string]: string } = {};
    let metaPropSpy: jest.SpyInstance;
    let pathNameSpy: jest.SpyInstance;

    beforeAll(() => {
        metaPropSpy = jest.spyOn(PathUtils, 'getMetaPropertyValue').mockImplementation((key) => metaProps[key]);
        pathNameSpy = jest.spyOn(PathUtils, 'getCurrentPathname').mockImplementation(() => currentPathName);
    });

    beforeEach(() => {
        currentPathName = null;
        metaProps = {};
    });

    afterAll(() => {
        metaPropSpy.mockRestore();
        pathNameSpy.mockRestore();
    });

    describe('getContextPath ->', () => {
        const EXPECTED_CONTEXT_PATH = {
            '/contextpath/content/test.html': '/contextpath',
            '/contextpath/apps/test.html': '/contextpath',
            '/contextpath/libs/test.html': '/contextpath',
            '/contextpath/etc/test.html': '/contextpath',
            '/contextpath/conf/test.html': '/contextpath',
            '/contextpath1/contextpath2/content/test.html': '/contextpath1/contextpath2',
            '/content/content/test.html': '',
            '/content/with/content/test.html': '',
            '/content/launches/2020/05/11/root_launch/content/wknd-events/react/home.html': '',
            '/content/launches/2020/05/11/root_launch/content/wknd-events/react.model.json': '',
            '/contextpath/content/launches/2020/05/11/root_launch/content/wknd-events/react/home.html': '/contextpath',
            '/contextpath1/contextpath2/content/launches/2020/05/11/root_launch/content/wknd-events/react/home.html': '/contextpath1/contextpath2',
            '/foo/bar/xyz/content/launches/2020/05/11/root_launch/content/wknd-events/react.model.json': '/foo/bar/xyz',
            '/not/a/context/path/test.html': '',
            '/content/test.html': ''
        };

        it('should detect the context path from the given location', () => {
            for (const keyPath in EXPECTED_CONTEXT_PATH) {
                const contextPath = PathUtils.getContextPath(keyPath);
                assert.strictEqual(contextPath, EXPECTED_CONTEXT_PATH[keyPath], 'Incorrect context path detected for ' + keyPath);
            }
        });

        it('should detect the context path from the current location', () => {
            const contextPath = PathUtils.getContextPath();
            assert.strictEqual(contextPath, '', 'Incorrect context path detected');
        });

        it('should determine correctly the current location', () => {
            const url = 'http://www.abc.com';
            jest.spyOn(PathUtils, 'isBrowser')
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(false);
            global.window = Object.create(window);
            Object.defineProperty(window, 'location', {
                value: {
                    href: url
                }
            });
            assert.strictEqual(PathUtils.getCurrentURL(), url);
            assert.strictEqual(PathUtils.getCurrentURL(), '');
        });
    });

    describe('externalize ->', () => {
        let contextPathSpy;
        const CONTEXT_PATH = '/contextpath';
        const EXPECTED_EXTERNALIZED_PATHS = {
            '/content/test.html': '/contextpath/content/test.html',
            '/apps/test.html': '/contextpath/apps/test.html',
            '/libs/test.html': '/contextpath/libs/test.html',
            '/etc/test.html': '/contextpath/etc/test.html',
            '/conf/test.html': '/contextpath/conf/test.html',
            '/contextpath/content/test.html': '/contextpath/content/test.html',
            '/content/content/test.html': '/contextpath/content/content/test.html',
            '/contextpath/content/with/content/test.html': '/contextpath/content/with/content/test.html',
            '/not/a/context/path/test.html': '/contextpath/not/a/context/path/test.html'
        };

        beforeAll(() => {
            contextPathSpy = jest.spyOn(PathUtils, 'getContextPath').mockImplementation(() => CONTEXT_PATH);
        });

        afterAll(() => {
            contextPathSpy.mockRestore();
        });

        it('should prepend the context path on the given path', () => {
            for (const keyPath in EXPECTED_EXTERNALIZED_PATHS) {
                if (!Object.prototype.hasOwnProperty.call(EXPECTED_EXTERNALIZED_PATHS, keyPath)) {
                    continue;
                }

                const externalizedPath = PathUtils.externalize(keyPath);
                assert.strictEqual(externalizedPath, EXPECTED_EXTERNALIZED_PATHS[keyPath]);
            }
        });
    });

    describe('internalize ->', () => {
        let contextPathSpy;
        const CONTEXT_PATH = '/contextpath';
        const EXPECTED_INTERNALIZED_PATHS = {
            '': '',
            '/contextpath/content/test.html': '/content/test.html',
            '/contextpath/apps/test.html': '/apps/test.html',
            '/contextpath/libs/test.html': '/libs/test.html',
            '/contextpath/etc/test.html': '/etc/test.html',
            '/contextpath/conf/test.html': '/conf/test.html',
            '/contextpath1/contextpath2/content/test.html': '/contextpath1/contextpath2/content/test.html',
            '/content/content/test.html': '/content/content/test.html',
            '/content/with/content/test.html': '/content/with/content/test.html',
            '/not/a/context/path/test.html': '/not/a/context/path/test.html',
            '/content/test.html': '/content/test.html',
        };

        beforeAll(() => {
            contextPathSpy = jest.spyOn(PathUtils, 'getContextPath').mockImplementation(() => CONTEXT_PATH);
        });

        afterAll(() => {
            contextPathSpy.mockRestore();
        });

        it('should return the expected internalized paths', () => {
            for (const path in EXPECTED_INTERNALIZED_PATHS) {
                if (!Object.prototype.hasOwnProperty.call(EXPECTED_INTERNALIZED_PATHS, path)) {
                    continue;
                }

                const internalizedPath = PathUtils.internalize(path);
                assert.strictEqual(internalizedPath, EXPECTED_INTERNALIZED_PATHS[path]);
            }
        });
    });

    describe('getModelUrl', () => {
        const COMPONENT_PATH = '/page/jcr:content/comp1';
        const COMPONENT_PATH_HTML = COMPONENT_PATH + '.html';
        const COMPONENT_MODEL_URL = COMPONENT_PATH + InternalConstants.DEFAULT_MODEL_JSON_EXTENSION;

        it('should adapt the provided path', () => {
            assert.strictEqual(PathUtils.getModelUrl(COMPONENT_PATH_HTML), COMPONENT_MODEL_URL);
        });

        it('should return the provided meta property', () => {
            metaProps[MetaProperty.PAGE_MODEL_ROOT_URL] = COMPONENT_MODEL_URL;
            assert.strictEqual(PathUtils.getModelUrl(), COMPONENT_MODEL_URL);
        });

        it('should return the currentPathname', () => {
            currentPathName = COMPONENT_MODEL_URL;
            assert.strictEqual(PathUtils.getModelUrl(), COMPONENT_MODEL_URL);
        });
    });

    describe('sanitize ->', () => {
        let contextPathSpy;
        const CONTEXT_PATH = '/contextpath';
        const EXPECTED_PATH = {
            '': null,
            '/content/page': '/content/page',
            '/content/page.selector': '/content/page',
            '/contextpath/content/page': '/content/page',
            'http://localhost:4502/content/page.html': '/content/page',
            'http://localhost:4502/contextpath/content/page.html': '/content/page',
            'http://localhost:4502/content/page.selector.html': '/content/page',

            // Should resolve protocol-relative URLs
            '//content/page': '/page',
            '//contextpath/content/page': '/content/page',

            // Should resolve multiple slashes to single ones
            '/contextpath//content/page': '/content/page',
            '/contextpath/content//page': '/content/page',
            '/contextpath/content////////////page': '/content/page',
            'http://localhost:4502//content/page.selector.html': '/content/page',
            'http://localhost:4502/content//page.selector.html': '/content/page',
        };

        beforeAll(() => {
            contextPathSpy = jest.spyOn(PathUtils, 'getContextPath').mockImplementation(() => CONTEXT_PATH);
        });

        afterAll(() => {
            contextPathSpy.mockRestore();
        });

        it('should return paths that are ready to be stored', () => {
            for (const path in EXPECTED_PATH) {
                const sanitizedPath = PathUtils.sanitize(path);
                assert.strictEqual(sanitizedPath, EXPECTED_PATH[path], 'Incorrect sanitized path for ' + path);
            }

            assert.equal(PathUtils.sanitize(), null);
            assert.equal(PathUtils.sanitize(null), null);
            assert.equal(PathUtils.sanitize(undefined), null);
        });
    });

    describe('dispatchGlobalCustomEvent', () => {
        it('should dispatch an event', (done) => {
            const detail = {
                a: 1,
                b: { c: 3 }
            };

            const eventName = 'customEvt';

            window.addEventListener(eventName, (event) => {
                assert.strictEqual(event.type, eventName);
                // @ts-ignore
                assert.deepEqual(event.detail, detail, 'Returns the page model object');
                done();
            });

            PathUtils.dispatchGlobalCustomEvent(eventName, { detail });
        });

        it('should not dispatch any event', () => {
            const stub = jest.spyOn(PathUtils, 'isBrowser').mockReturnValue(false);
            const dispatcher = jest.spyOn(window, 'dispatchEvent');
            const eventName = 'customEvt';

            PathUtils.dispatchGlobalCustomEvent(eventName, {});
            expect(dispatcher).not.toHaveBeenCalled();
            stub.mockRestore();
        });
    });

    it('isBrowser', () => {
        // returns true when window is present
        assert.equal(PathUtils.isBrowser(), true);

        // returns false when window is not present
        const windowSpy = jest.spyOn(global, 'window', 'get');

        windowSpy.mockImplementation(() => undefined);
        assert.equal(PathUtils.isBrowser(), false);
        windowSpy.mockRestore();
    });

    it('join', () => {
        assert.strictEqual(PathUtils.join(['path', '/path1', '//path1']), 'path/path1/path1');
        assert.strictEqual(PathUtils.join(['']), '');
        assert.strictEqual(PathUtils.join([]), '');
        assert.strictEqual(PathUtils.join(), '');
        assert.strictEqual(PathUtils.join(['/path', 'path1', 'path2']), '/path/path1/path2');
    });

    it('normalize', () => {
        assert.strictEqual(PathUtils.normalize('path1//path2/path3'), 'path1/path2/path3');
        assert.strictEqual(PathUtils.normalize('/path1/path2/path3'), '/path1/path2/path3');
        assert.strictEqual(PathUtils.normalize('pathme'), 'pathme');
        assert.strictEqual(PathUtils.normalize(), '');
    });

    it('makeAbsolute', () => {
        assert.strictEqual(PathUtils.makeAbsolute('path1/path2/path3'), '/path1/path2/path3');
        assert.strictEqual(PathUtils.makeAbsolute('/path1/path2/path3'), '/path1/path2/path3');
        assert.strictEqual(PathUtils.makeAbsolute(''), '');
        assert.strictEqual(PathUtils.makeAbsolute(), '');
    });

    it('makeRelative', () => {
        assert.strictEqual(PathUtils.makeRelative('path1/path2/path3'), 'path1/path2/path3');
        assert.strictEqual(PathUtils.makeRelative('/path1/path2/path3'), 'path1/path2/path3');
        assert.strictEqual(PathUtils.makeRelative(''), '');
        assert.strictEqual(PathUtils.makeRelative(), '');
    });

    it('getNodeName', () => {
        assert.strictEqual(PathUtils.getNodeName(), null);
        assert.strictEqual(PathUtils.getNodeName(undefined), null);
        assert.strictEqual(PathUtils.getNodeName(null), null);
        assert.strictEqual(PathUtils.getNodeName(null), null);
        assert.strictEqual(PathUtils.getNodeName(true), null);
        assert.strictEqual(PathUtils.getNodeName(0), null);
        assert.strictEqual(PathUtils.getNodeName(123), null);
        assert.strictEqual(PathUtils.getNodeName(123.45), null);
        assert.strictEqual(PathUtils.getNodeName(0x123), null);
        assert.strictEqual(PathUtils.getNodeName(0o123), null);
        assert.strictEqual(PathUtils.getNodeName(0b1001010), null);
        assert.strictEqual(PathUtils.getNodeName([]), null);
        assert.strictEqual(PathUtils.getNodeName(new Date()), null);
        assert.strictEqual(PathUtils.getNodeName(''), null);
        assert.strictEqual(PathUtils.getNodeName('foo'), 'foo');
        assert.strictEqual(PathUtils.getNodeName('/foo'), 'foo');
        assert.strictEqual(PathUtils.getNodeName('/foo///'), 'foo');
        assert.strictEqual(PathUtils.getNodeName('/foo/bar/12345'), '12345');
        assert.strictEqual(PathUtils.getNodeName('/foo/bar/12345////xyz'), 'xyz');
    });

    it('subpath', () => {
        assert.strictEqual(PathUtils.subpath('path1/path2/path3', 'path1'), 'path2/path3');
        assert.strictEqual(PathUtils.subpath('path1/path2/path3', 'path1/path2'), 'path3');
        assert.strictEqual(PathUtils.subpath('path1/path2/path3', 'path2/path3'), 'path1/path2/path3');
        assert.strictEqual(PathUtils.subpath('/path1/path2/path3', 'path1/path2'), 'path3');
        assert.strictEqual(PathUtils.subpath('/path1/path2/path3'), '/path1/path2/path3');
        assert.strictEqual(PathUtils.subpath(), '');
    });

    it('splitByDelimitators', () => {
        assert.deepStrictEqual(PathUtils.splitByDelimitators('/path1/path2/delim/path3/path4/delim/path/delim', ['delim']), ['/path1/path2', 'path3/path4', 'path']);
        assert.deepStrictEqual(PathUtils.splitByDelimitators('/path1/path2/delim', []), ['/path1/path2/delim']);
        assert.deepStrictEqual(PathUtils.splitByDelimitators('delim', ['delim']), []);
        assert.deepStrictEqual(PathUtils.splitByDelimitators('/path1/path2/delim1/path3/path4/delim2/path5/path6/delim3', ['delim1', 'delim2', 'delim3']), ['/path1/path2', 'path3/path4', 'path5/path6']);
    });

    it('trimStrings', () => {
        assert.strictEqual(PathUtils.trimStrings('jcr:content/path1/path2', ['jcr:content']), 'path1/path2');
        assert.strictEqual(PathUtils.trimStrings('path1/path2', ['jcr:content']), 'path1/path2');
        assert.strictEqual(PathUtils.trimStrings('path1/path2/jcr:content', ['jcr:content']), 'path1/path2');
        assert.strictEqual(PathUtils.trimStrings('jcr:content/jcr:content/path1/path2/jcr:content/jcr:content/path1/jcr:content/jcr:content', ['jcr:content']), 'path1/path2/jcr:content/jcr:content/path1');
        assert.strictEqual(PathUtils.trimStrings('jcr:content/path1/path2/jcr:content', []), 'jcr:content/path1/path2/jcr:content');
        assert.strictEqual(PathUtils.trimStrings('/path1/path2', []), '/path1/path2');
    });

    it('adaptPagePath', () => {
        assert.equal(PathUtils.adaptPagePath(), '');
        assert.equal(PathUtils.adaptPagePath(''), '');
        assert.equal(PathUtils.adaptPagePath('/foobar'), '/foobar');
        assert.equal(PathUtils.adaptPagePath('/foobar', '/hello'), '/foobar');
        assert.equal(PathUtils.adaptPagePath('/hello/foobar', '/hello'), '/hello/foobar');
    });

    it('addExtension', () => {
        assert.equal(PathUtils.addExtension(), undefined);
        assert.equal(PathUtils.addExtension(null), undefined);
        assert.equal(PathUtils.addExtension(''), '');
        assert.equal(PathUtils.addExtension('/foobar'), '/foobar');
        assert.equal(PathUtils.addExtension('/foobar.xyz', 'html'), '/foobar.xyz.html');
        assert.equal(PathUtils.addExtension('/foobar.json', 'json'), '/foobar.json');
        assert.equal(PathUtils.addExtension('/foobar', 'json'), '/foobar.json');
    });

    it('addSelector', () => {
        assert.equal(PathUtils.addSelector(), undefined);
        assert.equal(PathUtils.addSelector(null), undefined);
        assert.equal(PathUtils.addSelector(''), '');
        assert.equal(PathUtils.addSelector('/foobar'), '/foobar');
        assert.equal(PathUtils.addSelector('/foobar.html', 'xyz'), '/foobar.xyz.html');
        assert.equal(PathUtils.addSelector('/foobar.html', 'xyz.abc'), '/foobar.xyz.abc.html');
        assert.equal(PathUtils.addSelector('/foobar.json', 'json'), '/foobar.json');
        assert.equal(PathUtils.addSelector('/foobar', 'json'), '/foobar.json');
    });

    it('getParentNodePath', () => {
        assert.equal(PathUtils.getParentNodePath(), null);
        assert.equal(PathUtils.getParentNodePath(null), null);
        assert.equal(PathUtils.getParentNodePath(''), null);
        assert.equal(PathUtils.getParentNodePath('/foobar'), '');
        assert.equal(PathUtils.getParentNodePath('/foobar/a/xyz'), '/foobar/a');
    });
});
