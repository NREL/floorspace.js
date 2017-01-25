import factory from './factory.js'
import helpers from './helpers'

export default {
    // initialize a new geometry object for a story
    initGeometry (context, payload) {
        // create the geometry object
        payload.geometry = new factory.Geometry();
        context.commit('initGeometry', payload);
    },

    splitEdge (context, payload) {
        const faces = helpers.facesForEdge(payload.edge.id, context.state.geometry);
        faces.forEach((face) => {
            const edgeRef = face.edgeRefs.find((edgeRef) => {
                edgeRef.edge_id === payload.edge.id;
            });
            if (edgeRef.reverse) {

            }
        });
    },

    destroyFace (context, payload) {
        const geometry = payload.geometry;
        const space = payload.space;
        const expFace = geometry.faces.find((face) => { return face.id === space.face_id; })

        // delete associated vertices
        // filter edges referenced by only the face being destroyed so that no shared edges are destroyed
        var expVertices = helpers.verticesforFace(expFace, geometry).filter((vertex) => {
            return helpers.facesForVertex(vertex.id, geometry).length === 1;
        });

        expVertices.forEach((vertex) => {
            context.commit('destroyVertex', {
                geometry: geometry,
                vertex_id: vertex.id
            });
        });

        // delete associated edges
        var expEdgeRefs = expFace.edgeRefs;
        // filter edges referenced by only the face being destroyed so that no shared edges are destroyed
        expEdgeRefs = expEdgeRefs.filter((edgeRef) => {
            return helpers.facesForEdge(edgeRef.edge_id, geometry).length === 1;
        });

        expEdgeRefs.forEach((edgeRef) => {
            context.commit('destroyEdge', {
                geometry: geometry,
                edge_id: edgeRef.edge_id
            });
        });

        context.commit('destroyFace', {
            geometry: geometry,
            space: space,
            face_id: expFace.id
        });
    },
    createFaceFromPoints (context, payload) {
        // geometry and space for the current story
        const geometry = context.rootGetters['application/currentStoryGeometry'];
        const space = context.rootState.application.currentSelections.space;

        // if the space already had an associated face, destroy it
        if (space.face_id) {
            context.dispatch('destroyFace', {
                'geometry': geometry,
                'space': space
            });
        }
        // payload.points.forEach((p, i) => {
        //     // when a point is snapped to an edge, this property will be set on the point
        //     if (p.splittingEdge) {
        //         this.$store.dispatch('geometry/splitEdge', {
        //             point: { x: p.x, y: p.y},
        //             edge: edge.edge
        //         });
        //     }
        // });


        context.commit('createFace', {
            ...payload,
            'geometry': geometry,
            'space': space
        });
    }
}
