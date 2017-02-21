import { expect } from 'chai'
import Geometry from '../../../../../../src/store/modules/geometry/index.js'

import helpers from '../../../../../../src/store/modules/geometry/helpers.js'
import geometryFactory from '../../../../../../src/store/modules/geometry/factory.js'
import modelFactory from '../../../../../../src/store/modules/models/factory.js'
import testAction from '../../helpers/testAction.js'

describe('createFaceFromPoints -', () => {

    it('create a valid face on a space with no existing face', () => {
        // local state for the module, context.rootState and context.state share a reference to this
        const geometryState = [new geometryFactory.Geometry()];
        const store = Geometry,
            actionName = 'createFaceFromPoints',
            payload = {},
            context = {
                rootGetters: {},
                rootState: {
                    application: { currentSelections: {} },
                    geometry: geometryState
                },
                state: geometryState
            },
            expectedMutations = [],
            expectedActions = [];

        // init context
        const currentStoryGeometry = geometryState[0];
        const currentSelectionsSpace = new modelFactory.Space();
        const currentSelectionsStory = new modelFactory.Story();

        context.rootGetters['application/currentStoryGeometry'] = currentStoryGeometry;
        context.rootState.application.currentSelections.story = currentSelectionsStory;
        currentSelectionsStory.spaces.push(currentSelectionsSpace);
        context.rootState.application.currentSelections.space = currentSelectionsSpace;

        // payload
        // valid set of points, no intersection logic
        payload.points = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 }
        ];
        // space with no associated face
        payload.space = currentSelectionsSpace;

        // expectedMutations
        for (var i = 0; i < payload.points.length; i++) {
            const point = payload.points[i];
            expectedMutations.push({
                type: 'createVertex',
                testMutation (mpl) {
                    expect(mpl.geometry).to.equal(currentStoryGeometry);
                    expect(mpl.vertex.x).to.equal(point.x);
                    expect(mpl.vertex.y).to.equal(point.y);
                    return () => {
                        expect(currentStoryGeometry.vertices).to.contain(mpl.vertex);
                    };
                }
            });
        }

        payload.points.forEach((point) => {
            expectedMutations.push({
                type: 'createEdge',
                testMutation (mpl) {
                    expect(mpl.geometry).to.equal(currentStoryGeometry);
                    expect(mpl.edge.v1).to.be.a('number');
                    expect(mpl.edge.v2).to.be.a('number');
                    return () => {
                        expect(currentStoryGeometry.edges).to.contain(mpl.edge);
                    };
                }
            });
        });

        expectedMutations.push({
            type: 'createFace',
            testMutation (mpl) {
                expect(mpl.geometry).to.equal(currentStoryGeometry);
                expect(mpl.face.edgeRefs.length).to.equal(payload.points.length);

                return () => {
                    expect(currentStoryGeometry.faces).to.contain(mpl.face);
                };
            }
        });
        expectedMutations.push({
            type: 'models/updateSpaceWithData',
            testMutation (mpl) {
                expect(mpl.space).to.equal(payload.space);
                expect(mpl.face_id).to.be.a('number');
                return () => {
                    // TODO: test root level mutations
                };
            }
        });
        expectedMutations.push({
            type: 'setEdgeRefsForFace',
            testMutation (mpl) {
                expect(mpl.face).to.be.ok;
                expect(mpl.edgeRefs.length).to.equal(payload.points.length);
                return () => {
                    const updatedFace = currentStoryGeometry.faces.find(f => f.id === mpl.face.id),
                        normalizedEdges = helpers.normalizedEdges(updatedFace, currentStoryGeometry);

                    expect(updatedFace.edgeRefs).to.deep.equal(normalizedEdges);
                };
            }
        });

        testAction(store, actionName, context, payload, expectedMutations, expectedActions);
    });

    it('create a new valid face on a space with an existing face, no intersections or shared edges', () => {
        // local state for the module, context.rootState and context.state share a reference to this
        const geometryState = [new geometryFactory.Geometry()];
        const store = Geometry,
            actionName = 'createFaceFromPoints',
            payload = {},
            context = {
                rootGetters: {},
                rootState: {
                    application: { currentSelections: {} },
                    geometry: geometryState
                },
                state: geometryState
            },
            expectedMutations = [],
            expectedActions = [];

        // init context
        const currentStoryGeometry = geometryState[0];
        const currentSelectionsSpace = new modelFactory.Space();
        const currentSelectionsStory = new modelFactory.Story();

        // create an existing face on the current space
        const faceData = faceDataForPoints([
            { x: 3, y: 0 },
            { x: 4, y: 0 },
            { x: 4, y: 1 },
            { x: 3, y: 1 }
        ]);
        geometryState[0].vertices = faceData.vertices;
        geometryState[0].edges = faceData.edges;
        geometryState[0].faces.push(faceData.face);
        const existingFace = faceData.face;
        currentSelectionsSpace.face_id = existingFace.id;

        context.rootGetters['application/currentStoryGeometry'] = currentStoryGeometry;
        context.rootState.application.currentSelections.story = currentSelectionsStory;
        currentSelectionsStory.spaces.push(currentSelectionsSpace);
        context.rootState.application.currentSelections.space = currentSelectionsSpace;

        // payload
        // valid set of points, no intersection logic
        payload.points = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 }
        ];
        // space with an associated face
        payload.space = currentSelectionsSpace;

        expectedMutations.push({
            type: 'models/updateSpaceWithData',
            testMutation (mpl) {
                expect(mpl.space).to.equal(currentSelectionsSpace);
                expect(mpl.space.face_id).to.equal(existingFace.id);
                expect(mpl.face_id).to.equal(null);
                return () => {
                    expect(currentSelectionsSpace.face_id).to.equal(null);
                };
            }
        });
        expectedActions.push({
            type: 'destroyFaceAndDescendents',
            testAction (mpl) {
                expect(mpl.geometry).to.equal(currentStoryGeometry);
                expect(mpl.face).to.equal(existingFace);

                // manually remove the face and descendents from the store since the action isn't actually dispatched
                geometryState[0].faces.splice(geometryState[0].faces.findIndex(f => f.id === mpl.face.id), 1);
                geometryState[0].vertices = [];
                geometryState[0].edges = [];

                return () => {
                    expect(currentSelectionsSpace.face_id).to.equal(null);
                };
            }
        });

        // expectedMutations
        for (var i = 0; i < payload.points.length; i++) {
            const point = payload.points[i];
            expectedMutations.push({
                type: 'createVertex',
                testMutation (mpl) {

                    expect(mpl.geometry).to.equal(currentStoryGeometry);
                    expect(mpl.vertex.x).to.equal(point.x);
                    expect(mpl.vertex.y).to.equal(point.y);
                    return () => {
                        expect(currentStoryGeometry.vertices).to.contain(mpl.vertex);
                    };
                }
            });
        }

        payload.points.forEach((point) => {
            expectedMutations.push({
                type: 'createEdge',
                testMutation (mpl) {
                    expect(mpl.geometry).to.equal(currentStoryGeometry);
                    expect(mpl.edge.v1).to.be.a('number');
                    expect(mpl.edge.v2).to.be.a('number');
                    return () => {
                        expect(currentStoryGeometry.edges).to.contain(mpl.edge);
                    };
                }
            });
        });

        expectedMutations.push({
            type: 'createFace',
            testMutation (mpl) {
                expect(mpl.geometry).to.equal(currentStoryGeometry);
                expect(mpl.face.edgeRefs.length).to.equal(payload.points.length);

                return () => {
                    expect(currentStoryGeometry.faces).to.contain(mpl.face);
                };
            }
        });
        expectedMutations.push({
            type: 'models/updateSpaceWithData',
            testMutation (mpl) {
                expect(mpl.space).to.equal(payload.space);
                expect(mpl.face_id).to.be.a('number');
                return () => {
                    // TODO: test root level mutations
                    expect(payload.space.face_id).to.equal(mpl.face_id);
                };
            }
        });
        expectedMutations.push({
            type: 'setEdgeRefsForFace',
            testMutation (mpl) {
                expect(mpl.face).to.be.ok;
                expect(mpl.edgeRefs.length).to.equal(payload.points.length);
                return () => {
                    const updatedFace = currentStoryGeometry.faces.find(f => f.id === mpl.face.id),
                        normalizedEdges = helpers.normalizedEdges(updatedFace, currentStoryGeometry);

                    expect(updatedFace.edgeRefs).to.deep.equal(normalizedEdges);
                };
            }
        });

        testAction(store, actionName, context, payload, expectedMutations, expectedActions);
    });

    it('create a new valid face on a space with an existing face, use union of new and existing face because they have an intersection', () => {
        // local state for the module, context.rootState and context.state share a reference to this
        const geometryState = [new geometryFactory.Geometry()];
        const store = Geometry,
            actionName = 'createFaceFromPoints',
            payload = {},
            context = {
                rootGetters: {},
                rootState: {
                    application: { currentSelections: {} },
                    geometry: geometryState
                },
                state: geometryState
            },
            expectedMutations = [],
            expectedActions = [];

        // init context
        const currentStoryGeometry = geometryState[0];
        const currentSelectionsSpace = new modelFactory.Space();
        const currentSelectionsStory = new modelFactory.Story();

        // create an existing face on the current space
        const faceData = faceDataForPoints([
            { x: 0, y: 0 },
            { x: 4, y: 0 },
            { x: 4, y: 1 },
            { x: 0, y: 1 }
        ]);
        geometryState[0].vertices = faceData.vertices;
        geometryState[0].edges = faceData.edges;
        geometryState[0].faces.push(faceData.face);
        const existingFace = faceData.face;
        currentSelectionsSpace.face_id = existingFace.id;

        context.rootGetters['application/currentStoryGeometry'] = currentStoryGeometry;
        context.rootState.application.currentSelections.story = currentSelectionsStory;
        currentSelectionsStory.spaces.push(currentSelectionsSpace);
        context.rootState.application.currentSelections.space = currentSelectionsSpace;

        // payload
        // valid set of points, no intersection logic
        payload.points = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 1 }
        ];
        // space with an associated face
        payload.space = currentSelectionsSpace;

        expectedMutations.push({
            type: 'models/updateSpaceWithData',
            testMutation (mpl) {
                expect(mpl.space).to.equal(currentSelectionsSpace);
                expect(mpl.space.face_id).to.equal(existingFace.id);
                expect(mpl.face_id).to.equal(null);
                return () => {
                    expect(currentSelectionsSpace.face_id).to.equal(null);
                };
            }
        });
        expectedActions.push({
            type: 'destroyFaceAndDescendents',
            testAction (mpl) {
                expect(mpl.geometry).to.equal(currentStoryGeometry);
                expect(mpl.face).to.equal(existingFace);


                return () => {
                    // manually remove the face and descendents from the store since the action isn't actually dispatched
                    geometryState[0].faces.splice(geometryState[0].faces.findIndex(f => f.id === mpl.face.id), 1);
                    geometryState[0].vertices = [];
                    geometryState[0].edges = [];

                    expect(currentSelectionsSpace.face_id).to.equal(null);
                };
            }
        });

        // expectedMutations
        for (var i = 0; i < payload.points.length; i++) {
            const point = payload.points[i];
            expectedMutations.push({
                type: 'createVertex',
                testMutation (mpl) {

                    expect(mpl.geometry).to.equal(currentStoryGeometry);
                    expect(mpl.vertex.x).to.equal(point.x);
                    expect(mpl.vertex.y).to.equal(point.y);
                    return () => {
                        expect(currentStoryGeometry.vertices).to.contain(mpl.vertex);
                    };
                }
            });
        }

        payload.points.forEach((point) => {
            expectedMutations.push({
                type: 'createEdge',
                testMutation (mpl) {
                    expect(mpl.geometry).to.equal(currentStoryGeometry);
                    expect(mpl.edge.v1).to.be.a('number');
                    expect(mpl.edge.v2).to.be.a('number');
                    return () => {
                        expect(currentStoryGeometry.edges).to.contain(mpl.edge);
                    };
                }
            });
        });

        expectedMutations.push({
            type: 'createFace',
            testMutation (mpl) {
                expect(mpl.geometry).to.equal(currentStoryGeometry);
                expect(mpl.face.edgeRefs.length).to.equal(payload.points.length);

                return () => {
                    expect(currentStoryGeometry.faces).to.contain(mpl.face);
                };
            }
        });
        expectedMutations.push({
            type: 'models/updateSpaceWithData',
            testMutation (mpl) {
                expect(mpl.space).to.equal(payload.space);
                expect(mpl.face_id).to.be.a('number');
                return () => {
                    // TODO: test root level mutations
                    expect(payload.space.face_id).to.equal(mpl.face_id);
                };
            }
        });
        expectedMutations.push({
            type: 'setEdgeRefsForFace',
            testMutation (mpl) {
                expect(mpl.face).to.be.ok;
                expect(mpl.edgeRefs.length).to.equal(payload.points.length);
                return () => {
                    const updatedFace = currentStoryGeometry.faces.find(f => f.id === mpl.face.id),
                        normalizedEdges = helpers.normalizedEdges(updatedFace, currentStoryGeometry);

                    expect(updatedFace.edgeRefs).to.deep.equal(normalizedEdges);
                };
            }
        });

        testAction(store, actionName, context, payload, expectedMutations, expectedActions);
    });
});

// returns a set of vertices, edges, and a face defined by a set of ordered points
function faceDataForPoints (points) {
    const data = {
        vertices: points.map(p => new geometryFactory.Vertex(p.x, p.y)),
        edges: [],
        face: {}
    };
    for (var i = 0; i < data.vertices.length; i++) {
        const v1 = data.vertices[i],
            v2 = i + 1 < data.vertices.length ? data.vertices[i + 1] : data.vertices[0];
        data.edges.push(new geometryFactory.Edge(v1.id, v2.id))
    }

    data.face = new geometryFactory.Face(data.edges.map((edge) => {
        return { edge_id: edge.id, reverse: 1 };
    }));
    return data;
}
