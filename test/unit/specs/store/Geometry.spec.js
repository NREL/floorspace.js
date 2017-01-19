import { expect } from 'chai'
import Geometry from '../../../../src/store/modules/geometry/index.js'
import factory from '../../../../src/store/factory/index.js'

describe('mutations', () => {
    it('initGeometry', () => {
        // mock state and payload
        const geometryState = [];
        const geometry = new factory.Geometry();
        const story = new factory.Story();
        const payload = {
            geometry: geometry,
            story: story
        };
        // apply mutation
        Geometry.mutations.initGeometry(geometryState, payload);

        // check that geometry was created and saved
        expect(geometryState.length).to.equal(1);
        expect(geometry.vertices.length).to.equal(0);
        expect(geometry.edges.length).to.equal(0);
        expect(geometry.faces.length).to.equal(0);

        // check that the mock story has a reference to the new geometry
        expect(story.geometry_id).to.equal(geometry.id);
    });

    it('createVertex and destroyVertex', () => {
        const geometryState = [];
        const geometry = new factory.Geometry();

        // initialize the state
        Geometry.mutations.initGeometry(geometryState, {
            geometry: geometry,
            story: new factory.Story()
        });

        const vertex = new factory.Vertex();
        Geometry.mutations.createVertex(geometryState, {
            geometry: geometry,
            vertex: vertex
        });

        // check that vertex was created and saved
        expect(geometry.vertices.length).to.equal(1);
        Geometry.mutations.destroyVertex(geometryState, {
            geometry: geometry,
            vertex_id: vertex.id
        });

        // check that vertex was destroyed
        expect(geometry.vertices.length).to.equal(0);
    });

    it('createEdge and destroyEdge', () => {
        const geometryState = [];
        const geometry = new factory.Geometry();
        // initialize the state
        Geometry.mutations.initGeometry(geometryState, {
            geometry: geometry,
            story: new factory.Story()
        });

        const edge = new factory.Edge();
        Geometry.mutations.createEdge(geometryState, {
            geometry: geometry,
            edge: edge
        });

        // check that edge was created and saved
        expect(geometry.edges.length).to.equal(1);
        Geometry.mutations.destroyEdge(geometryState, {
            geometry: geometry,
            edge_id: edge.id
        });

        // check that vertex was destroyed
        expect(geometry.edges.length).to.equal(0);
    });

    it('createFace with no shared geometry', () => {
        const geometryState = [];
        const geometry = new factory.Geometry();
        const space = new factory.Space();

        // initialize the state
        Geometry.mutations.initGeometry(geometryState, {
            geometry: geometry,
            story: new factory.Story()
        });

        const points = [
            { x: 0, y: 0 },
            { x: 50, y: 50 },
            { x: 50, y: 0 }
        ];

        Geometry.mutations.createFace(geometryState, {
            geometry: geometry,
            points: points,
            space: space
        });

        // check that edge was created and saved
        expect(geometryState[0].vertices.length).to.equal(points.length);
        expect(geometryState[0].edges.length).to.equal(points.length);
        expect(geometryState[0].faces.length).to.equal(1);
        expect(space.face_id).to.equal(geometryState[0].faces[0].id);
    });

    it('createFace with shared vertex', () => {
        const geometryState = [];
        const geometry = new factory.Geometry();

        // initialize the state
        Geometry.mutations.initGeometry(geometryState, {
            geometry: geometry,
            story: new factory.Story()
        });

        var points = [
            { x: 0, y: 0 },
            { x: 50, y: 50 },
            { x: 50, y: 0 }
        ];

        // create first face with three points
        Geometry.mutations.createFace(geometryState, {
            geometry: geometry,
            points: points,
            space: new factory.Space()
        });

        // swap out the first point in the points array with a reference to an existing vertex
        points[0] = geometryState[0].vertices[0];

        // create new face with two points and a shared vertex
        Geometry.mutations.createFace(geometryState, {
            geometry: geometry,
            points: points,
            space: new factory.Space()
        });

        // check that there are no duplicate points
        expect(geometryState[0].vertices.length).to.equal((points.length * 2) - 1);
        expect(geometryState[0].edges.length).to.equal(points.length * 2);
        expect(geometryState[0].faces.length).to.equal(2);
    });
    it('createFace with shared edge', () => {});
});
