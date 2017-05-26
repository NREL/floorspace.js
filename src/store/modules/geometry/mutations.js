
export default {
    /*
    * create a new geometry set, face, edge, or vertex in the data store
    */
    initGeometry (state, payload) { state.push(payload.geometry); },
    createVertex (state, payload) { state.find(g => g.id === payload.geometry_id).vertices.push(payload.vertex); },
    createEdge (state, payload) { state.find(g => g.id === payload.geometry_id).edges.push(payload.edge); },
    createFace (state, payload) { state.find(g => g.id === payload.geometry_id).faces.push(payload.face); },

    /*
    * removes an object with a given id from the datastore
    * the object can be a geometry set, face, edge, or vertex
    */
    destroyGeometry (state, payload) {
        // id of the object to be destroyed
        const { id } = payload;

        // loop through all geometry sets in the store and check if they contain the object
        // break from the loop if the object is found
        for (var i = 0; i < state.length; i++) {
            const g = state[i];
            if (g.id === id) {
                state.splice(state.findIndex(g => g.id === id), 1);
                break;
            } else if (~g.faces.map(f => f.id).indexOf(id)) {
                console.log(`destroy face ${id}`);
                g.faces.splice(g.faces.findIndex(f => f.id === id), 1);
                break;
            } else if (~g.edges.map(e => e.id).indexOf(id)) {
                g.edges.splice(g.edges.findIndex(e => e.id === id), 1);
                break;
            } else if (~g.vertices.map(v => v.id).indexOf(id)) {
                g.vertices.splice(g.vertices.findIndex(v => v.id === id), 1);
                break;
            }
        }
    },

    // set a reference to an edge on a face
    createEdgeRef (state, payload) {
        const { geometry_id, face_id, edgeRef } = payload,
            geometry = state.find(g => g.id === geometry_id),
            face = geometry.faces.find(f => f.id === face_id),
            edge = geometry.edges.find(e => e.id === edgeRef.edge_id);

        if (edge) { face.edgeRefs.push(edgeRef); }
    },

    // set the array of edgeRefs on a face
    setEdgeRefsForFace (state, payload) {
        const { geometry_id, face_id, edgeRefs } = payload,
            geometry = state.find(g => g.id === geometry_id),
            face = geometry.faces.find(f => f.id === face_id);
        face.edgeRefs = edgeRefs.filter(ref => geometry.edges.find(e => e.id === ref.edge_id));
    },

    // remove a reference to an edge from a face
    destroyEdgeRef (state, payload) {
        const { geometry_id, face_id, edge_id } = payload,
            geometry = state.find(g => g.id === geometry_id),
            face = geometry.faces.find(f => f.id === face_id);
        face.edgeRefs.splice(face.edgeRefs.findIndex(eR => eR.edge_id === edge_id), 1);
    }
}
