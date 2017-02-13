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
        // set of points to translate to vertices when creating the new face
        var points = payload.points;

        const currentStoryGeometry = context.rootGetters['application/currentStoryGeometry'],
            // translate points to clipper's path format
            clipperPaths = points.map((p) => { return { X: p.x, Y: p.y }; });

        // validation - a face must have at least 3 vertices and area
        if (payload.points.length < 3 || ! helpers.areaOfFace(clipperPaths)) { return; }
        // TODO: check that the face being created doesn't intersect itself

        /*
        * if the space already has an existing face, destroy it
        * create a face from the union of the new face and existing face if they intersect or share an edge
        */
        if (payload.space.face_id) {
            const existingFace = helpers.faceForId(payload.space.face_id, currentStoryGeometry),
                existingFaceVertices = helpers.verticesForFace(existingFace, currentStoryGeometry);

            context.dispatch('destroyFace', {
                geometry: currentStoryGeometry,
                space: payload.space
            });

            if (helpers.intersectionOfFaces(existingFaceVertices, clipperPaths, currentStoryGeometry)) {
                points = helpers.unionOfFaces(existingFaceVertices, clipperPaths, currentStoryGeometry);
            }

            // TODO: use the union if the new face has an edge snapped to the existing face
        }

        /*
        * prevent overlapping faces by looping through all existing faces and checking for an intersection with the new face
        * if there is an intersection, destroy the existing face
        * recreate it from the difference between its original shape minus the intersection
        */
        currentStoryGeometry.faces.forEach((existingFace) => {
            const existingFaceVertices = helpers.verticesForFace(existingFace, currentStoryGeometry),
                overlap = helpers.intersectionOfFaces(existingFaceVertices, clipperPaths, currentStoryGeometry);
            if (overlap) {
                const affectedSpace = context.rootState.application.currentSelections.story.spaces.find((space) => {
                    return space.face_id === existingFace.id;
                });
                context.dispatch('destroyFace', {
                    geometry: currentStoryGeometry,
                    space: affectedSpace
                });

                const differenceOfFaces = helpers.differenceOfFaces(existingFaceVertices, clipperPaths, currentStoryGeometry);
                if (differenceOfFaces) {
                    context.dispatch('createFaceFromPoints', {
                        'space': affectedSpace,
                        'geometry': currentStoryGeometry,
                        'points': differenceOfFaces
                    });
                }
            }
        });

        /*
        * build an array of vertices for the face from the coodrinates of each point
        * if a point was snapped to an existing vertex during drawing, it will have a vertex id
        * reuse the existing vertex if it was not destroyed during the set operations
        */
        const faceVertices = points.map((p, i) => {
            if (p.id && helpers.vertexForId(p.id, currentStoryGeometry)) {
                return helpers.vertexForId(p.id, currentStoryGeometry);
            } else {
                const vertex = new factory.Vertex(p.x, p.y);
                context.commit('createVertex', {
                    vertex: vertex,
                    geometry: currentStoryGeometry
                });
                return vertex;
            }
        });

        // track the indexes of shared edges which will be reversed on the new face (we don't want to directly mutate the edge object with a marker value)
        const reverseEdgeIndices = [];

        // build an array of edges for the face based on the set of vertices
        const faceEdges = faceVertices.map((v1, i) => {
            // v2 is either the next vertex in the faceVertices array, or the first vertex in the array when the face is being closed
            const v2 = i + 1 < faceVertices.length ? faceVertices[i + 1] : faceVertices[0],
                // check if an edge referencing the two vertices already exists
                sharedEdge = currentStoryGeometry.edges.find((e) => {
                    return (e.v1 === v1.id && e.v2 === v2.id) || (e.v2 === v1.id && e.v1 === v2.id);
                });

            if (sharedEdge) {
                // if a shared edge exists, check if its direction matches the edge direction required for the face being created
                if (sharedEdge.v1 !== v1.id) {
                    // track the indexes of shared edges which will be reversed on the new face
                    reverseEdgeIndices.push(i);
                }
                return sharedEdge;
            } else {
                // create and store a new edge with the vertices
                const edge = new factory.Edge(v1.id, v2.id);
                context.commit('createEdge', {
                    edge: edge,
                    geometry: currentStoryGeometry
                });
                return edge;
            }
        });

        // create and store a new face with references to the edges
        const face = new factory.Face(faceEdges.map((e, i) => {
            return {
                edge_id: e.id,
                reverse: reverseEdgeIndices.indexOf(i) !== -1
            };
        }));

        const normalizedEdges = helpers.normalizedEdges(face, currentStoryGeometry);
        face.edgeRefs = normalizedEdges;

        context.commit('createFace', {
            face: face,
            geometry: currentStoryGeometry
        });

        context.commit('models/updateSpaceWithData', {
            space: payload.space,
            face_id: face.id
        }, { root: true });

        function splittingVertices () {
            var ct = 0;
            currentStoryGeometry.edges.forEach((edge) => {
                ct += helpers.verticesOnEdge(edge, currentStoryGeometry).length;
            });
            return ct;
        }
        var splitcount = splittingVertices();
        // TODO: fix infinite loop on self intersecting polygon shapes
        while (splitcount) {
            // loop through all edges and divide them at any non endpoint vertices they contain
            currentStoryGeometry.edges.forEach((edge) => {
                // vertices dividing the current edge
                helpers.verticesOnEdge(edge, currentStoryGeometry).forEach((splittingVertex) => {
                    context.dispatch('splitEdge', {
                        vertex: splittingVertex,
                        edge: edge
                    });
                });
            });
            splitcount = splittingVertices();
        }

        // if the faces which were originally snapped to still exist, normalize their edges
        currentStoryGeometry.faces.forEach((affectedFace) => {
            const normalizeEdges = helpers.normalizedEdges(affectedFace, currentStoryGeometry);
            context.commit('setEdgeRefsForFace', {
                face: affectedFace,
                edgeRefs: normalizeEdges
            });
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

            // remove references to the edge being split
            context.commit('destroyEdgeRef', {
                edge_id: payload.edge.id,
                face: face
            });
        });

        // remove references to the edge being split
        if (helpers.facesForEdge(payload.edge.id, geometry).length < 2) {
            context.dispatch('destroyEdge', {
                geometry: geometry,
                edge_id: payload.edge.id
            });
        }
    },

    destroyFace (context, payload) {
        const geometry = payload.geometry,
            space = payload.space,
            expFace = helpers.faceForId(space.face_id, geometry);

        // filter vertices referenced by only the face being destroyed so that no shared edges are destroyed
        const expVertices = helpers.verticesForFace(expFace, geometry).filter((vertex) => {
            return helpers.facesForVertex(vertex.id, geometry).length === 1 && helpers.edgesForVertex(vertex.id, geometry).length === 2;
        });

        // filter edges referenced by only the face being destroyed so that no shared edges are destroyed
        const expEdgeRefs = expFace.edgeRefs.filter((edgeRef) => {
            return helpers.facesForEdge(edgeRef.edge_id, geometry).length === 1;
        });

        context.commit('destroyFace', {
            geometry: geometry,
            space: space,
            face_id: expFace.id
        });

        // delete associated edges
        expEdgeRefs.forEach((edgeRef) => {
            context.dispatch('destroyEdge', {
                geometry: geometry,
                edge_id: edgeRef.edge_id
            });
        });

        // delete associated vertices
        expVertices.forEach((vertex) => {
            context.dispatch('destroyVertex', {
                geometry: geometry,
                vertex_id: vertex.id
            });
        });
    },

    destroyVertex (context, payload) {
        const edgesForVertex = helpers.edgesForVertex(payload.vertex_id, payload.geometry);
        if (edgesForVertex.length) {
            console.error('Attempting to delete vertex ' + payload.vertex_id + ' referenced by edges: ', helpers.dc(edgesForVertex));
            throw new Error();
        }
        context.commit('destroyVertex', {
            geometry: payload.geometry,
            vertex_id: payload.vertex_id
        });
    },
    destroyEdge (context, payload) {
        const facesForEdge = helpers.facesForEdge(payload.edge_id, payload.geometry);
        if (facesForEdge.length) {
            console.error('Attempting to delete edge ' + payload.edge_id + ' referenced by faces: ', helpers.dc(facesForEdge));
            throw new Error();
        }
        context.commit('destroyEdge', {
            geometry: payload.geometry,
            edge_id: payload.edge_id
        });
    }

}
