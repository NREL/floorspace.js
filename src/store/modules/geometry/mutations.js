import factory from './factory.js'
import helpers from './helpers.js'

export default {
    normalizeEdges (state, payload) {
        payload.face.edgeRefs = helpers.normalizedEdges(payload.face, payload.geometry);
    },

    // initialize a new geometry object
    // must update the associated story to reference the geometry
    // all validation and duplicate checking must be done in the action
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
        // build array of new and shared vertices for the face
        const faceVertices = payload.points.map((p, i) => {
            // snapped points already have a vertex id, set a reference to the existing vertex if it is not deleted
            if (p.id && helpers.vertexForId(p.id, payload.geometry)) {
                return helpers.vertexForId(p.id, payload.geometry);
            } else {
                // create and store a new vertex with the point's coordinates
                const vertex = new factory.Vertex(p.x, p.y);
                payload.geometry.vertices.push(vertex);
                return vertex;
            }
        });


        // track the indexes of shared edges which will be reversed on the new face (we don't want to directly mutate the edge object with a marker value)
        const reverseEdgeIndices = [];

        // build array of new and shared edges for the face from the vertices
        const faceEdges = faceVertices.map((v1, i) => {
            // v2 is either the next vertex in the faceVertices array, or the first vertex in the array when the face is being closed
            const v2 = i < faceVertices.length - 1 ? faceVertices[i + 1] : faceVertices[0];

            // check if an edge referencing the two vertices for the edge being created already exists
            var sharedEdge = payload.geometry.edges.find((e) => {
                return (e.v1 === v1.id && e.v2 === v2.id) || (e.v2 === v1.id && e.v1 === v2.id);
            });

            if (sharedEdge) {
                // if a shared edge exists, check if its direction matches the edge direction required for the face being created
                if (sharedEdge.v1 !== v1.id) {
                    // track the indexes of shared edges which will be reversed on the new face
                    reverseEdgeIndices.push(i);
                }
                return sharedEdge;
            }

            // TODO: if the new edge contains any vertices for existing edges, snap the new edge and set a reference to the existing edge



            // create and store a new edge with the vertices
            const edge = new factory.Edge(v1.id, v2.id);
            payload.geometry.edges.push(edge);
            return edge;
        });

        const edgeRefs = faceEdges.map((e, i) => {
            return {
                edge_id: e.id,
                reverse: ~reverseEdgeIndices.indexOf(i) ? true : false
            };
        });

        // create and store a new face with references to the edges
        const face = new factory.Face(faceEdges.map((e, i) => {
            return {
                edge_id: e.id,
                reverse: ~reverseEdgeIndices.indexOf(i) ? true : false
            };
        }));
        payload.geometry.faces.push(face);
        payload.space.face_id = face.id;
    },

    destroyVertex (state, payload) {
        payload.geometry.vertices.splice(payload.geometry.vertices.findIndex((v) => {
            return v.id === payload.vertex_id;
        }), 1);
    },
    destroyEdge (state, payload) {
        helpers.facesForEdge(payload.edge_id, payload.geometry).forEach((face) => {
            // remove references to the edge being destroyed
            face.edgeRefs.splice(face.edgeRefs.findIndex((edgeRef) => {
                return edgeRef.edge_id === payload.edge_id;
            }), 1);
        });

        payload.geometry.edges.splice(payload.geometry.edges.findIndex((e) => {
            return e.id === payload.edge_id;
        }), 1);
    },
    destroyFace (state, payload) {
        payload.geometry.faces.splice(payload.geometry.faces.findIndex((f) => {
            return f.id === payload.space.face_id;
        }), 1);
        payload.space.face_id = null;
    }
}
