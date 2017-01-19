import { expect } from 'chai'
import Geometry from '../../../../src/store/modules/geometry/index.js'
import factory from '../../../../src/store/factory/index.js'

describe('mutations', () => {
    it('initGeometry', () => {
        // mock state and payload
        const geometryState = [];
        const payload = {
            geometry: new factory.Geometry(),
            story: {}
        };
        // apply mutation
        Geometry.mutations.initGeometry(geometryState, payload);

        // check that geometry was created and saved
        expect(geometryState.length).to.equal(1);
        expect(geometryState[0].vertices.length).to.equal(0);
        expect(geometryState[0].edges.length).to.equal(0);
        expect(geometryState[0].faces.length).to.equal(0);

        // check that the mock story has a reference to the new geometry
        expect(payload.story.geometry_id).to.equal(payload.geometry.id);
    });

    it('createVertex and destroyVertex', () => {
        const geometryState = [];
        const geometry = new factory.Geometry();
        const vertex = new factory.Vertex();
        // initialize the state
        Geometry.mutations.initGeometry(geometryState, {
            geometry: geometry,
            story: {}
        });

        Geometry.mutations.createVertex(geometryState, {
            geometry: geometry,
            vertex: vertex
        });

        // check that vertex was created and saved
        expect(geometryState[0].vertices.length).to.equal(1);
        Geometry.mutations.destroyVertex(geometryState, {
            geometry: geometry,
            vertex_id: vertex.id
        });

        // check that vertex was destroyed
        expect(geometryState[0].vertices.length).to.equal(0);
    });

    it('createEdge and destroyEdge', () => {
        const geometryState = [];
        const geometry = new factory.Geometry();
        const edge = new factory.Edge();
        // initialize the state
        Geometry.mutations.initGeometry(geometryState, {
            geometry: geometry,
            story: {}
        });

        Geometry.mutations.createEdge(geometryState, {
            geometry: geometry,
            edge: edge
        });

        // check that edge was created and saved
        expect(geometryState[0].edges.length).to.equal(1);
        Geometry.mutations.destroyEdge(geometryState, {
            geometry: geometry,
            edge_id: edge.id
        });

        // check that vertex was destroyed
        expect(geometryState[0].edges.length).to.equal(0);
    });
});
