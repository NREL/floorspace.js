import factory from './factory.js'
import helpers from './helpers'

export default {
    exportData (state, getters, rootState, rootGetters) {
        const geometrySets = JSON.parse(JSON.stringify(state));
        geometrySets.forEach((geometry) => {
            geometry.vertices = geometry.vertices.map((vertex) => {
                return {
                    id: vertex.id,
                    x: Number(vertex.x),
                    y: Number(vertex.y),
                    edge_ids: helpers.edgesForVertex(vertex.id, geometry).map(e => e.id)
                };
            });

            geometry.edges = geometry.edges.map((edge) => {
                return {
                    id: edge.id,
                    vertex_ids: [edge.v1, edge.v2],
                    face_ids: helpers.facesForEdge(edge.id, geometry).map(f => f.id)
                };
            });

            geometry.faces = geometry.faces.map((face) => {
                return {
                    id: face.id,
                    edge_ids: face.edgeRefs.map(eR => eR.edge_id),
                    edge_order: face.edgeRefs.map(eR => eR.reverse ? 0 : 1)
                };
            });
        });
        return geometrySets;
    }
}
