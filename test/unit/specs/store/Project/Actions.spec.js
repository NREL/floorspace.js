import { expect } from 'chai'
import Project from 'src/store/modules/project'
import { testAction, Context } from '../helpers';
import modelsFactory from 'src/store/modules/models/factory'

describe('project actions', () => {
    var context;

    beforeEach(() => {
        context = new Context('project');
    });

    it('setUnits', (done) => {
        const payload = { units: "ft" };

        testAction(context, 'project','setUnits', payload, [
            {
                type: 'setUnits',
                payload
            }
        ], []);

        // expect no mutations when invalid payload provided
        testAction(context, 'project','setUnits', { units: 'invalidUnits' }, [], [], done);
    });

    it('setLanguage', (done) => {
        const payload = { language: "EN-US" };

        testAction(context, 'project','setLanguage', payload, [
            {
                type: 'setLanguage',
                payload
            }
        ], []);

        // expect no mutations when invalid payload provided
        testAction(context, 'project','setLanguage', { units: 'invalidLanguage' }, [], [], done);
    });

    it('setNorthAxis', (done) => {
        const payload = { north_axis: 1.0 };

        testAction(context, 'project','setNorthAxis', payload, [
            {
                type: 'setConfigNorthAxis',
                payload
            }
        ], [], done);

        // expect no mutations when invalid payload provided
        testAction(context, 'project','setNorthAxis', {}, [], [], done);
    });

    it('setMapVisible', (done) => {
        const payload = { visible: true };

        testAction(context, 'project','setMapVisible', payload, [
            {
                type: 'setMapVisible',
                payload
            }
        ], []);

        // expect no mutations when invalid payload provided
        testAction(context, 'project','setMapVisible', {}, [], [], done);
    });

    it('setMapEnabled', (done) => {
        const payload = { enabled: true };

        testAction(context, 'project','setMapEnabled', payload, [
            {
                type: 'setMapEnabled',
                payload
            }
        ], []);

        // expect no mutations when invalid payload provided
        testAction(context, 'project','setMapEnabled', {}, [], [], done);
    });

    it('setGridVisible', (done) => {
        const payload = { visible: true };

        testAction(context, 'project','setGridVisible', payload, [
            {
                type: 'setGridVisible',
                payload
            }
        ], []);

        // expect no mutations when invalid payload provided
        testAction(context, 'project','setGridVisible', {}, [], [], done);
    });

    it('setSpacing', (done) => {
        testAction(context, 'project','setSpacing', {}, [
            {
                type: 'setSpacing'
            }
        ], [], done);
    });

    it('setViewMinX', (done) => {
        testAction(context, 'project','setViewMinX', {}, [
            {
                type: 'setViewMinX'
            }
        ], [], done);
    });

    it('setViewMinY', (done) => {
        testAction(context, 'project','setViewMinY', {}, [
            {
                type: 'setViewMinY'
            }
        ], [], done);
    });

    it('setViewMaxX', (done) => {
        testAction(context, 'project','setViewMaxX', {}, [
            {
                type: 'setViewMaxX'
            }
        ], [], done);
    });

    it('setViewMaxY', (done) => {
        testAction(context, 'project','setViewMaxY', {}, [
            {
                type: 'setViewMaxY'
            }
        ], [], done);
    });

    // it('setFov', (done) => {
    //     const payload = {};

    //     testAction(context, 'project','setFov', payload, [
    //         {
    //             type: 'setFov',
    //             payload
    //         }
    //     ], [], done);
    // });
    
    it('setZoom', (done) => {
        const payload = {};

        testAction(context, 'project','setZoom', payload, [
            {
                type: 'setMapZoom',
                payload
            }
        ], [], done);
    });

    // it('setFilmOffset', (done) => {
    //     const payload = {};

    //     testAction(context, 'project','setFilmOffset', payload, [
    //         {
    //             type: 'setFilmOffset',
    //             payload
    //         }
    //     ], [], done);
    // });

    it('setMapLatitude', (done) => {
        testAction(context, 'project','setMapLatitude', {}, [
            {
                type: 'setMapLatitude'
            }
        ], [], done);
    });

    it('setMapLongitude', (done) => {
        testAction(context, 'project','setMapLongitude', {}, [
            {
                type: 'setMapLongitude'
            }
        ], [], done);
    });

    it('setMapZoom', (done) => {
        const payload = {zoom: 1.0};

        testAction(context, 'project','setMapZoom', payload, [
            {
                type: 'setMapZoom',
                payload
            }
        ], [], done);
    });

    it('setMapRotation', (done) => {
        const payload = {
            rotation: context.state.map.rotation
        };

        testAction(context, 'project','setMapRotation', {}, [
            {
                type: 'setMapRotation'
            }
        ], [], done);
    });
});