// arguments:
// action - the actual action function
// actionPayload - the payload object to call the action function with
// state - the state of the store you want to test the action with
// expectedMutations - the mutations that the action should trigger in order - these can contain a type and tests for their payloads
export default function testAction (action, actionPayload, context, expectedMutations) {
    var mutationCount = 0;
    const mockedContext = Object.assign(context, {
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
        }
    });
    // call the action with mocked store and arguments
    action(mockedContext, actionPayload);

    // check if no mutations should have been dispatched
    if (expectedMutations.length === 0) {
        expect(mutationCount).to.equal(0);
    }
}
