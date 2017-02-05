import factory from './factory.js'
import helpers from './helpers'

export default {
    // initialize a new geometry object for a story
    initGeometry (context, payload) {
        // create the geometry object
        payload.geometry = new factory.Geometry();
        context.commit('initGeometry', payload);
    },

    createFaceFromPoints (context, payload) {
        // geometry and space for the current story
        const geometry = context.rootGetters['application/currentStoryGeometry'];
        const space = context.rootState.application.currentSelections.space;

        // set of points to translate to vertices when creating the new face
        var points = payload.points;

        // if the space already had an associated face, run through set operations
        if (space.face_id) {
            // existing face
            const existingFace = helpers.faceForId(space.face_id, geometry),
                // translate points to clipper's path format
                clipperPaths = payload.points.map((p) => { return { X: p.x, Y: p.y }; })

            // use the union of the new and existing faces if the new face intersects the existing face
            if (helpers.intersectionOfFaces(existingFace, clipperPaths, geometry)) {
                points = helpers.unionOfFaces(existingFace, clipperPaths, geometry);
            }

            // TODO: use the union if the new face has an edge snapped to the existing face

            // destroy the existing face
            context.dispatch('destroyFace', {
                'geometry': geometry,
                'space': space
            });
        }

        // build array of new and shared vertices for the face
        const faceVertices = points.map((p, i) => {
            // snapped points already have a vertex id, set a reference to the existing vertex if it is not deleted
            if (p.id && helpers.vertexForId(p.id, geometry)) {
                return helpers.vertexForId(p.id, geometry);
            } else {
                // create and store a new vertex with the point's coordinates
                const vertex = new factory.Vertex(p.x, p.y);
                context.commit('createVertex', {
                    vertex: vertex,
                    geometry: geometry
                });
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
            var sharedEdge = geometry.edges.find((e) => {
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
            context.commit('createEdge', {
                edge: edge,
                geometry: geometry
            });
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
        context.commit('createFace', {
            space: space,
            face: face,
            geometry: geometry
        });
        // TODO: maybe a model mutation for this?
        // payload.space.face_id = face.id;

        // edge splitting logic for an explicit split (edge turned blue when point was drawn)
        // split any edges that the new face shares with existing faces
        points.forEach((p, i) => {
            // when a point is snapped to an edge, this property will be set on the point
            // make sure the edge being split still exists and wasn't destroyed in the earlier 'destroyFace' dispatch
            if (p.splittingEdge && ~geometry.edges.indexOf(p.splittingEdge)) {
                context.dispatch('splitEdge', {
                    // the vertex that was created where the edge will be split - look up by location
                    vertex: geometry.vertices.find((v) => { return v.x === p.x && v.y === p.y; }),
                    edge: p.splittingEdge
                });
            }
        });
    },

    // convert the splitting edge into two new edges
    splitEdge (context, payload) {
        const geometry = context.rootGetters['application/currentStoryGeometry'];

        // splittingEdge.v1 -> midpoint
        // prevent duplicate edges
        var edge1 = geometry.edges.find((e) => {
            return (e.v1 === payload.edge.v1 && e.v2 === payload.vertex.id) || (e.v2 === payload.edge.v1 && e.v1 === payload.vertex.id);
        });
        if (!edge1) {
            edge1 = new factory.Edge();
            edge1.v1 = payload.edge.v1;
            edge1.v2 = payload.vertex.id;
            context.commit('createEdge', {
                geometry: geometry,
                edge: edge1
            });
        }

        // midpoint -> splittingEdge.v2
        // prevent duplicate edges
        var edge2 = geometry.edges.find((e) => {
            return (e.v2 === payload.edge.v2 && e.v1 === payload.vertex.id) || (e.v1 === payload.edge.v2 && e.v2 === payload.vertex.id);
        });
        if (!edge2) {
            edge2 = new factory.Edge();
            edge2.v1 = payload.vertex.id;
            edge2.v2 = payload.edge.v2;
            context.commit('createEdge', {
                geometry: geometry,
                edge: edge2
            });
        }

        // TODO: it will be impossible for multiple faces to be referecing the same edge (with the same two vertices)
        // once we prevent overlapping faces, so this code wont be needed

        // look up faces referencing the edge being split
        const affectedFaces = helpers.facesForEdge(payload.edge.id, geometry);
        affectedFaces.forEach((face) => {
            context.commit('createEdgeRef', {
                face: face,
                edgeRef: {
                    edge_id: edge1.id,
                    reverse: false
                }
            });
            context.commit('createEdgeRef', {
                face: face,
                edgeRef: {
                    edge_id: edge2.id,
                    reverse: false
                }
            });
        });

        // remove references to the edge being split
        context.commit('destroyEdge', {
            geometry: geometry,
            edge_id: payload.edge.id
        });

        // if the faces which were originally snapped to still exist, normalize their edges
        affectedFaces.forEach((affectedFace) => {
            context.commit('normalizeEdges', {
                face: affectedFace,
                geometry: geometry
            });
        });
    },

    destroyFace (context, payload) {
        const geometry = payload.geometry;
        const space = payload.space;
        const expFace = helpers.faceForId(space.face_id, geometry);

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
    }
}
