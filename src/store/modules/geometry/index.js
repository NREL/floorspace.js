import factory from './../../factory/index.js'
export default {
    namespaced: true,
    // each story owns a geometry object with a unique set of vertices, edges, and faces
    state: [/*{
        id: null,
        vertices: [{
            id: null,
            x: null,
            y: null
        }],
        edges: [{
            id: null,
            p1: null,
            p2: null
        }],
        faces: [{
            id: null,
            edges: [{
                edge_id: null,
                reverse: false
            }]
        }]
    }*/],
    actions: {
        // initialize a new geometry object for a story
        initGeometry (context, payload) {
            // create the geometry object
            payload.geometry = new factory.Geometry();
            context.commit('initGeometry', payload);
        },
        // TODO: PREVENT DELETING SHARED VERTICES
        // this action destroys a face and all related geometric entities which are not referenced by other faces
        destroyFace (context, payload) {
            const geometry = payload.geometry;
            const space = payload.space;

            // the face to delete
            const expiredFace = geometry.faces.find((f) => {
                return f.id === space.face_id;
            });

            // destroy edges belonging to the face unless they are referenced by another face
            var isShared;
            expiredFace.edges.forEach((edgeRef) => {
                isShared = false;
                geometry.faces.forEach((f) => {
                    // only test other faces for reference to the edge
                    if (expiredFace === f) { return; }
                    isShared = f.edges.find((e) => {
                        return e.edge_id === edgeRef.edge_id;
                    }) || isShared;
                });

                // edge is not shared with another face, destroy it and its vertices unless they are shared with edges on other faces
                if (!isShared) {
                    var p1Shared = false,
                        p2Shared = false;

                    const expiredEdge = geometry.edges.find((e) => {
                        return e.id === edgeRef.edge_id;
                    });

                    // loop through each edge reference on each face
                    geometry.faces.forEach((f) => {
                        // only test other faces for reference to the vertex
                        // if (expiredFace === f) { return; }

                        // lookup the edge object for each edge reference
                        f.edges.forEach((eR) => {
                            const e = geometry.edges.find((e) => {
                                return e.id === edgeRef.edge_id;
                            });

                            p1Shared = (e.p1 === expiredEdge.p1 || e.p2 === expiredEdge.p1) ? true : p1Shared;
                            p1Shared = (e.p1 === expiredEdge.p2 || e.p2 === expiredEdge.p2) ? true : p1Shared;
                        });
                    });
                    if (!p1Shared) {
                        context.commit('destroyVertex', {
                            geometry: geometry,
                            'vertex_id': expiredEdge.p1
                        });
                    }
                    if (!p2Shared) {
                        context.commit('destroyVertex', {
                            geometry: geometry,
                            'vertex_id': expiredEdge.p2
                        });
                    }

                    // destroy the edge
                    context.commit('destroyEdge', {
                        geometry: geometry,
                        'edge_id': edgeRef.edge_id
                    });
                }
            });
            // destroy the face
            context.commit('destroyFace', {
                geometry: geometry,
                'face_id': space.face_id
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
                    'space': space,
                    'face_id': space.face_id
                });
            }

            context.commit('createFace', {
                ...payload,
                'geometry': geometry,
                'space': space
            });
        }
    },
    mutations: {
        // initialize a new geometry object
        // must update the associated story to reference the geometry
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
        createFace (state, payload) {
            // build arrays of the vertices and edges associated with the face being created
            const faceVertices = payload.points.map((p, i) => {
                // snapped points already have a vertex id, set a reference to the existing vertex if it is not deleted
                if (p.id && payload.geometry.vertices.find((v) => { return v.id === p.id; })) {
                    return {
                        ...payload.geometry.vertices.find((v) => { return v.id === p.id; }),
                        shared: true // mark the vertex as being shared, this will be used during shared edge lookup
                    };
                } else {
                    // create a new vertex with the point coordinates
                    var vertex = new factory.Vertex(p.x, p.y);
                    payload.geometry.vertices.push(vertex);
                    return vertex;
                }
            });
            const faceEdges = faceVertices.map((v, i) => {
                const v2 = faceVertices.length > i + 1 ? faceVertices[i + 1] : faceVertices[0];

                // if the vertex is shared between two faces, check to see if the entire edge is shared
                if (v.shared) {
                    // find the shared edge if it exists
                    var sharedEdge = payload.geometry.edges.find((e) => {
                        return (e.p1 === v.id && e.p2 === v2.id) || (e.p2 === v.id && e.p1 === v2.id);
                    });
                    if (sharedEdge) { return sharedEdge; }
                }

                const edge = new factory.Edge(v.id, v2.id);
                payload.geometry.edges.push(edge);
                return edge;
            });

            const edgeRefs = faceEdges.map((e, i) => {
                return {
                    edge_id: e.id,
                    reverse: false // TODO: implement a check for existing edges using the same vertices
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
            payload.geometry.edges.splice(payload.geometry.edges.findIndex((e) => {
                return e.id === payload.edge_id;
            }), 1);
        },
        destroyFace (state, payload) {
            payload.geometry.faces.splice(payload.geometry.faces.findIndex((f) => {
                return f.id === payload.face_id;
            }), 1);
        }
    },
    getters: {}
}

const helpers = {
    // the vertices referenced by the edges of a face
    verticesforFace (face, geometry) {
        const vertices = [];
        face.edges.forEach((edgeRef, i) => {
            const edge = geometry.edges.find((edge) => { return edge.id === edgeRef.edge_id; });
            // each vertex will be referenced by two connected edges, so we only store p1
            const vertex = geometry.vertices.find((vertex) => { return vertex.id === edge.p1; });
            vertices.push(vertex);
        });
        return vertices;
    },
    // the edges with references to a vertex
    edgesForVertex (vertex_id, geometry) {
        return geometry.edges.filter((edge, i) => {
            return (edge.p1 === vertex_id || edge.p2 === vertex_id);
        });
    },
    // the faces with references to a vertex
    facesForVertex (vertex_id, geometry) {

    }
}
