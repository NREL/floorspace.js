import geometry from 'src/store/modules/geometry'
import models from 'src/store/modules/models'
import application from 'src/store/modules/application'
import project from 'src/store/modules/project'

import geometryFactory from 'src/store/modules/geometry/factory'
import modelsFactory from 'src/store/modules/models/factory'

const Modules = {
    application,
    geometry,
    models,
    project
};

export function RootState() {
    const geometryState = [new geometryFactory.Geometry()];
    const space = new modelsFactory.Space();
    const story = new modelsFactory.Story();
    const shading = new modelsFactory.Shading();
    const image = new modelsFactory.Image();

    story.spaces.push(space);
    story.shading.push(shading);
    story.images.push(image);

    this.application = importState('application'),
    this.geometry = geometryState,
    this.models = importState('models'),
    this.project = importState('project')

    this.application.currentSelections.story = story;
    this.application.currentSelections.space = space;
    this.models.stories.push(story);

    function importState(module) {
        return JSON.parse(JSON.stringify(Modules[module].state));
    };
};

export function Context(type) {
    const rootState = new RootState();
    const story = rootState.models.stories[0];
    const rootGetters = {
        'application/currentStoryGeometry': rootState.geometry[0],
        'models/allSpaces': story.spaces,
        'models/allShading': story.shading,
        'models/allImages': story.images
    };
    const gettersByModule = Object.keys(rootGetters).reduce((out,key) => {
        const [moduleName,getterName] = key.split("/");
        out[moduleName][getterName] = rootGetters[key];
        return out;
    },{
        application: {},
        geometry: {},
        models: {},
        project: {}
    });

    this.state = rootState[type];
    this.rootState = rootState;
    this.rootGetters = rootGetters;
    this.getters = gettersByModule[type];

    // helpers
    this._getCurrentStory = function () {
        return this.rootState.application.currentSelections.story;
    };

    this._getCurrentSpace = function () {
        return this.rootState.application.currentSelections.space;
    };

    this._getCurrentGeometry = function () {
        return this.rootState.geometry[0];
    };
};

export function testAction(context, moduleName, actionName, payload, expectedMutations, expectedActions, done) {
    var mutationCount = 0;
    var actionCount = 0;

    const module = Modules[moduleName];
    const testedAction = module.actions[actionName];

    const mockedContext = Object.assign(context, {
        dispatch (actionType, actionPayload) {
            // console.log("####### DISPATCH:",actionType);

            // loop up the next expected action
            const expectedAction = expectedActions[actionCount++];
            expect(expectedAction, 'An unexpected action ' + actionType + ' was commited').to.be.ok;

            // check for the correct type
            expect(actionType, 'incorrect action type: ' + actionType).to.equal(expectedAction.type);

            // // create context and execute nested action
            // const actionContext = {
            //     ...context,
            //     commit (mutationType, mutationPayload) {
            //         // console.log("$$$$$$ NESTED COMMIT",mutationType);
            //     },
            //     dispatch (actionType, actionPayload) {
            //         // console.log("$$$$$ NESTED DISPATCH",actionType);
            //     }
            // };

            // const [nestedActionModule,nestedActionName] = actionType.split("/");

            // try {
            //     if (nestedActionName) {
            //         Modules[nestedActionModule].actions[nestedActionName](actionContext, actionPayload);
            //     }
            //     else {
            //         const nestedAction = module.actions[actionType];
            //         nestedAction(actionContext, actionPayload);
            //     }
            // }
            // catch (err) {
            //     if (err.msg || err instanceof ReferenceError) {
            //         throw(err);
            //     }

            //     // anything else should have been caugth by individual action test
            // }
        },
        commit (mutationType, mutationPayload) {
            const mutation = module.mutations[mutationType];
            // console.log("####### COMMIT:",mutationType);

            // loop up the next expected mutation
            const expectedMutation = expectedMutations[mutationCount++];

            // check for the correct type
            expect(expectedMutation, 'An unexpected mutation ' + mutationType + ' was commited').to.be.ok;
            expect(mutationType, 'incorrect mutation type: ' + mutationType).to.equal(expectedMutation.type);

            // check for the correct payload

            if (expectedMutation.payload) {
                if (typeof expectedMutation.payload === 'function') {
                    expectedMutation.payload(mutationPayload);
                }
                else {
                    expect(mutationPayload).to.exist;
                    expect(mutationPayload).to.deep.equal(expectedMutation.payload);
                }
            }

            // console.log("################");
            // console.log("MODULE:",moduleName);
            // console.log("MUTATION:",mutationType);
            // console.log("MPL",mutationPayload);

            // mutation(mockedContext.state, mutationPayload); // execute mutation
        }
    });

    // call the action with mocked store and arguments
    testedAction(mockedContext, payload);
    
    expect(mutationCount, "The wrong number of mutations was committed by " + actionName + " action").to.equal(expectedMutations.length);
    expect(actionCount, "The wrong number of actions was dispatched by " + actionName + " action").to.equal(expectedActions.length);

    done && done();
};

export function testFunction(context, moduleName, func, args, expectedMutations, expectedActions, done) {
    var mutationCount = 0;
    var actionCount = 0;

    // console.log("### ACTION",moduleName,actionName);
    const module = Modules[moduleName];

    const mockedContext = Object.assign(context, {
        dispatch (actionType, actionPayload) {
            // console.log("FUNCTION DISPATCH:",actionType);

            // loop up the next expected action
            const expectedAction = expectedActions[actionCount++];
            expect(expectedAction, 'An unexpected action ' + actionType + ' was commited').to.be.ok;

            // check for the correct type
            expect(actionType, 'incorrect action type: ' + actionType).to.equal(expectedAction.type);
        },
        commit (mutationType, mutationPayload) {
            // console.log("FUNCTION COMMIT:",mutationType);

            const mutation = module.mutations[mutationType];

            // loop up the next expected mutation
            const expectedMutation = expectedMutations[mutationCount++];

            // check for the correct type
            expect(expectedMutation, 'An unexpected mutation ' + mutationType + ' was commited').to.be.ok;
            expect(mutationType, 'incorrect mutation type: ' + mutationType).to.equal(expectedMutation.type);

            // check for the correct payload

            if (expectedMutation.payload) {
                if (typeof expectedMutation.payload === 'function') {
                    expectedMutation.payload(mutationPayload);
                }
                else {
                    expect(mutationPayload).to.exist;
                    expect(mutationPayload).to.deep.equal(expectedMutation.payload);
                }
            }

            // console.log("################");
            // console.log("MODULE:",moduleName);
            // console.log("MUTATION:",mutationType);
            // console.log("MPL",mutationPayload);

            mutation(mockedContext.state, mutationPayload); // execute mutation
        }
    });

    // call the function with arguments
    const ret = func(...args);
    
    expect(mutationCount, "The wrong number of mutations was committed").to.equal(expectedMutations.length);
    expect(actionCount, "The wrong number of actions was dispatched").to.equal(expectedActions.length);

    done && done(ret);
};

export function parsePoints(points) {
    if (points && points.length) {
        const vertices = points.map(point => new geometryFactory.Vertex(point.x,point.y));
        const edges = vertices.map((vertex, dex, arr) => {
            const vertex2 = arr[dex + 1 >= arr.length ? 0 : dex + 1];
            return new geometryFactory.Edge(vertex.id,vertex2.id);
        });
        const edgeRefs = edges.map(edge => ({edge_id: edge.id, reverse: false}));
        const face = new geometryFactory.Face(edgeRefs);

        return {
            vertices,
            edges,
            edgeRefs,
            face
        };
    }

    return {};
};