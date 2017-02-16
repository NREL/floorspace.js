import { expect } from 'chai'
import Geometry from '../../../../../src/store/modules/geometry/index.js'
import helpers from '../../../../../src/store/modules/geometry/helpers.js'
import geometryFactory from '../../../../../src/store/modules/geometry/factory.js'
import modelFactory from '../../../../../src/store/modules/models/factory.js'

// describe('mutations', () => {
//     it('initGeometry', () => {
//         // mock state
//         const geometryState = [];
//         // create a geometry object for a story
//         const geometry = new geometryFactory.Geometry();
//         const story = new modelFactory.Story();
//         Geometry.mutations.initGeometry(geometryState, {
//             geometry: geometry,
//             story: story
//         });
//
//         // check that geometry was created and saved
//         expect(geometryState.length).to.equal(1);
//         expect(geometry.vertices.length).to.equal(0);
//         expect(geometry.edges.length).to.equal(0);
//         expect(geometry.faces.length).to.equal(0);
//
//         // check that the story has a reference to the new geometry
//         expect(story.geometry_id).to.equal(geometry.id);
//     });
//
//     it('createVertex and destroyVertex', () => {
//         // initialize the state
//         const geometryState = [];
//         const geometry = new geometryFactory.Geometry();
//         Geometry.mutations.initGeometry(geometryState, {
//             geometry: geometry,
//             story: new modelFactory.Story()
//         });
//
//         // create a vertex
//         const vertex = new geometryFactory.Vertex();
//         Geometry.mutations.createVertex(geometryState, {
//             geometry: geometry,
//             vertex: vertex
//         });
//         // check that vertex was created and saved
//         expect(geometry.vertices.length).to.equal(1);
//
//         // destroy the vertex
//         Geometry.mutations.destroyVertex(geometryState, {
//             geometry: geometry,
//             vertex_id: vertex.id
//         });
//         // check that the vertex was destroyed
//         expect(geometry.vertices.length).to.equal(0);
//     });
//
//     it('createEdge and destroyEdge', () => {
//         // initialize the state
//         const geometryState = [];
//         const geometry = new geometryFactory.Geometry();
//         Geometry.mutations.initGeometry(geometryState, {
//             geometry: geometry,
//             story: new modelFactory.Story()
//         });
//
//         // create an edge
//         const edge = new geometryFactory.Edge();
//         Geometry.mutations.createEdge(geometryState, {
//             geometry: geometry,
//             edge: edge
//         });
//         // check that edge was created and saved
//         expect(geometry.edges.length).to.equal(1);
//
//         // create a face referencing the edge
//         const face = new geometryFactory.Face([{
//             edge_id: edge.id,
//             reverse: false
//         }]);
//         geometry.faces.push(face);
//
//         // check that edge reference was created and saved
//         expect(face.edgeRefs.length).to.equal(1);
//
//         // destroy the edge
//         Geometry.mutations.destroyEdge(geometryState, {
//             geometry: geometry,
//             edge_id: edge.id
//         });
//         // check that the edge was destroyed
//         expect(geometry.edges.length).to.equal(0);
//
//         // check that edge reference on face was destroyed
//         expect(face.edgeRefs.length).to.equal(0);
//     });
//
//     it('createFace, destroyFace', () => {
//         // initialize the state
//         const geometryState = [];
//         const geometry = new geometryFactory.Geometry();
//         const space = new modelFactory.Space();
//         Geometry.mutations.initGeometry(geometryState, {
//             geometry: geometry,
//             story: new modelFactory.Story()
//         });
//
//         const face = new geometryFactory.Face();
//         Geometry.mutations.createFace(geometryState, {
//             geometry: geometry,
//             face: face,
//             space: space
//         });
//
//         expect(geometry.faces.length).to.equal(1);
//
//         // check that the space has been given a reference to the new face
//         expect(space.face_id).to.equal(face.id);
//
//         Geometry.mutations.destroyFace(geometryState, {
//             geometry: geometry,
//             space: space
//         });
//         expect(geometry.faces.length).to.equal(0);
//         expect(space.face_id).to.be.null;
//     });
// });
