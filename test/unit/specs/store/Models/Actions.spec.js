import { expect } from 'chai'
import Models from '../../../../../src/store/modules/models/index.js'
import factory from '../../../../../src/store/factory/index.js'
import testAction from '../helpers/testAction.js'

describe('actions', () => {
    it('initStory', () => {
        testAction(Models.actions.initStory, {}, {
            state: { stories: [] }
        }, [{
            type: 'initStory',
            testPayload (payload) {
                payloadContainsStory(payload);
            }
        }, {
            type: 'initSpace',
            testPayload (payload) {
                payloadContainsStory(payload);
                payloadContainsSpace(payload);
            }
        }], [{
            type: 'application/setCurrentStory',
            testPayload (payload) {
                payloadContainsStory(payload);
            }
        }, {
            type: 'application/setCurrentSpace',
            testPayload (payload) {
                payloadContainsSpace(payload);
            }
        }, {
            type: 'geometry/initGeometry',
            testPayload (payload) {
                payloadContainsStory(payload);
            }
        }]);
    });
    // it('initSpace', () => {
    //     testAction(Models.actions.initSpace, {}, {
    //         state: { stories: [] }
    //     }, [{
    //         type: 'initSpace',
    //         testPayload (payload) {
    //             payloadContainsStory(payload);
    //         }
    //     }], []);
    // });
});

function payloadContainsStory (payload) {
    expect(payload.story.id).to.be.a('number');
    expect(payload.story).to.include.keys(['name', 'handle', 'geometry_id']);

    expect(payload.story.images).to.be.an('array');
    expect(payload.story.spaces).to.be.an('array');
    expect(payload.story.window_refs).to.be.an('array');

    expect(payload.story.below_floor_plenum_height).to.equal(0);
    expect(payload.story.floor_to_ceiling_height).to.equal(0);
    expect(payload.story.multiplier).to.equal(0);
}

function payloadContainsSpace (payload) {
    expect(payload.space.id).to.be.a('number');
    expect(payload.space.daylighting_control_refs).to.be.an('array');
    expect(payload.space).to.include.keys(['name', 'handle', 'face_id', 'building_unit_id', 'thermal_zone_id', 'space_type_id', 'construction_set_id']);
}
