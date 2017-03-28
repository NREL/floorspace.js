import factory from './factory.js'
import geometryHelpers from './helpers'
import modelHelpers from './../models/helpers'

export default {
    /*
    * initializes a new geometry object for a story
    */
    initGeometry (context, payload) {
        context.commit('initGeometry', {
            geometry: new factory.Geometry(),
            story: context.rootState.models.stories.find(s => s.id === payload.story.id)
        });
    },

    /*
    * Erase the selection defined by a set of points on all faces on the current story
    * Dispatched by the eraser tool and by the createFaceFromPoints action (to prevent overlapping faces)
    */
    eraseSelection (context, payload) {
        // set of points defining the selection
        const points = payload.points.map(p => ({ ...p, X: p.x, Y: p.y })),
            currentStoryGeometry = context.rootGetters['application/currentStoryGeometry'];

        // validation - a selection must have at least 3 vertices and area
        if (payload.points.length < 3 || !geometryHelpers.areaOfFace(points)) { return; }

        /*
        * loop through all existing faces and checking for an intersection with the selection
        * if there is an intersection, subtract it from the existing face
        */
        currentStoryGeometry.faces.forEach((existingFace) => {
            const existingFaceVertices = geometryHelpers.verticesForFace(existingFace, currentStoryGeometry);
            // test for overlap between existing face and selection
            if (geometryHelpers.intersectionOfFaces(existingFaceVertices, points, currentStoryGeometry)) {
                const affectedModel = modelHelpers.modelForFace(context.rootState.models, existingFace.id);

                // destroy existing face
                context.dispatch(affectedModel.type === 'space' ? 'models/updateSpaceWithData' : 'models/updateShadingWithData', {
                    [affectedModel.type]: affectedModel,
                    face_id: null
                }, { root: true });

                context.dispatch('destroyFaceAndDescendents', {
                    geometry: currentStoryGeometry,
                    face: existingFace
                });

                // create new face by subtracting overlap (intersection) from the existing face's original area
                const differenceOfFaces = geometryHelpers.differenceOfFaces(existingFaceVertices, points, currentStoryGeometry);
                if (differenceOfFaces) {
                    context.dispatch('createFaceFromPoints', {
                        [affectedModel.type]: affectedModel,
                        'geometry': currentStoryGeometry,
                        'points': differenceOfFaces
                    });
                }
            }
        });
    },

    /*
    * create a face and associated edges and vertices from an array of points
    * associate the face with the space or shading included in the payload
    */
    createFaceFromPoints (context, payload) {
        // set of points to translate to vertices when creating the new face
        var points = payload.points.map(p => ({ ...p, X: p.x, Y: p.y }));
        const currentStoryGeometry = context.rootGetters['application/currentStoryGeometry'],
            target = modelHelpers.libraryObjectWithId(context.rootState.models, payload.space ? payload.space.id : payload.shading.id);

        // validation - a face must have at least 3 vertices and area
        if (points.length < 3 || !geometryHelpers.areaOfFace(points)) { return; }

        ////////////////////////////////////////////////// HANDLE EXISTING FACE ON TARGET //////////////////////////////////////////////////
        /*
        * if the space already has an existing face, destroy it
        * create a face from the union of the new face and existing face if they intersect or share an edge
        */
        if (target.face_id) {
            const existingFace = geometryHelpers.faceForId(target.face_id, currentStoryGeometry),
                existingFaceVertices = geometryHelpers.verticesForFace(existingFace, currentStoryGeometry);

            // track whether the same edge on the existing face is split more that once by the new set of points
            // if a single edge is split multiple times by new points, then the new face shares an edge with the existing face and their union should be used
            const splitEdges = [];
            for (var i = 0; i < points.length; i++) {
                var splitEdge = points[i].splittingEdge;
                if (splitEdge && ~splitEdges.indexOf(splitEdge)) {
                    // if an existing face edge has been split twice by the new set of points, use the union
                    points = geometryHelpers.unionOfFaces(existingFaceVertices, points, currentStoryGeometry);
                    break;
                } else if (splitEdge) {
                    // store existing face edges that have been split by new points
                    splitEdges.push(splitEdge);
                }
            }

            // destroy the face
            context.dispatch(target.type === 'space' ? 'models/updateSpaceWithData' : 'models/updateShadingWithData', {
                [target.type]: target,
                face_id: null
            }, { root: true });

            context.dispatch('destroyFaceAndDescendents', {
                geometry: currentStoryGeometry,
                face: existingFace
            });

            // check for intersection between new and original face
            if (geometryHelpers.intersectionOfFaces(existingFaceVertices, points, currentStoryGeometry)) {
                points = geometryHelpers.unionOfFaces(existingFaceVertices, points, currentStoryGeometry);
            }
        }

        // prevent overlapping faces by erasing existing geometry covered by the points defining the new face
        context.dispatch('eraseSelection', { points: points });

        ////////////////////////////////////////////////// CREATE AND SAVE GEOMETRY FOR THE FACE //////////////////////////////////////////////////
        // build an array of vertices for the face being created
        const faceVertices = points.map((p) => {
            // if a point was snapped to an existing vertex during drawing, it will have a vertex id
            var vertex = p.id && geometryHelpers.vertexForId(p.id, currentStoryGeometry);
            // reuse the existing vertex or create a new one
            if (!vertex) {
                vertex = new factory.Vertex(p.x, p.y);
                context.commit('createVertex', {
                    vertex: vertex,
                    geometry: currentStoryGeometry
                });
            }
            return vertex;
        });

        // build an array of edges for the face based on the set of vertices
        const faceEdges = faceVertices.map((v1, i) => {
            // v2 is the first vertex in the array when the face is being closed
            const v2 = i + 1 < faceVertices.length ? faceVertices[i + 1] : faceVertices[0];
            // check if an edge referencing the two vertices already exists
            var sharedEdge = currentStoryGeometry.edges.find((e) => {
                return (e.v1 === v1.id && e.v2 === v2.id) || (e.v2 === v1.id && e.v1 === v2.id);
            });

            if (sharedEdge) {
                // if a shared edge exists, check if its direction matches the edge direction required for the face being created
                sharedEdge = JSON.parse(JSON.stringify(sharedEdge));
                sharedEdge.reverse = (sharedEdge.v1 !== v1.id);
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

        // create a new face object with references to the edges
        const face = new factory.Face(faceEdges.map(e => ({
            edge_id: e.id,
            reverse: e.reverse
        })));

        var validFace = true;
        /*
        * Validate the new face against self intersection by checking for:
        * folded (duplicate geometry) edges referencing the same two endpoints on the same face
        * vertex on the face splitting an edge on the face
        * vertex on the face snapped to another vertex on the face
        * TODO: prevent duplicate vertex refs on the same face
        * TODO: prevent crossing edges on the same face
        */
        for (var i = 0; i < faceEdges.length; i++) {
            const edge = faceEdges[i];

            // if two edges on the same face reference the same two vertices, the face is invalid
            faceEdges.forEach((e) => {
                // don't compare an edge to itself
                if (e.id === edge.id) { return; }
                // found another edge with the same v1 and v2 on the face being created
                if ((e.v1 === edge.v1 && e.v2 === edge.v2) || (e.v2 === edge.v1 && e.v1 === edge.v2)) {
                    validFace = false;
                }
            });

            // vertices on the face being created
            const verticesForFace = geometryHelpers.verticesForFace(face, currentStoryGeometry),
                // saved vertices which are touching the edge (excluding the edge's endpoints)
                splittingVertices = geometryHelpers.verticesOnEdge(edge, currentStoryGeometry)

            // if a vertex on the face touches an edge on the face, then the face is self intersecting and invalid
            for (var j = 0; j < splittingVertices.length; j++) {
                const vertex = splittingVertices[j];
                if (verticesForFace.indexOf(vertex) !== -1) {
                    validFace = false;
                }
            }

            // if more than one vertex on the face has a single id, the face has snapped to itself and is self intersecting
            for (var j = 0; j < verticesForFace.length; j++) {
                const vertex = verticesForFace[j];
                if (verticesForFace.filter(v => v.id === vertex.id).length >= 2) {
                    validFace = false;
                }
            }
        }

        // save the face if it is valid, otherwise abort and destroy the edges and vertices created earlier to prevent an invalid state
        if (validFace) {
            context.commit('createFace', {
                face: face,
                geometry: currentStoryGeometry
            });

            context.dispatch(target.type === 'space' ? 'models/updateSpaceWithData' : 'models/updateShadingWithData', {
                [target.type]: target,
                face_id: face.id
            }, { root: true });
        } else {
            // dispatch destroyFaceAndDescendents to destroy edges and vertices created for the invalid face
            context.dispatch('destroyFaceAndDescendents', {
                geometry: currentStoryGeometry,
                face: face
            });
            return;
        }





        function splittingVertices () {
            var ct = 0;
            currentStoryGeometry.edges.forEach((edge) => {
                ct += geometryHelpers.verticesOnEdge(edge, currentStoryGeometry).length;
            });
            return ct;
        }
        var splitcount = splittingVertices();
        // TODO: fix infinite loop on self intersecting polygon shapes
        while (splitcount) {
            // loop through all edges and divide them at any non endpoint vertices they contain
            currentStoryGeometry.edges.forEach((edge) => {
                // vertices dividing the current edge
                geometryHelpers.verticesOnEdge(edge, currentStoryGeometry).forEach((splittingVertex) => {
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
            const normalizeEdges = geometryHelpers.normalizedEdges(affectedFace, currentStoryGeometry);
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
        const affectedFaces = geometryHelpers.facesForEdge(payload.edge.id, geometry);
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
        if (geometryHelpers.facesForEdge(payload.edge.id, geometry).length < 2) {
            context.dispatch('destroyEdge', {
                geometry: geometry,
                edge_id: payload.edge.id
            });
        }
    },

    destroyFaceAndDescendents (context, payload) {
        const geometry = payload.geometry,
            expFace = payload.face;

        // filter vertices referenced by only the face being destroyed so that no shared edges are destroyed
        const expVertices = geometryHelpers.verticesForFace(expFace, geometry).filter((vertex) => {
            return geometryHelpers.facesForVertex(vertex.id, geometry).length < 2;
        });

        // filter edges referenced by only the face being destroyed so that no shared edges are destroyed
        const expEdgeRefs = expFace.edgeRefs.filter((edgeRef) => {
            return geometryHelpers.facesForEdge(edgeRef.edge_id, geometry).length < 2;
        });

        context.dispatch('destroyFace', {
            geometry: geometry,
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

    destroyFace (context, payload) {
        const faceSpace = context.rootState.application.currentSelections.story.spaces.find((space) => {
            return space.face_id === payload.face_id;
        });
        if (faceSpace) {
            console.error('Attempting to delete face ' + payload.face_id + ' referenced by space: ', geometryHelpers.dc(faceSpace));
            throw new Error();
        }
        context.commit('destroyFace', {
            geometry: payload.geometry,
            face_id: payload.face_id
        });
    },

    destroyVertex (context, payload) {
        const edgesForVertex = geometryHelpers.edgesForVertex(payload.vertex_id, payload.geometry);
        if (edgesForVertex.length) {
            console.error('Attempting to delete vertex ' + payload.vertex_id + ' referenced by edges: ', geometryHelpers.dc(edgesForVertex));
            throw new Error();
        }
        context.commit('destroyVertex', {
            geometry: payload.geometry,
            vertex_id: payload.vertex_id
        });
    },

    destroyEdge (context, payload) {
        const facesForEdge = geometryHelpers.facesForEdge(payload.edge_id, payload.geometry);
        if (facesForEdge.length) {
            console.error('Attempting to delete edge ' + payload.edge_id + ' referenced by faces: ', geometryHelpers.dc(facesForEdge));
            throw new Error();
        }
        context.commit('destroyEdge', {
            geometry: payload.geometry,
            edge_id: payload.edge_id
        });
    }

}
