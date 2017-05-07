import { expect } from 'chai'
import Project from 'src/store/modules/project'
import modelFactory from 'src/store/modules/models/factory'

describe('project mutations', () => {
    var state, initialState;

    var testMutation = function (basePath,mutationName,propName) {
        it (mutationName, () => {
            // update value
            Project.mutations[mutationName](state,{
                [propName]: 'xyz'
            });

            // check if updated
            expect(state[basePath][propName]).to.equal('xyz');

            // undefined --> should not update
            Project.mutations[mutationName](state,{});

            // check if not updated
            expect(state[basePath][propName]).to.equal('xyz');
        });
    };

    beforeEach(() => {
        // state = JSON.parse(JSON.stringify(Project.state));
        state = {
            config: {},
            grid: {},
            view: {},
            map: {}
        };
    });

    describe('config', () => {
        testMutation('config','setUnits','units');
        testMutation('config','setLanguage','language');
        testMutation('config','setConfigNorthAxis','north_axis');
    });

    describe('grid', () => {
        testMutation('grid','setGridVisible','visible');
        it('setSpacing', () => {
            // update value
            Project.mutations.setSpacing(state,{
                spacing: 'xyz'
            });

            // check if updated
            expect(state.grid.spacing).to.equal('xyz');
        })
    });

    describe('view', () => {
        testMutation('view','setViewMinX','min_x');
        testMutation('view','setViewMinY','min_y');
        testMutation('view','setViewMaxX','max_x');
        testMutation('view','setViewMaxY','max_y');
    });

    describe('map', () => {
        testMutation('map','setMapVisible','visible');
        testMutation('map','setMapLatitude','latitude');
        testMutation('map','setMapLongitude','longitude');
        testMutation('map','setMapZoom','zoom');
        testMutation('map','setMapRotation','rotation');
    });
});