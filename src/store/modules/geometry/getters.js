import helpers from './helpers'

export default {
  denormalized(state) {
    return state.map(g => helpers.denormalize(g));
  },

    /*
    * When the user saves a floorplan, format the geometry for openstudio
    */
    exportData (state, getters, rootState, rootGetters) {
        return state.map(geometry => ({
			id: geometry.id,
            vertices: geometry.vertices.map(vertex => ({
                id: vertex.id,
                x: Number(vertex.x),
                y: Number(vertex.y),
                edge_ids: helpers.edgesForVertexId(vertex.id, geometry).map(e => e.id)
            })),

            edges: geometry.edges.map(edge => ({
                id: edge.id,
                vertex_ids: [edge.v1, edge.v2],
                face_ids: helpers.facesForEdgeId(edge.id, geometry).map(f => f.id)
            })),

            faces: geometry.faces.map(face => ({
                id: face.id,
                edge_ids: face.edgeRefs.map(eR => eR.edge_id),
                // tracks the direction of each edge in the edge_ids array (0 for reverse)
                edge_order: face.edgeRefs.map(eR => eR.reverse ? 0 : 1)
            }))
        }));
    }
}
