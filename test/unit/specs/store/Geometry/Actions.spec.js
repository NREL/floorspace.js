import { expect } from 'chai'
import { geometry as Geometry, helpers } from '../../../../../src/store/modules/geometry/index.js'
import factory from '../../../../../src/store/factory/index.js'

describe('actions', () => {
    it('initGeometry', () => {
        testAction(Geometry.actions.initGeometry, {}, {}, [{
            type: 'initGeometry',
            testPayload (payload) {
                expect(payload.geometry.id).to.be.a('number');
                expect(payload.geometry.vertices).to.be.an('array');
                expect(payload.geometry.edges).to.be.an('array');
                expect(payload.geometry.faces).to.be.an('array');
            }
        }])
    });
});

// arguments:
// action - the actual action function
// actionPayload - the payload object to call the action function with
// state - the state of the store you want to test the action with
// expectedMutations - the mutations that the action should trigger in order - these can contain a type and tests for their payloads
const testAction = (action, actionPayload, state, expectedMutations) => {
    var mutationCount = 0;
    const context = {
        commit (type, mutationPayload) {
            // loop up the next expected mutation
            const expectedMutation = expectedMutations[mutationCount];

            // check for the correct type
            expect(expectedMutation.type).to.equal(type);

            // check for the correct payload
            if (mutationPayload) {
                expectedMutation.testPayload(mutationPayload);
            }

            mutationCount++;
        },
        state: state
    };

    // call the action with mocked store and arguments
    action(context, actionPayload);

    // check if no mutations should have been dispatched
    if (expectedMutations.length === 0) {
        expect(mutationCount).to.equal(0);
    }
}
