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
        // build arrays of the vertices and edges associated with the face being created
        const faceVertices = payload.points.map((p, i) => {
            // snapped points already have a vertex id, set a reference to the existing vertex if it is not deleted
            if (p.id && helpers.vertexForId(p.id, payload.geometry)) {
                return {
                    ...helpers.vertexForId(p.id, payload.geometry),
                    shared: true // mark the vertex as being shared, this will be used during shared edge lookup
                };
            } else {
                // create a new vertex with the point coordinates
                var vertex = new factory.Vertex(p.x, p.y);
                payload.geometry.vertices.push(vertex);
                return vertex;
            }
        });
        const reverseEdgeIndices = [];
        const faceEdges = faceVertices.map((v, i) => {
            const v2 = faceVertices.length > i + 1 ? faceVertices[i + 1] : faceVertices[0];
            // if the vertex is shared between two faces, check to see if the entire edge is shared
            if (v.shared) {
                // find the shared edge if it exists
                var sharedEdge = payload.geometry.edges.find((e) => {
                    return (e.v1 === v.id && e.v2 === v2.id) || (e.v2 === v.id && e.v1 === v2.id);
                });

                if (sharedEdge) {
                    // track the indexes of edges which are reversed for use during face edgeRef creation
                    if (sharedEdge.v1 !== v.id) {
                        reverseEdgeIndices.push(i);
                    }
                    return sharedEdge;
                }
            }

            const edge = new factory.Edge(v.id, v2.id);

            // if the new edge contains any vertices for existing edges, snap the new edge and set a reference to the existing edge
            // TODO: all this logic needs to be moved into an action
            console.log("!!! ", edge, helpers.snappingEdgeForEdge(edge, payload.geometry));



            payload.geometry.edges.push(edge);
            return edge;
        });

        const edgeRefs = faceEdges.map((e, i) => {
            return {
                edge_id: e.id,
                reverse: reverseEdgeIndices.indexOf(i) === -1 ? false : true // false // TODO: implement a check for existing edges using the same vertices
            };
        });

        const face = new factory.Face(edgeRefs);
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
