import { expect } from 'chai'
import Geometry from '../../../../../src/store/modules/geometry/index.js'
import helpers from '../../../../../src/store/modules/geometry/helpers.js'
import geometryFactory from '../../../../../src/store/modules/geometry/factory.js'
import modelFactory from '../../../../../src/store/modules/models/factory.js'

describe('mutations', () => {
    // it('initGeometry', () => {
    //     // mock state
    //     const geometryState = [];
    //     // create a geometry object for a story
    //     const geometry = new geometryFactory.Geometry();
    //     const story = new modelFactory.Story();
    //     Geometry.mutations.initGeometry(geometryState, {
    //         geometry: geometry,
    //         story: story
    //     });
    //
    //     // check that geometry was created and saved
    //     expect(geometryState.length).to.equal(1);
    //     expect(geometry.vertices.length).to.equal(0);
    //     expect(geometry.edges.length).to.equal(0);
    //     expect(geometry.faces.length).to.equal(0);
    //
    //     // check that the story has a reference to the new geometry
    //     expect(story.geometry_id).to.equal(geometry.id);
    // });
    //
    // it('createVertex and destroyVertex', () => {
    //     // initialize the state
    //     const geometryState = [];
    //     const geometry = new geometryFactory.Geometry();
    //     Geometry.mutations.initGeometry(geometryState, {
    //         geometry: geometry,
    //         story: new modelFactory.Story()
    //     });
    //
    //     // create a vertex
    //     const vertex = new geometryFactory.Vertex();
    //     Geometry.mutations.createVertex(geometryState, {
    //         geometry: geometry,
    //         vertex: vertex
    //     });
    //     // check that vertex was created and saved
    //     expect(geometry.vertices.length).to.equal(1);
    //
    //     // destroy the vertex
    //     Geometry.mutations.destroyVertex(geometryState, {
    //         geometry: geometry,
    //         vertex_id: vertex.id
    //     });
    //     // check that the vertex was destroyed
    //     expect(geometry.vertices.length).to.equal(0);
    // });
    //
    // it('createEdge and destroyEdge', () => {
    //     // initialize the state
    //     const geometryState = [];
    //     const geometry = new geometryFactory.Geometry();
    //     Geometry.mutations.initGeometry(geometryState, {
    //         geometry: geometry,
    //         story: new modelFactory.Story()
    //     });
    //
    //     // create an edge
    //     const edge = new geometryFactory.Edge();
    //     Geometry.mutations.createEdge(geometryState, {
    //         geometry: geometry,
    //         edge: edge
    //     });
    //     // check that edge was created and saved
    //     expect(geometry.edges.length).to.equal(1);
    //
    //     // create a face referencing the edge
    //     const face = new geometryFactory.Face([{
    //         edge_id: edge.id,
    //         reverse: false
    //     }]);
    //     geometry.faces.push(face);
    //
    //     // check that edge reference was created and saved
    //     expect(face.edgeRefs.length).to.equal(1);
    //
    //     // destroy the edge
    //     Geometry.mutations.destroyEdge(geometryState, {
    //         geometry: geometry,
    //         edge_id: edge.id
    //     });
    //     // check that the edge was destroyed
    //     expect(geometry.edges.length).to.equal(0);
    //
    //     // check that edge reference on face was destroyed
    //     expect(face.edgeRefs.length).to.equal(0);
    // });
    //
    // it('createFace with no shared geometry, destroyFace', () => {
    //     // initialize the state
    //     const geometryState = [];
    //     const geometry = new geometryFactory.Geometry();
    //     const space = new modelFactory.Space();
    //     Geometry.mutations.initGeometry(geometryState, {
    //         geometry: geometry,
    //         story: new modelFactory.Story()
    //     });
    //
    //     // set of points for the new face
    //     // there are no ids on points so the store will create a brand new vertex for each one
    //     const points = [
    //         { x: 0, y: 0 },
    //         { x: 0, y: 50 },
    //         { x: 50, y: 50 },
    //         { x: 50, y: 0 }
    //     ];
    //
    //     Geometry.mutations.createFace(geometryState, {
    //         geometry: geometry,
    //         points: points,
    //         space: space
    //     });
    //
    //     // check that the face was created and saved
    //     expect(geometry.vertices.length).to.equal(points.length);
    //     expect(geometry.edges.length).to.equal(points.length);
    //     expect(geometry.faces.length).to.equal(1);
    //
    //     // check that the face has been given a reference to the new face
    //     expect(space.face_id).to.equal(geometry.faces[0].id);
    //
    //     Geometry.mutations.destroyFace(geometryState, {
    //         geometry: geometry,
    //         space: space
    //     });
    //     expect(geometry.faces.length).to.equal(0);
    //     expect(space.face_id).to.be.null;
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
});
