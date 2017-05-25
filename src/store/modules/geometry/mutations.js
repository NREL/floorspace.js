
export default {

    initGeometry (state, payload) {
        state.push(payload.geometry);
        payload.story.geometry_id = payload.geometry.id;
    },
    createVertex (state, payload) {
        const geometry = state.find(g => g.id === payload.geometry.id);
        geometry.vertices.push(payload.vertex);
    },
    createEdge (state, payload) {
        const geometry = state.find(g => g.id === payload.geometry_id);
        geometry.edges.push(payload.edge);
    },
    createEdgeRef (state, payload) {
        const allFaces = [].concat.apply([], state.map(g => g.faces)),
            allEdges = [].concat.apply([], state.map(g => g.edges)),
            face = allFaces.find(f => f.id === payload.face.id);
        if (allEdges.find(e => e.id === payload.edgeRef.edge_id)) {
            face.edgeRefs.push(payload.edgeRef);
        }
    },
    createFace (state, payload) {
        const geometry = state.find(g => g.id === payload.geometry.id);
        geometry.faces.push(payload.face);
    },

    // set the array of edgeRefs on a face
    setEdgeRefsForFace (state, payload) {
        const allFaces = [].concat.apply([], state.map(g => g.faces)),
            face = allFaces.find(f => f.id === payload.face_id);
        face.edgeRefs = payload.edgeRefs;
    },
    // remove a reference to an edge from a face
    destroyEdgeRef (state, payload) {
        const allFaces = [].concat.apply([], state.map(g => g.faces)),
            face = allFaces.find(f => f.id === payload.face_id);
        face.edgeRefs.splice(face.edgeRefs.findIndex(eR => eR.edge_id === payload.edge_id), 1);
    },

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
    }
}
