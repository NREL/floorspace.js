import { expect } from 'chai'
import { geometry as Geometry, helpers } from '../../../../../src/store/modules/geometry/index.js'
import factory from '../../../../../src/store/factory/index.js'

describe('mutations', () => {
    it('initGeometry', () => {
        // mock state
        const geometryState = [];
        // create a geometry object for a story
        const geometry = new factory.Geometry();
        const story = new factory.Story();
        Geometry.mutations.initGeometry(geometryState, {
            geometry: geometry,
            story: story
        });

        // check that geometry was created and saved
        expect(geometryState.length).to.equal(1);
        expect(geometry.vertices.length).to.equal(0);
        expect(geometry.edges.length).to.equal(0);
        expect(geometry.faces.length).to.equal(0);

        // check that the story has a reference to the new geometry
        expect(story.geometry_id).to.equal(geometry.id);
    });

    it('createVertex and destroyVertex', () => {
        // initialize the state
        const geometryState = [];
        const geometry = new factory.Geometry();
        Geometry.mutations.initGeometry(geometryState, {
            geometry: geometry,
            story: new factory.Story()
        });

        // create a vertex
        const vertex = new factory.Vertex();
        Geometry.mutations.createVertex(geometryState, {
            geometry: geometry,
            vertex: vertex
        });
        // check that vertex was created and saved
        expect(geometry.vertices.length).to.equal(1);

        // destroy the vertex
        Geometry.mutations.destroyVertex(geometryState, {
            geometry: geometry,
            vertex_id: vertex.id
        });
        // check that the vertex was destroyed
        expect(geometry.vertices.length).to.equal(0);
    });

    it('createEdge and destroyEdge', () => {
        // initialize the state
        const geometryState = [];
        const geometry = new factory.Geometry();
        Geometry.mutations.initGeometry(geometryState, {
            geometry: geometry,
            story: new factory.Story()
        });

        // create an edge
        const edge = new factory.Edge();
        Geometry.mutations.createEdge(geometryState, {
            geometry: geometry,
            edge: edge
        });
        // check that edge was created and saved
        expect(geometry.edges.length).to.equal(1);

        // destroy the edge
        Geometry.mutations.destroyEdge(geometryState, {
            geometry: geometry,
            edge_id: edge.id
        });
        // check that the edge was destroyed
        expect(geometry.edges.length).to.equal(0);
    });

    it('createFace with no shared geometry, destroyFace', () => {
        // initialize the state
        const geometryState = [];
        const geometry = new factory.Geometry();
        const space = new factory.Space();
        Geometry.mutations.initGeometry(geometryState, {
            geometry: geometry,
            story: new factory.Story()
        });

        // set of points for the new face
        // there are no ids on points so the store will create a brand new vertex for each one
        const points = [
            { x: 0, y: 0 },
            { x: 0, y: 50 },
            { x: 50, y: 50 },
            { x: 50, y: 0 }
        ];

        Geometry.mutations.createFace(geometryState, {
            geometry: geometry,
            points: points,
            space: space
        });

        // check that the face was created and saved
        expect(geometry.vertices.length).to.equal(points.length);
        expect(geometry.edges.length).to.equal(points.length);
        expect(geometry.faces.length).to.equal(1);

        // check that the face has been given a reference to the new face
        expect(space.face_id).to.equal(geometry.faces[0].id);

        Geometry.mutations.destroyFace(geometryState, {
            geometry: geometry,
            space: space
        });
        expect(geometry.faces.length).to.equal(0);
        expect(space.face_id).to.be.null;
    });

    it('createFace with shared vertex', () => {
        // initialize the state
        const geometryState = [];
        const geometry = new factory.Geometry();
        Geometry.mutations.initGeometry(geometryState, {
            geometry: geometry,
            story: new factory.Story()
        });

        // set of points for the first face
        // there are no ids on points so the store will create a brand new vertex for each one
        const f1points = [
            { x: 0, y: 0 },
            { x: 0, y: 50 },
            { x: 50, y: 50 },
            { x: 50, y: 0 }
        ];
        const space1 = new factory.Space();

        // create the first face from regular points
        Geometry.mutations.createFace(geometryState, {
            geometry: geometry,
            points: f1points,
            space: space1
        });
        // check that the face has been given a reference to the new face
        expect(space1.face_id).to.equal(geometry.faces[0].id);

        const f2points = [
            { x: 50, y: 50 },
            { x: 50, y: 100 },
            { x: 100, y: 100 },
            { x: 100, y: 50 }
        ];
        // look up the vertex with the same coordinates as the first (shared) point
        const sharedVertex = geometry.vertices.find((v) => { return (v.x === f2points[0].x && v.y === f2points[0].y); })

        // add an vertex id to the first point so that it will be saved as a shared reference to the existing vertex
        f2points[0].id = sharedVertex.id;

        // create new face with a shared vertex
        const space2 = new factory.Space();
        Geometry.mutations.createFace(geometryState, {
            geometry: geometry,
            points: f2points,
            space: space2
        });
        // check that the face has been given a reference to the new face
        expect(space2.face_id).to.equal(geometry.faces[1].id);

        // check that there is one shared vertex
        expect(helpers.facesForVertex(sharedVertex.id, geometry).length).to.equal(2);

        // check that the expected number of vertices, edges, and faces exist
        expect(geometry.vertices.length).to.equal((f2points.length * 2) - 1);
        expect(geometry.edges.length).to.equal(f2points.length * 2);
        expect(geometry.faces.length).to.equal(2);
    });

    it('createFace with shared edge', () => {
        // initialize the state
        const geometryState = [];
        const geometry = new factory.Geometry();
        Geometry.mutations.initGeometry(geometryState, {
            geometry: geometry,
            story: new factory.Story()
        });

        // set of points for the first face
        // there are no ids on points so the store will create a brand new vertex for each one
        const f1points = [
            { x: 0, y: 0 },
            { x: 0, y: 50 },
            { x: 50, y: 50 },
            { x: 50, y: 0 }
        ];
        const space1 = new factory.Space();

        // create the first face from regular points
        Geometry.mutations.createFace(geometryState, {
            geometry: geometry,
            points: f1points,
            space: space1
        });
        // check that the face has been given a reference to the new face
        expect(space1.face_id).to.equal(geometry.faces[0].id);

        const f2points = [
            { x: 0, y: 50 },
            { x: 0, y: 100 },
            { x: 50, y: 100 },
            { x: 50, y: 50 }
        ];
        // look up the vertex with the same coordinates as the first (shared) point
        const sharedVertex1 = geometry.vertices.find((v) => { return (v.x === f2points[0].x && v.y === f2points[0].y); })
        const sharedVertex2 = geometry.vertices.find((v) => { return (v.x === f2points[3].x && v.y === f2points[3].y); })

        // add an vertex ids to the first and fourths shared points so that they will be saved as a shared reference to the existing vertex
        f2points[0].id = sharedVertex1.id;
        f2points[3].id = sharedVertex2.id;

        // create new face with a shared vertex
        const space2 = new factory.Space();
        Geometry.mutations.createFace(geometryState, {
            geometry: geometry,
            points: f2points,
            space: space2
        });
        // check that the face has been given a reference to the new face
        expect(space2.face_id).to.equal(geometry.faces[1].id);

        // check that there are two shared vertices
        expect(helpers.facesForVertex(sharedVertex1.id, geometry).length).to.equal(2);
        expect(helpers.facesForVertex(sharedVertex2.id, geometry).length).to.equal(2);

        // look up the edge with a reference to both of the shared vertices
        const v1edges = helpers.edgesForVertex(sharedVertex1.id, geometry);
        const v2edges = helpers.edgesForVertex(sharedVertex2.id, geometry);
        const sharedEdge = v1edges.find((edge) => {
            return ~v2edges.indexOf(edge);
        });

        // check that two faces are referencing the shared edge
        expect(helpers.facesForEdge(sharedEdge.id, geometry).length).to.equal(2);

        // check that the expected number of vertices, edges, and faces exist
        expect(geometry.vertices.length).to.equal((f2points.length + f1points.length) - 2);
        expect(geometry.edges.length).to.equal((f2points.length * 2) - 1);
        expect(geometry.faces.length).to.equal(2);
    });
});
