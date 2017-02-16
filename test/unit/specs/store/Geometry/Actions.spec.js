import { expect } from 'chai'
import Geometry from '../../../../../src/store/modules/geometry/index.js'

import helpers from '../../../../../src/store/modules/geometry/helpers.js'
import geometryFactory from '../../../../../src/store/modules/geometry/factory.js'
import modelFactory from '../../../../../src/store/modules/models/factory.js'
import testAction from '../helpers/testAction.js'
//testAction (store, actionName, context, payload, expectedMutations, expectedActions)
describe('geometry actions', () => {
    it('initGeometry', () => {
        // local state for the module, context.rootState and context.state share a reference to this
        const geometryState = [];
        const store = Geometry,
            actionName = 'initGeometry',
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

        const story = new modelFactory.Story();
        payload.story = story;

        expectedMutations.push({
            type: 'initGeometry',
            testMutation (mpl) {
                expect(mpl.story).to.equal(story);
                expect(mpl.geometry.id).to.be.a('number');
                expect(mpl.geometry.vertices).to.be.an('array');
                expect(mpl.geometry.edges).to.be.an('array');
                expect(mpl.geometry.faces).to.be.an('array');

                return () => {
                    expect(context.state[0]).to.equal(mpl.geometry);
                };
            }

        });
        testAction(store, actionName, context, payload, expectedMutations, expectedActions);
    });




    // it('createFaceFromPoints on a space with no existing face', () => {
    //     const geometry = new geometryFactory.Geometry();
    //     const space = new modelFactory.Space();
    //     const context = {
    //         rootGetters: { 'application/currentStoryGeometry': geometry },
    //         rootState: {
    //             application: {
    //                 currentSelections: { space: space }
    //             }
    //         }
    //     };
    //
    //     const points = [
    //         { x: 0, y: 0 },
    //         { x: 0, y: 50 },
    //         { x: 50, y: 50 },
    //         { x: 50, y: 0 }
    //     ];
    //
    //     var expectedMutations = [];
    //
    //     points.forEach((point) => {
    //         expectedMutations.push({
    //             type: 'createVertex',
    //             testPayload (payload) {
    //                 expect(payload.geometry).to.equal(geometry);
    //                 expect(payload.vertex.x).to.equal(point.x);
    //                 expect(payload.vertex.y).to.equal(point.y);
    //             }
    //         });
    //     });
    //
    //     points.forEach((point) => {
    //         expectedMutations.push({
    //             type: 'createEdge',
    //             testPayload (payload) {
    //                 expect(payload.geometry).to.equal(geometry);
    //                 expect(payload.edge.v1).to.be.a('number');
    //                 expect(payload.edge.v2).to.be.a('number');
    //             }
    //         });
    //     });
    //
    //     expectedMutations.push({
    //         type: 'createFace',
    //         testPayload (payload) {
    //             expect(payload.geometry).to.equal(geometry);
    //             expect(payload.face.edgeRefs.length).to.equal(points.length);
    //         }
    //     });
    //
    //     expectedMutations.push({
    //         type: 'models/updateSpaceWithData',
    //         testPayload (payload) {
    //             expect(payload.face_id).to.be.a.number;
    //             expect(payload.space).to.equal(space);
    //         }
    //     });
    //
    //     testAction(Geometry.actions.createFaceFromPoints, {
    //         geometry: geometry,
    //         space: space,
    //         points: points
    //     }, context, expectedMutations, []);
    // });
    //
    // it('createFaceFromPoints on a space with an existing face, no intersection or shared edge between new and existing face', () => {
    //     const geometry = new geometryFactory.Geometry();
    //     const space = new modelFactory.Space();
    //
    //     const context = {
    //         rootGetters: { 'application/currentStoryGeometry': geometry },
    //         rootState: {
    //             application: {
    //                 currentSelections: { space: space }
    //             }
    //         }
    //     };
    //
    //     const existingFacePoints = [
    //         { x: 0, y: 0 },
    //         { x: 0, y: 50 },
    //         { x: 50, y: 50 },
    //         { x: 50, y: 0 }
    //     ];
    //
    //     // create vertices and edges for the face, store on geometry
    //     for (var i = 0; i < 4; i++) {
    //         const vertex = new geometryFactory.Vertex(existingFacePoints[i].x, existingFacePoints[i].y);
    //         const edge = new geometryFactory.Edge();
    //         geometry.vertices.push(vertex);
    //         geometry.edges.push(edge);
    //     }
    //
    //     // give each edge a reference to two vertices, store a reference to each edge on the face
    //     const edgeRefs = [];
    //     for (var i = 0; i < geometry.edges.length; i++) {
    //         geometry.edges[i].v1 = geometry.vertices[i].id;
    //         geometry.edges[i].v2 = i + 1 < geometry.edges.length ? geometry.vertices[i + 1].id : geometry.vertices[0].id;
    //         edgeRefs.push({
    //             edge_id: geometry.edges[i].id,
    //             reverse: false
    //         });
    //     }
    //
    //     // initialize face with edge references, store face on geometry and give space a reference to the face
    //     const existingFace = new geometryFactory.Face(edgeRefs);
    //     geometry.faces.push(existingFace);
    //     space.face_id = existingFace.id;
    //
    //     const newPoints = [
    //         { x: 100, y: 100 },
    //         { x: 100, y: 150 },
    //         { x: 150, y: 150 },
    //         { x: 150, y: 100 }
    //     ];
    //
    //     var expectedMutations = [];
    //
    //     newPoints.forEach((point) => {
    //         expectedMutations.push({
    //             type: 'createVertex',
    //             testPayload (payload) {
    //                 expect(payload.geometry).to.equal(geometry);
    //                 expect(payload.vertex.x).to.equal(point.x);
    //                 expect(payload.vertex.y).to.equal(point.y);
    //             }
    //         });
    //     });
    //
    //     newPoints.forEach((point) => {
    //         expectedMutations.push({
    //             type: 'createEdge',
    //             testPayload (payload) {
    //                 expect(payload.geometry).to.equal(geometry);
    //                 expect(payload.edge.v1).to.be.a('number');
    //                 expect(payload.edge.v2).to.be.a('number');
    //             }
    //         });
    //     });
    //
    //     expectedMutations.push({
    //         type: 'createFace',
    //         testPayload (payload) {
    //             expect(payload.geometry).to.equal(geometry);
    //             expect(payload.face.edgeRefs.length).to.equal(newPoints.length);
    //         }
    //     });
    //
    //     expectedMutations.push({
    //         type: 'models/updateSpaceWithData',
    //         testPayload (payload) {
    //             expect(payload.face_id).to.be.a.number;
    //             expect(payload.space).to.equal(space);
    //         }
    //     });
    //
    //     testAction(Geometry.actions.createFaceFromPoints, {
    //         geometry: geometry,
    //         space: space,
    //         points: newPoints
    //     }, context, expectedMutations, [{
    //         type: 'destroyFace',
    //         testPayload (payload) {
    //             expect(payload.geometry).to.equal(geometry);
    //             expect(payload.space).to.equal(space);
    //         }
    //     }]);
    // });
    //
    // it('createFaceFromPoints on a space with an existing face, use union because there is an intersection between new and existing face', () => {
    //     const geometry = new geometryFactory.Geometry();
    //     const space = new modelFactory.Space();
    //
    //     const context = {
    //         rootGetters: { 'application/currentStoryGeometry': geometry },
    //         rootState: {
    //             application: {
    //                 currentSelections: { space: space }
    //             }
    //         }
    //     };
    //
    //     const existingFacePoints = [
    //         { x: 0, y: 0 },
    //         { x: 0, y: 50 },
    //         { x: 50, y: 50 },
    //         { x: 50, y: 0 }
    //     ];
    //
    //     // create vertices and edges for the face, store on geometry
    //     for (var i = 0; i < 4; i++) {
    //         const vertex = new geometryFactory.Vertex(existingFacePoints[i].x, existingFacePoints[i].y);
    //         const edge = new geometryFactory.Edge();
    //         geometry.vertices.push(vertex);
    //         geometry.edges.push(edge);
    //     }
    //
    //     // give each edge a reference to two vertices, store a reference to each edge on the face
    //     const edgeRefs = [];
    //     for (var i = 0; i < geometry.edges.length; i++) {
    //         geometry.edges[i].v1 = geometry.vertices[i].id;
    //         geometry.edges[i].v2 = i + 1 < geometry.edges.length ? geometry.vertices[i + 1].id : geometry.vertices[0].id;
    //
    //         edgeRefs.push({
    //             edge_id: geometry.edges[i].id,
    //             reverse: false
    //         });
    //     }
    //
    //     // initialize face with edge references, store face on geometry and give space a reference to the face
    //     const existingFace = new geometryFactory.Face(edgeRefs);
    //     geometry.faces.push(existingFace);
    //     space.face_id = existingFace.id;
    //
    //     const newPoints = [
    //         { x: 25, y: 25 },
    //         { x: 25, y: 75 },
    //         { x: 75, y: 75 },
    //         { x: 75, y: 25 }
    //     ];
    //
    //     const clipperPaths = newPoints.map((p) => { return { X: p.x, Y: p.y }; })
    //     expect(helpers.intersectionOfFaces(existingFace, clipperPaths, geometry)).to.be.ok;
    //
    //     const unionPoints = helpers.unionOfFaces(existingFace, clipperPaths, geometry);
    //     var expectedMutations = [];
    //
    //     unionPoints.forEach((point) => {
    //         expectedMutations.push({
    //             type: 'createVertex',
    //             testPayload (payload) {
    //                 expect(payload.geometry).to.equal(geometry);
    //                 expect(payload.vertex.x).to.equal(point.x);
    //                 expect(payload.vertex.y).to.equal(point.y);
    //             }
    //         });
    //     });
    //
    //     unionPoints.forEach((point) => {
    //         expectedMutations.push({
    //             type: 'createEdge',
    //             testPayload (payload) {
    //                 expect(payload.geometry).to.equal(geometry);
    //                 expect(payload.edge.v1).to.be.a('number');
    //                 expect(payload.edge.v2).to.be.a('number');
    //             }
    //         });
    //     });
    //
    //     expectedMutations.push({
    //         type: 'createFace',
    //         testPayload (payload) {
    //             expect(payload.geometry).to.equal(geometry);
    //             expect(payload.face.edgeRefs.length).to.equal(unionPoints.length);
    //         }
    //     });
    //
    //     expectedMutations.push({
    //         type: 'models/updateSpaceWithData',
    //         testPayload (payload) {
    //             expect(payload.face_id).to.be.a.number;
    //             expect(payload.space).to.equal(space);
    //         }
    //     });
    //
    //     testAction(Geometry.actions.createFaceFromPoints, {
    //         geometry: geometry,
    //         space: space,
    //         points: newPoints
    //     }, context, expectedMutations, [{
    //         type: 'destroyFace',
    //         testPayload (payload) {
    //             expect(payload.geometry).to.equal(geometry);
    //             expect(payload.space).to.equal(space);
    //         }
    //     }]);
    // });

    // it('createFaceFromPoints on a space with an existing face, use union because there is a shared edge between new and existing face', () => {
    //     //
    // });
    //
    // it('createFace with shared vertex', () => {
    //     // initialize the state
    //     const geometryState = [];
    //     const geometry = new geometryFactory.Geometry();
    //     Geometry.mutations.initGeometry(geometryState, {
    //         geometry: geometry,
    //         story: new modelFactory.Story()
    //     });
    //
    //     // set of points for the first face
    //     // there are no ids on points so the store will create a brand new vertex for each one
    //     const f1points = [
    //         { x: 0, y: 0 },
    //         { x: 0, y: 50 },
    //         { x: 50, y: 50 },
    //         { x: 50, y: 0 }
    //     ];
    //     const space1 = new modelFactory.Space();
    //
    //     // create the first face from regular points
    //     Geometry.mutations.createFace(geometryState, {
    //         geometry: geometry,
    //         points: f1points,
    //         space: space1
    //     });
    //     // check that the face has been given a reference to the new face
    //     expect(space1.face_id).to.equal(geometry.faces[0].id);
    //
    //     const f2points = [
    //         { x: 50, y: 50 },
    //         { x: 50, y: 100 },
    //         { x: 100, y: 100 },
    //         { x: 100, y: 50 }
    //     ];
    //     // look up the vertex with the same coordinates as the first (shared) point
    //     const sharedVertex = geometry.vertices.find((v) => { return (v.x === f2points[0].x && v.y === f2points[0].y); })
    //
    //     // add an vertex id to the first point so that it will be saved as a shared reference to the existing vertex
    //     f2points[0].id = sharedVertex.id;
    //
    //     // create new face with a shared vertex
    //     const space2 = new modelFactory.Space();
    //     Geometry.mutations.createFace(geometryState, {
    //         geometry: geometry,
    //         points: f2points,
    //         space: space2
    //     });
    //     // check that the face has been given a reference to the new face
    //     expect(space2.face_id).to.equal(geometry.faces[1].id);
    //
    //     // check that there is one shared vertex
    //     expect(helpers.facesForVertex(sharedVertex.id, geometry).length).to.equal(2);
    //
    //     // check that the expected number of vertices, edges, and faces exist
    //     expect(geometry.vertices.length).to.equal((f2points.length * 2) - 1);
    //     expect(geometry.edges.length).to.equal(f2points.length * 2);
    //     expect(geometry.faces.length).to.equal(2);
    // });
    //
    // it('createFace with shared edge that is reversed', () => {
    //     // initialize the state
    //     const geometryState = [];
    //     const geometry = new geometryFactory.Geometry();
    //     Geometry.mutations.initGeometry(geometryState, {
    //         geometry: geometry,
    //         story: new modelFactory.Story()
    //     });
    //
    //     // set of points for the first face, drawn clockwise
    //     // there are no ids on points so the store will create a brand new vertex for each one
    //     const f1points = [
    //         { x: 0, y: 0 },
    //         { x: 50, y: 0 },
    //         { x: 50, y: 50 },
    //         { x: 0, y: 50 }
    //     ];
    //     const space1 = new modelFactory.Space();
    //
    //     // create the first face from regular points
    //     Geometry.mutations.createFace(geometryState, {
    //         geometry: geometry,
    //         points: f1points,
    //         space: space1
    //     });
    //     // check that the face has been given a reference to the new face
    //     expect(space1.face_id).to.equal(geometry.faces[0].id);
    //
    //     // second face is also clockwise so the shared edge is reversed
    //     const f2points = [
    //         { x: 0, y: 50 },
    //         { x: 50, y: 50 },
    //         { x: 50, y: 100 },
    //         { x: 0, y: 100 }
    //     ];
    //
    //     // set vertex id on points with the same coordinates as an exisitng vertex so that they will be saved as a shared reference to that vertex
    //     f2points.forEach((p) => {
    //         geometry.vertices.forEach((v) => {
    //             if (p.x === v.x && p.y === v.y) {
    //                 p.id = v.id;
    //             }
    //         });
    //     });
    //
    //     // create new face with a shared vertex
    //     const space2 = new modelFactory.Space();
    //     Geometry.mutations.createFace(geometryState, {
    //         geometry: geometry,
    //         points: f2points,
    //         space: space2
    //     });
    //     // check that the face has been given a reference to the new face
    //     expect(space2.face_id).to.equal(geometry.faces[1].id);
    //
    //     // look up the shared vertices
    //     const sharedVertices = geometry.vertices.filter((v) => {
    //         return helpers.facesForVertex(v.id, geometry).length === 2;
    //     })
    //     // check that there are two shared vertices
    //     expect(sharedVertices.length).to.equal(2);
    //
    //     // look up the shared edges
    //     const sharedEdges = geometry.edges.filter((e) => {
    //         return helpers.facesForEdge(e.id, geometry).length === 2;
    //     })
    //     // check that there are two shared edges
    //     expect(sharedEdges.length).to.equal(1);
    //
    //     // check that the shared edge is reversed
    //     const sharedEdgeRef = helpers.faceForId(space2.face_id, geometry)
    //         .edgeRefs.find((edgeRef) => {
    //             return edgeRef.edge_id === sharedEdges[0].id;
    //         });
    //     expect(sharedEdgeRef.reverse).to.equal(true);
    //
    //     // check that the expected number of vertices, edges, and faces exist
    //     expect(geometry.vertices.length).to.equal((f2points.length + f1points.length) - 2);
    //     expect(geometry.edges.length).to.equal((f2points.length * 2) - 1);
    //     expect(geometry.faces.length).to.equal(2);
    // });
    //
    // it('createFace with shared edge that is not reversed', () => {
    //     // initialize the state
    //     const geometryState = [];
    //     const geometry = new geometryFactory.Geometry();
    //     Geometry.mutations.initGeometry(geometryState, {
    //         geometry: geometry,
    //         story: new modelFactory.Story()
    //     });
    //
    //     // set of points for the first face, drawn clockwise
    //     // there are no ids on points so the store will create a brand new vertex for each one
    //     const f1points = [
    //         { x: 0, y: 0 },
    //         { x: 50, y: 0 },
    //         { x: 50, y: 50 },
    //         { x: 0, y: 50 }
    //     ];
    //     const space1 = new modelFactory.Space();
    //
    //     // create the first face from regular points
    //     Geometry.mutations.createFace(geometryState, {
    //         geometry: geometry,
    //         points: f1points,
    //         space: space1
    //     });
    //     // check that the face has been given a reference to the new face
    //     expect(space1.face_id).to.equal(geometry.faces[0].id);
    //
    //     // second face is counter clockwise so the shared edge is not reversed
    //     const f2points = [
    //         { x: 0, y: 50 },
    //         { x: 0, y: 100 },
    //         { x: 50, y: 100 },
    //         { x: 50, y: 50 }
    //     ];
    //
    //     // set vertex id on points with the same coordinates as an exisitng vertex so that they will be saved as a shared reference to that vertex
    //     f2points.forEach((p) => {
    //         geometry.vertices.forEach((v) => {
    //             if (p.x === v.x && p.y === v.y) {
    //                 p.id = v.id;
    //             }
    //         });
    //     });
    //
    //     // create new face with a shared vertex
    //     const space2 = new modelFactory.Space();
    //     Geometry.mutations.createFace(geometryState, {
    //         geometry: geometry,
    //         points: f2points,
    //         space: space2
    //     });
    //     // check that the face has been given a reference to the new face
    //     expect(space2.face_id).to.equal(geometry.faces[1].id);
    //
    //     // look up the shared vertices
    //     const sharedVertices = geometry.vertices.filter((v) => {
    //         return helpers.facesForVertex(v.id, geometry).length === 2;
    //     })
    //     // check that there are two shared vertices
    //     expect(sharedVertices.length).to.equal(2);
    //
    //     // look up the shared edges
    //     const sharedEdges = geometry.edges.filter((e) => {
    //         return helpers.facesForEdge(e.id, geometry).length === 2;
    //     })
    //     // check that there are two shared edges
    //     expect(sharedEdges.length).to.equal(1);
    //
    //     // check that the shared edge is reversed
    //     const sharedEdgeRef = helpers.faceForId(space2.face_id, geometry)
    //         .edgeRefs.find((edgeRef) => {
    //             return edgeRef.edge_id === sharedEdges[0].id;
    //         })
    //
    //     expect(sharedEdgeRef.reverse).to.equal(false);
    //
    //     // check that the expected number of vertices, edges, and faces exist
    //     expect(geometry.vertices.length).to.equal((f2points.length + f1points.length) - 2);
    //     expect(geometry.edges.length).to.equal((f2points.length * 2) - 1);
    //     expect(geometry.faces.length).to.equal(2);
    // });
//
//     it('destroyFace with no shared edges or vertices', () => {
//         // initialize the state
//         const geometry = new geometryFactory.Geometry();
//         const space = new modelFactory.Space();
//
//         // create vertices and edges for the face, store on geometry
//         for (var i = 0; i < 4; i++) {
//             const vertex = new geometryFactory.Vertex();
//             const edge = new geometryFactory.Edge();
//             geometry.vertices.push(vertex);
//             geometry.edges.push(edge);
//         }
//
//         // give each edge a reference to two vertices, store a reference to each edge on the face
//         const edgeRefs = [];
//         for (var i = 0; i < geometry.edges.length; i++) {
//             geometry.edges[i].v1 = geometry.vertices[i].id;
//             geometry.edges[i].v2 = i + 1 < geometry.edges.length ? geometry.vertices[i + 1].id : geometry.vertices[0].id;
//
//             edgeRefs.push({
//                 edge_id: geometry.edges[i].id,
//                 reverse: false
//             });
//         }
//
//         // initialize face with edge references, store face on geometry and give space a reference to the face
//         const face = new geometryFactory.Face(edgeRefs);
//         geometry.faces.push(face);
//         space.face_id = face.id;
//
//         // mock context
//         const context = {
//             state: [geometry],
//             rootGetters: { 'application/currentStoryGeometry': geometry },
//             rootState: {
//                 application: {
//                     currentSelections: { space: space }
//                 }
//             }
//         };
//
//         // mutations expected
//         var expectedMutations = [];
//
//         geometry.vertices.forEach((vertex) => {
//             expectedMutations.push({
//                 type: 'destroyVertex',
//                 testPayload (payload) {
//                     expect(payload.geometry).to.equal(geometry);
//                     expect(payload.vertex_id).to.equal(vertex.id);
//                 }
//             });
//         });
//
//         geometry.edges.forEach((edge) => {
//             expectedMutations.push({
//                 type: 'destroyEdge',
//                 testPayload (payload) {
//                     expect(payload.geometry).to.equal(geometry);
//                     expect(payload.edge_id).to.equal(edge.id);
//                 }
//             });
//         });
//
//         expectedMutations.push({
//             type: 'destroyFace',
//             testPayload (payload) {
//                 expect(payload.geometry).to.equal(geometry);
//                 expect(payload.face_id).to.equal(face.id);
//             }
//         });
//
//         testAction(Geometry.actions.destroyFace, {
//             geometry: geometry,
//             space: space
//         }, context, expectedMutations, []);
//     });
//     //
//     it('destroyFace with a shared vertex', () => {
//         // initialize the state
//         const geometry = new geometryFactory.Geometry();
//
//         // create 7 vertices and 8 edges since one vertex is shared, store on geometry
//         for (var i = 0; i < 7; i++) {
//             const vertex = new geometryFactory.Vertex();
//             geometry.vertices.push(vertex);
//             const edge = new geometryFactory.Edge();
//             geometry.edges.push(edge);
//         }
//         const edge = new geometryFactory.Edge();
//         geometry.edges.push(edge);
//
//         var edgeRefs = [];
//
//         // face 1
//         const space1 = new modelFactory.Space();
//         // give each edge a reference to two vertices, store a reference to each edge on the face
//         for (var i = 0; i < 4; i++) {
//             geometry.edges[i].v1 = geometry.vertices[i].id;
//             geometry.edges[i].v2 = i < 3 ? geometry.vertices[i + 1].id : geometry.vertices[0].id;
//
//             edgeRefs.push({
//                 edge_id: geometry.edges[i].id,
//                 reverse: false
//             });
//         }
//
//         // initialize face with edge references, store face on geometry and give space a reference to the face
//         const face1 = new geometryFactory.Face(edgeRefs);
//         geometry.faces.push(face1);
//         space1.face_id = face1.id;
//
//         const space2 = new modelFactory.Space();
//         // give each edge a reference to two vertices, store a reference to each edge on the face
//         edgeRefs = [];
//         for (var i = 4; i < 8; i++) {
//             geometry.edges[i].v1 = geometry.vertices[i - 1].id;
//             geometry.edges[i].v2 = i < 7 ? geometry.vertices[i].id : geometry.vertices[3].id; // space2 will share a reference to geometry.vertices[3]
//
//             edgeRefs.push({
//                 edge_id: geometry.edges[i].id,
//                 reverse: false
//             });
//         }
//
//         // initialize face with edge references, store face on geometry and give space a reference to the face
//         const face2 = new geometryFactory.Face(edgeRefs);
//         geometry.faces.push(face2);
//         space2.face_id = face2.id;
//
//         // mock context
//         var context = {
//             state: [geometry],
//             rootGetters: { 'application/currentStoryGeometry': geometry },
//             rootState: {
//                 application: {
//                     currentSelections: { space: space1 }
//                 }
//             }
//         };
//
//         // mutations expected
//         var expectedMutations = [];
//         helpers.verticesforFace(face1, geometry).forEach((vertex, i) => {
//             if (helpers.facesForVertex(vertex.id, geometry).length === 2) { return; }
//             expectedMutations.push({
//                 type: 'destroyVertex',
//                 testPayload (payload) {
//                     expect(payload.geometry).to.equal(geometry);
//                     expect(payload.vertex_id).to.equal(vertex.id);
//                 }
//             });
//         });
//
//         face1.edgeRefs.map((edgeRef) => {
//             return geometry.edges.find((edge) => {
//                 return edge.id === edgeRef.edge_id;
//             });
//         }).forEach((edge) => {
//             expectedMutations.push({
//                 type: 'destroyEdge',
//                 testPayload (payload) {
//                     expect(payload.geometry).to.equal(geometry);
//                     expect(payload.edge_id).to.equal(edge.id);
//                 }
//             });
//         });
//
//         expectedMutations.push({
//             type: 'destroyFace',
//             testPayload (payload) {
//                 expect(payload.geometry).to.equal(geometry);
//                 expect(payload.face_id).to.equal(face1.id);
//             }
//         });
//
//         testAction(Geometry.actions.destroyFace, {
//             geometry: geometry,
//             space: space1
//         }, context, expectedMutations, []);
//     });
//
//     it('destroyFace with a shared edge', () => {
//         // initialize the state
//         const geometry = new geometryFactory.Geometry();
//
//         // create 6 vertices and 7 edges since two vertices and one edge are shared, store on geometry
//         for (var i = 0; i < 7; i++) {
//             const vertex = new geometryFactory.Vertex();
//             geometry.vertices.push(vertex);
//             const edge = new geometryFactory.Edge();
//             geometry.edges.push(edge);
//         }
//         const edge = new geometryFactory.Edge();
//         geometry.edges.push(edge);
//
//         var edgeRefs = [];
//
//         // face 1
//         const space1 = new modelFactory.Space();
//         // give each edge a reference to two vertices, store a reference to each edge on the face
//         for (var i = 0; i < 4; i++) {
//             geometry.edges[i].v1 = geometry.vertices[i].id;
//             geometry.edges[i].v2 = i < 3 ? geometry.vertices[i + 1].id : geometry.vertices[0].id;
//
//             edgeRefs.push({
//                 edge_id: geometry.edges[i].id,
//                 reverse: false
//             });
//         }
//
//         // initialize face with edge references, store face on geometry and give space a reference to the face
//         const face1 = new geometryFactory.Face(edgeRefs);
//         geometry.faces.push(face1);
//         space1.face_id = face1.id;
//
//         const space2 = new modelFactory.Space();
//         // give each edge a reference to two vertices, store a reference to each edge on the face
//         edgeRefs = [];
//         for (var i = 3; i < 7; i++) {
//             geometry.edges[i].v1 = geometry.vertices[i].id;
//             geometry.edges[i].v2 = i < 6 ? geometry.vertices[i + 1].id : geometry.vertices[2].id; // space2 will share a reference to geometry.vertices[3]
//
//             edgeRefs.push({
//                 edge_id: geometry.edges[i].id,
//                 reverse: false
//             });
//         }
//
//         // initialize face with edge references, store face on geometry and give space a reference to the face
//         const face2 = new geometryFactory.Face(edgeRefs);
//         geometry.faces.push(face2);
//         space2.face_id = face2.id;
//
//         // mock context
//         var context = {
//             state: [geometry],
//             rootGetters: { 'application/currentStoryGeometry': geometry },
//             rootState: {
//                 application: {
//                     currentSelections: { space: space1 }
//                 }
//             }
//         };
//
//         // mutations expected
//         var expectedMutations = [];
//         helpers.verticesforFace(face1, geometry).forEach((vertex, i) => {
//             if (helpers.facesForVertex(vertex.id, geometry).length === 2) { return; }
//             expectedMutations.push({
//                 type: 'destroyVertex',
//                 testPayload (payload) {
//                     expect(payload.geometry).to.equal(geometry);
//                     expect(payload.vertex_id).to.equal(vertex.id);
//                 }
//             });
//         });
//
//         face1.edgeRefs.map((edgeRef) => {
//             return geometry.edges.find((edge) => {
//                 return edge.id === edgeRef.edge_id;
//             });
//         }).forEach((edge) => {
//             if (helpers.facesForEdge(edge.id, geometry).length === 2) { return; }
//             expectedMutations.push({
//                 type: 'destroyEdge',
//                 testPayload (payload) {
//                     expect(payload.geometry).to.equal(geometry);
//                     expect(payload.edge_id).to.equal(edge.id);
//                 }
//             });
//         });
//
//         expectedMutations.push({
//             type: 'destroyFace',
//             testPayload (payload) {
//                 expect(payload.geometry).to.equal(geometry);
//                 expect(payload.face_id).to.equal(face1.id);
//             }
//         });
//
//         testAction(Geometry.actions.destroyFace, {
//             geometry: geometry,
//             space: space1
//         }, context, expectedMutations, []);
//     });
//
//     it('splitEdge with a point on the edge', () => {
//         const splitPoint = {
//             x: 1,
//             y: 1
//         };
//         // geometry.edges[2] will be split
//         const points = [
//             { x: 0, y: 0 },
//             { x: 0, y: 2 },
//             { x: 1, y: 2 },
//             { x: 1, y: 0 }
//         ];
//
//         // initialize the state
//         const geometry = new geometryFactory.Geometry();
//         const space = new modelFactory.Space();
//
//         // create vertices and edges for the face, store on geometry
//         for (var i = 0; i < 4; i++) {
//             const vertex = new geometryFactory.Vertex();
//             vertex.x = points[i].x;
//             vertex.y = points[i].y;
//             const edge = new geometryFactory.Edge();
//             geometry.vertices.push(vertex);
//             geometry.edges.push(edge);
//         }
//
//         // give each edge a reference to two vertices, store a reference to each edge on the face
//         const edgeRefs = [];
//         for (var i = 0; i < geometry.edges.length; i++) {
//             geometry.edges[i].v1 = geometry.vertices[i].id;
//             geometry.edges[i].v2 = i + 1 < geometry.edges.length ? geometry.vertices[i + 1].id : geometry.vertices[0].id;
//
//             edgeRefs.push({
//                 edge_id: geometry.edges[i].id,
//                 reverse: false
//             });
//         }
//
//         // initialize face with edge references, store face on geometry and give space a reference to the face
//         const face = new geometryFactory.Face(edgeRefs);
//         geometry.faces.push(face);
//         space.face_id = face.id;
//
//         // mock context
//         var context = {
//             state: [geometry],
//             rootGetters: { 'application/currentStoryGeometry': geometry }
//         };
//
//         const splittingVertex = new geometryFactory.Vertex(splitPoint.x, splitPoint.y);
//         testAction(Geometry.actions.splitEdge, {
//             vertex: splittingVertex,
//             edge: geometry.edges[2]
//         }, context, [
//             // create the first new edge from originaledge.v1 to splittingVertex
//             {
//                 type: 'createEdge',
//                 testPayload (payload) {
//                     expect(payload.geometry).to.equal(geometry);
//                     expect(payload.edge.v2).to.equal(splittingVertex.id);
//                 }
//             },
//             // create the second new edge from splittingVertex to originaledge.v2
//             {
//                 type: 'createEdge',
//                 testPayload (payload) {
//                     expect(payload.geometry).to.equal(geometry);
//                     expect(payload.edge.v1).to.equal(splittingVertex.id);
//                 }
//             }, {
//                 type: 'createEdgeRef',
//                 testPayload (payload) {
//                     expect(payload.face).to.equal(face);
//                     expect(payload.edgeRef.edge_id).to.be.a('number');
//                 }
//             }, {
//                 type: 'createEdgeRef',
//                 testPayload (payload) {
//                     expect(payload.face).to.equal(face);
//                     expect(payload.edgeRef.edge_id).to.be.a('number');
//                 }
//             },
//             // delete originaledge
//             {
//                 type: 'destroyEdge',
//                 testPayload (payload) {
//                     expect(payload.geometry).to.equal(geometry);
//                     expect(payload.edge_id).to.equal(geometry.edges[2].id);
//                 }
//             }, {
//                 type: 'setEdgeRefsForFace',
//                 testPayload (payload) {
//                     const normalizeEdges = helpers.normalizedEdges(face, geometry);
//                     expect(payload.edgeRefs).to.deep.equal(normalizeEdges);
//                     expect(payload.face).to.equal(face);
//                 }
//             }
//         ], []);
//     });
//
//     it('createFaceFromPoints by snapping to another face at one point', () => {
//         const geometry = new geometryFactory.Geometry();
//         const space = new modelFactory.Space();
//
//         const context = {
//             rootGetters: { 'application/currentStoryGeometry': geometry },
//             rootState: {
//                 application: {
//                     currentSelections: { space: space }
//                 }
//             }
//         };
//
//         // create existing face to snap against
//         const points = [
//             { x: 0, y: 0 },
//             { x: 0, y: 50 },
//             { x: 50, y: 50 },
//             { x: 50, y: 0 }
//         ];
//         geometry.vertices = points.map((p) => { return new geometryFactory.Vertex(p.x, p.y); });
//         for (var i = 0; i < geometry.vertices.length; i++) {
//             const v1Id = geometry.vertices[i].id,
//                 v2Id = i < geometry.vertices.length - 1 ? geometry.vertices[i + 1].id : geometry.vertices[0].id;
//             geometry.edges.push(new geometryFactory.Edge(v1Id, v2Id));
//         }
//
//         const face = new geometryFactory.Face(geometry.edges.map((edge) => {
//             return {
//                 edge_id: edge.id,
//                 reverse: false
//             };
//         }));
//
//         // points for new face
//         const newPoints = [
//             { x: 50, y: 0 },
//             { x: 50, y: 25, splittingEdge: geometry.edges[2] },
//             { x: 75, y: 25 },
//             { x: 75, y: 0 }
//         ];
//
//         var expectedMutations = [];
//
//         newPoints.forEach((point) => {
//             expectedMutations.push({
//                 type: 'createVertex',
//                 testPayload (payload) {
//                     expect(payload.geometry).to.equal(geometry);
//                     expect(payload.vertex.x).to.equal(point.x);
//                     expect(payload.vertex.y).to.equal(point.y);
//                 }
//             });
//         });
//
//         newPoints.forEach((point) => {
//             expectedMutations.push({
//                 type: 'createEdge',
//                 testPayload (payload) {
//                     expect(payload.geometry).to.equal(geometry);
//                     expect(payload.edge.v1).to.be.a('number');
//                     expect(payload.edge.v2).to.be.a('number');
//                 }
//             });
//         });
//
//         expectedMutations.push({
//             type: 'createFace',
//             testPayload (payload) {
//                 expect(payload.geometry).to.equal(geometry);
//                 expect(payload.face.edgeRefs.length).to.equal(newPoints.length);
//             }
//         });
//
//         expectedMutations.push({
//             type: 'models/updateSpaceWithData',
//             testPayload (payload) {
//                 expect(payload.face_id).to.be.a.number;
//                 expect(payload.space).to.equal(space);
//             }
//         });
//
//         testAction(Geometry.actions.createFaceFromPoints, {
//             geometry: geometry,
//             space: space,
//             points: newPoints
//         }, context, expectedMutations, [{
//             type: 'splitEdge',
//             testPayload (payload) {
//                 // normally this wouldn't be undefined, but since we don't actually run the createVertex mutations this vertex doesn't exist
//                 expect(payload.vertex).to.be.undefined;
//                 expect(payload.edge).to.equal(geometry.edges[2]);
//             }
//         }]);
//     });
//
//     it('createFaceFromPoints by snapping to another face at two points', () => {
//         const geometry = new geometryFactory.Geometry();
//         const space = new modelFactory.Space();
//
//         const context = {
//             rootGetters: { 'application/currentStoryGeometry': geometry },
//             rootState: {
//                 application: {
//                     currentSelections: { space: space }
//                 }
//             }
//         };
//
//         // create existing face to snap against
//         const points = [
//             { x: 0, y: 0 },
//             { x: 0, y: 50 },
//             { x: 50, y: 50 },
//             { x: 50, y: 0 }
//         ];
//         geometry.vertices = points.map((p) => { return new geometryFactory.Vertex(p.x, p.y); });
//         for (var i = 0; i < geometry.vertices.length; i++) {
//             const v1Id = geometry.vertices[i].id,
//                 v2Id = i < geometry.vertices.length - 1 ? geometry.vertices[i + 1].id : geometry.vertices[0].id;
//             geometry.edges.push(new geometryFactory.Edge(v1Id, v2Id));
//         }
//         const face = new geometryFactory.Face(geometry.edges.map((edge) => {
//             return {
//                 edge_id: edge.id,
//                 reverse: false
//             };
//         }));
//
//         // points for new face
//         const newPoints = [
//             { x: 50, y: 20, splittingEdge: geometry.edges[2] },
//             { x: 50, y: 25, splittingEdge: geometry.edges[2] },
//             { x: 75, y: 25 },
//             { x: 75, y: 0 }
//         ];
//
//         var expectedMutations = [];
//
//         newPoints.forEach((point) => {
//             expectedMutations.push({
//                 type: 'createVertex',
//                 testPayload (payload) {
//                     expect(payload.geometry).to.equal(geometry);
//                     expect(payload.vertex.x).to.equal(point.x);
//                     expect(payload.vertex.y).to.equal(point.y);
//                 }
//             });
//         });
//
//         newPoints.forEach((point) => {
//             expectedMutations.push({
//                 type: 'createEdge',
//                 testPayload (payload) {
//                     expect(payload.geometry).to.equal(geometry);
//                     expect(payload.edge.v1).to.be.a('number');
//                     expect(payload.edge.v2).to.be.a('number');
//                 }
//             });
//         });
//
//         expectedMutations.push({
//             type: 'createFace',
//             testPayload (payload) {
//                 expect(payload.geometry).to.equal(geometry);
//                 expect(payload.face.edgeRefs.length).to.equal(newPoints.length);
//             }
//         });
//
//         expectedMutations.push({
//             type: 'models/updateSpaceWithData',
//             testPayload (payload) {
//                 expect(payload.face_id).to.be.a.number;
//                 expect(payload.space).to.equal(space);
//             }
//         });
//
//         testAction(Geometry.actions.createFaceFromPoints, {
//             geometry: geometry,
//             space: space,
//             points: newPoints
//         }, context, expectedMutations, [{
//             type: 'splitEdge',
//             testPayload (payload) {
//                 expect(payload.vertex).to.be.undefined;
//                 expect(payload.edge).to.equal(geometry.edges[2]);
//             }
//         }, {
//             type: 'splitEdge',
//             testPayload (payload) {
//                 expect(payload.vertex).to.be.undefined;
//                 expect(payload.edge).to.equal(geometry.edges[2]);
//             }
//         }]);
//     });
// });


// it('createFaceFromPoints', () => {
//     const action = Geometry.actions.createFaceFromPoints,
//         payload = {},
//         context = {
//             rootGetters: {},
//             rootState: {
//                 application: { currentSelections: {} }
//             }
//         },
//         expectedMutations = [],
//         expectedActions = [];
//
//     // context
//     const currentStoryGeometry = new geometryFactory.Geometry();
//     const currentSelectionsSpace = new modelFactory.Space();
//
//     context.rootGetters['application/currentStoryGeometry'] = currentStoryGeometry;
//     context.rootState.application.currentSelections.space = currentSelectionsSpace;
//
//     // payload
//
//     testAction(action, payload, context, expectedMutations, expectedActions);
// });
