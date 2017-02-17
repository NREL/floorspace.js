import Geometry from '../../../../../src/store/modules/geometry/index.js'
import Models from '../../../../../src/store/modules/models/index.js'
import Application from '../../../../../src/store/modules/application/index.js'
import Project from '../../../../../src/store/modules/project/index.js'

const moduleMap = {
    geometry: Geometry,
    models: Models,
    application: Application,
    project: Project
};

export default function testAction (store, actionName, context, payload, expectedMutations, expectedActions) {
    var mutationCount = 0,
        actionCount = 0;
    const mockedContext = Object.assign(context, {
        dispatch (type, actionPayload) {
            // loop up the next expected action
            const expectedAction = expectedActions[actionCount];
            expect(expectedAction, 'An unexpected action ' + type + ' was commited').to.be.ok;

            // check for the correct type
            expect(expectedAction.type, 'incorrect action type: ' + type).to.equal(type);

            // check for the correct payload
            expectedAction.testAction(actionPayload);
           // testAction(store, type, this, actionPayload);
            actionCount++;
        },
        commit (type, mutationPayload, options) {
            // loop up the next expected mutation
            const expectedMutation = expectedMutations[mutationCount];

            // check for the correct type
            expect(expectedMutation, 'An unexpected mutation ' + type + ' was commited').to.be.ok;
            expect(type, 'incorrect mutation type: ' + type).to.equal(expectedMutation.type);

            // check for the correct payload
            const testSideEffects = expectedMutation.testMutation(mutationPayload);
            if (options && options.root) {
                const storeModule = type.split("/")[0];
                const mutationName = type.split("/")[1];

                moduleMap[storeModule].mutations[mutationName](context.rootState, mutationPayload);
                testSideEffects();
            } else {
                // run the mutation
                store.mutations[type](context.state, mutationPayload);
                // verify the side effects of the mutation
                testSideEffects();
            }

            mutationCount++;
        }
    });
    // call the action with mocked store and arguments
    store.actions[actionName](mockedContext, payload);
    expect(mutationCount, "The wrong number of mutations was committed by the " + actionName + " action").to.equal(expectedMutations.length);
    expect(actionCount, "The wrong number of actions was dispatched by the " + actionName + " action").to.equal(expectedActions.length);
}
