import helpers from './helpers.js'

export default {
    setEdgeRefsForFace (state, payload) {
        payload.face.edgeRefs = payload.edgeRefs;
    },

    initGeometry (state, payload) {
        state.push(payload.geometry);
        payload.story.geometry_id = payload.geometry.id;
    },
    createVertex (state, payload) {
        payload.geometry.vertices.push(payload.vertex);
    },
    createEdge (state, payload) {
        payload.geometry.edges.push(payload.edge);
    },
    createEdgeRef (state, payload) {
        payload.face.edgeRefs.push(payload.edgeRef);
    },
    createFace (state, payload) {
        payload.geometry.faces.push(payload.face);
    },

    destroyVertex (state, payload) {
        payload.geometry.vertices.splice(payload.geometry.vertices.findIndex((v) => {
            return v.id === payload.vertex_id;
        }), 1);
    },
    destroyEdge (state, payload) {
        payload.geometry.edges.splice(payload.geometry.edges.findIndex((e) => {
            return e.id === payload.edge_id;
        }), 1);
    },
    destroyEdgeRef (state, payload) {
        payload.face.edgeRefs.splice(payload.face.edgeRefs.findIndex((edgeRef) => {
            return edgeRef.edge_id === payload.edge_id;
        }), 1);
    },
    destroyFace (state, payload) {
        payload.geometry.faces.splice(payload.geometry.faces.findIndex((f) => {
            return f.id === payload.space.face_id;
        }), 1);
        console.log("destroying face: ", payload.space.face_id, "for space: ", payload.space.id);
        payload.space.face_id = null;
    }
}
