import { expect } from 'chai'
import Application from 'src/store/modules/application'
import modelFactory from 'src/store/modules/models/factory'

describe('application mutations', () => {
    var state;

    var testMutation = function (basePath,mutationName,propName,payloadProp) {
        it (mutationName, () => {
            Application.mutations[mutationName](state,{
                [payloadProp || propName]: 'xyz'
            });

            expect(state[basePath][propName]).to.equal('xyz');
        });
    };

    describe('current selections', () => {
        beforeEach(() => {
            state = {
                currentSelections: {}
            };
        });

        testMutation('currentSelections', 'setCurrentStory', 'story');
        testMutation('currentSelections', 'setCurrentSpace', 'space');
        testMutation('currentSelections', 'setCurrentShading', 'shading');
        testMutation('currentSelections', 'setCurrentImage', 'image');
        testMutation('currentSelections', 'setCurrentBuildingUnit', 'building_unit');
        testMutation('currentSelections', 'setCurrentThermalZone', 'thermal_zone');
        testMutation('currentSelections', 'setCurrentSpaceType', 'space_type');
    });

    describe('editor/drawing tool', () => {
        beforeEach(() => {
            state = {
                currentSelections: {}
            };
        });

        testMutation('currentSelections', 'setApplicationTool', 'tool');
        testMutation('currentSelections', 'setApplicationMode', 'mode');
    });

    describe('d3 scaling functions', () => {
        beforeEach(() => {
            state = {
                scale: {}
            };
        });

        testMutation('scale', 'setScaleX', 'x', 'scaleX');
        testMutation('scale', 'setScaleY', 'y', 'scaleY');
    });
});