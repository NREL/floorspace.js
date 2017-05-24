
export default {
    setEdgeRefsForFace (state, payload) {
        payload.face.edgeRefs = payload.edgeRefs;
    },

    initGeometry (state, payload) {
        state.push(payload.geometry);
        payload.story.geometry_id = payload.geometry.id;
    },
    createVertex (state, payload) {
        const geometry = state.find(g => g.id === payload.geometry.id);
        geometry.vertices.push(payload.vertex);
    },
    createEdge (state, payload) {
        const geometry = state.find(g => g.id === payload.geometry.id);
        geometry.edges.push(payload.edge);
        console.log(`create edge #${geometry.edges.length} with id ${payload.edge.id}`);
    },
    createEdgeRef (state, payload) {
        const allFaces = [].concat.apply([], state.map(g => g.faces)),
            allEdges = [].concat.apply([], state.map(g => g.edges)),
            face = allFaces.find(f => f.id === payload.face.id);
        if (allEdges.find(e => e.id === payload.edgeRef.edge_id)) {
            face.edgeRefs.push(payload.edgeRef);
            console.log("create edgeref", payload.edgeRef.edge_id, allEdges);
        }
    },
    createFace (state, payload) {
        const geometry = state.find(g => g.id === payload.geometry.id);
        geometry.faces.push(payload.face);
    },

    // remove a reference to an edge from a face
    destroyEdgeRef (state, payload) {
        const allFaces = [].concat.apply([], state.map(g => g.faces)),
            face = allFaces.find(f => f.id === payload.face_id);
        face.edgeRefs.splice(face.edgeRefs.findIndex(eR => eR.edge_id === payload.edge_id, 1));
    },

    // remove a face, edge, or vertex from the datastore
    destroyVertex (state, payload) {
        const geometry = state.find(g => g.id === payload.geometry_id);
        geometry.vertices.splice(geometry.vertices.findIndex(v => v.id === payload.vertex_id, 1));
    },
    destroyEdge (state, payload) {
        const geometry = state.find(g => g.id === payload.geometry_id);
        geometry.edges.splice(geometry.edges.findIndex(e => e.id === payload.edge_id, 1));
        console.log("destroy edge", payload.edge_id, geometry.edges);
    },
    destroyFace (state, payload) {
        const geometry = state.find(g => g.id === payload.geometry_id);
        geometry.faces.splice(geometry.faces.findIndex(f => f.id === payload.face_id, 1));
    }
}
