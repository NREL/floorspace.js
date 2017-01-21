import factory from './../../factory/index.js'
const geometry = {
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

        destroyFace (context, payload) {
            const geometry = payload.geometry;
            const space = payload.space;
            const expFace = geometry.faces.find((face) => { return face.id === space.face_id; })

            // delete associated vertices
            // filter edges referenced by only the face being destroyed so that no shared edges are destroyed
            var expVertices = helpers.verticesforFace(expFace, geometry);
            // filter edges referenced by only the face being destroyed so that no shared edges are destroyed
            expVertices = expVertices.filter((vertex) => {
                return helpers.facesForVertex(vertex.id, geometry).length === 1;
            });

            expVertices.forEach((vertex) => {
                context.commit('destroyVertex', {
                    geometry: geometry,
                    vertex_id: vertex.id
                });
            });

            // delete associated edges
            var expEdgeRefs = expFace.edges;
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
                    if (sharedEdge) {
                        sharedEdge.reverse = sharedEdge.p1 !== v.id;
                        return sharedEdge;
                    }
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
                return f.id === payload.space.face_id;
            }), 1);
            payload.space.face_id = null;
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
        return geometry.edges.filter((edge) => {
            return (edge.p1 === vertex_id || edge.p2 === vertex_id);
        });
    },
    // the faces with references to a vertex
    facesForVertex (vertex_id, geometry) {
        return geometry.faces.filter((face) => {
            return face.edges.find((edgeRef) => {
                const edge = geometry.edges.find((edge) => { return edge.id === edgeRef.edge_id; });
                return (edge.p1 === vertex_id || edge.p2 === vertex_id);
            });
        });
    },
    // the faces with references to an edge
    facesForEdge (edge_id, geometry) {
        return geometry.faces.filter((face) => {
            return face.edges.find((edgeRef) => {
                return edgeRef.edge_id === edge_id;
            });
        });
    }
};
export { geometry, helpers }
