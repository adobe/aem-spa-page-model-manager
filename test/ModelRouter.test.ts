import MetaProperty from '../src/MetaProperty';
import { Model } from '../src/Model';
import ModelManager from '../src/ModelManager';
import { dispatchRouteChanged, getModelPath, getRouteFilters, isModelRouterEnabled, isRouteExcluded, routeModel, RouterModes } from '../src/ModelRouter';
import { PathUtils } from '../src/PathUtils';

let metaProps: { [key: string]: string } = {};
const modelManagerSpy: jest.SpyInstance<Promise<Model>> = jest.spyOn(ModelManager, 'getData');

describe('ModelRouter ->', () => {
    const DEFAULT_PAGE_MODEL_PATH = window.location.pathname.replace(/\.htm(l)?$/, '');
    const TEST_PATH = '/test';
    const TEST_MODEL = { test: 'model' };
    const MODEL_ROUTE_FILTERS = ['f1', 'f2', 'f3'];
    const MODEL_ROUTE_FILTERS_STR = MODEL_ROUTE_FILTERS.join(',');

    beforeEach(() => {
        metaProps = {};
        jest.spyOn(PathUtils, 'getMetaPropertyValue').mockImplementation((val) => metaProps[val]);
    });

    describe('getModelPath ->', () => {
        it('should get the current window URL', () => {
            expect(getModelPath()).toEqual(DEFAULT_PAGE_MODEL_PATH);
        });

        it('should get the current window URL', () => {
            expect(getModelPath('/path.model.json')).toEqual('/path');
        });

        it('should get the current window URL', () => {
            expect(getModelPath('/zyx/abc?test=test')).toEqual('/zyx/abc');
        });
    });

    describe('dispatchRouteChanged ->', () => {
        beforeEach(() => {
            modelManagerSpy.mockResolvedValue(TEST_MODEL);
        });

        afterEach(() => {
            modelManagerSpy.mockReset();
        });

        it('should get the current window URL', () => {
            dispatchRouteChanged(TEST_PATH);
            expect(modelManagerSpy).toHaveBeenCalledWith({ path: TEST_PATH });
        });
    });

    describe('routeModel ->', () => {
        beforeEach(() => {
            modelManagerSpy.mockResolvedValue(TEST_MODEL);
        });

        afterEach(() => {
            modelManagerSpy.mockReset();
        });

        it('should route the model based on the window URL', () => {
            const { location } = window;

            // @ts-ignore
            delete window.location;

            // @ts-ignore
            window.location = {
                pathname: '/some/path/name',
            };

            routeModel();
            expect(modelManagerSpy).toHaveBeenCalledWith({ path: '/some/path/name' });

            window.location = location;
        });

        it('should route the model based on provided path', () => {
            routeModel(TEST_PATH);
            expect(modelManagerSpy).toHaveBeenCalledWith({ path: TEST_PATH });
        });
    });

    describe('getRouteFilters ->', () => {
        afterEach(() => {
            metaProps = {};
        });

        it('should return an empty list of route filters', () => {
            expect(getRouteFilters()).toEqual([]);
        });

        it('should return a list of route filters', () => {
            metaProps[MetaProperty.PAGE_MODEL_ROUTE_FILTERS] = MODEL_ROUTE_FILTERS_STR;
            expect(getRouteFilters()).toEqual(expect.arrayContaining(MODEL_ROUTE_FILTERS));
        });
    });

    describe('isModelRouterEnabled ->', () => {
        afterEach(() => {
            metaProps = {};
        });

        it('should return an enabled route model by default', () => {
            expect(isModelRouterEnabled()).toEqual(true)
        });

        it('should return a disabled route model', () => {
            metaProps[MetaProperty.PAGE_MODEL_ROUTER] = RouterModes.DISABLED;

            expect(isModelRouterEnabled()).toEqual(false);
        });
    });

    describe('isRouteExcluded ->', () => {
        afterEach(() => {
            metaProps = {};
        });

        it('should filter a route', () => {
            expect(isRouteExcluded(MODEL_ROUTE_FILTERS[0])).toEqual(false);
            expect(isRouteExcluded(MODEL_ROUTE_FILTERS[1])).toEqual(false);
            expect(isRouteExcluded(MODEL_ROUTE_FILTERS[2])).toEqual(false);
        });

        it('should filter a route', () => {
            metaProps[MetaProperty.PAGE_MODEL_ROUTE_FILTERS] = MODEL_ROUTE_FILTERS_STR;

            expect(isRouteExcluded(MODEL_ROUTE_FILTERS[0])).toEqual(true);
            expect(isRouteExcluded(MODEL_ROUTE_FILTERS[1])).toEqual(true);
            expect(isRouteExcluded(MODEL_ROUTE_FILTERS[2])).toEqual(true);
        });
    });
});
