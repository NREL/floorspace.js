// arguments:
// action - the actual action function
// actionPayload - the payload object to call the action function with
// state - the state of the store you want to test the action with
// expectedMutations - the mutations that the action should trigger in order - these can contain a type and tests for their payloads
// expectedActions - the actions that the action should trigger in order - these can contain a type and tests for their payloads
export default function testAction (store, actionName, context, payload, expectedMutations, expectedActions) {
    var mutationCount = 0,
        actionCount = 0;
    const mockedContext = Object.assign(context, {
        dispatch (type, actionPayload) {
            // loop up the next expected action
            const expectedAction = expectedActions[actionCount];
            expect(expectedAction, 'An unexpected action ' + type + ' was commited').to.be.ok;

            // check for the correct type
            expect(expectedAction.type, 'incorrect mutation type: ' + type).to.equal(type);

            // check for the correct payload
            if (actionPayload) {
                expectedAction.testPayload(actionPayload);
            }

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
                // TODO: commit on rootstate?
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
    expect(mutationCount).to.equal(expectedMutations.length);
    expect(actionCount).to.equal(expectedActions.length);
}
