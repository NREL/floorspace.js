import factory from './../factory.js'
import geometryHelpers from './../helpers'
import modelHelpers from './../../models/helpers'
import createFaceFromPoints from './createFaceFromPoints'

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
        currentStoryGeometry.faces.filter((existingFace) => {
            const existingFaceVertices = geometryHelpers.verticesForFace(existingFace, currentStoryGeometry);
            // test for overlap between existing face and selection
            return geometryHelpers.intersectionOfFaces(existingFaceVertices, points, currentStoryGeometry);
        }).forEach((existingFace) => {
            const existingFaceVertices = geometryHelpers.verticesForFace(existingFace, currentStoryGeometry),
                affectedModel = modelHelpers.modelForFace(context.rootState.models, existingFace.id);

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
        });
    },

    /*
    * Given a dx, dy, and face
    * clone the face with all points adjusted by the delta and destroy the original
    * this will trigger all set operations
    */
    moveFaceByOffset (context, payload) {
        const { face_id, dx, dy } = payload,
            currentStoryGeometry = context.rootGetters['application/currentStoryGeometry'],
            face = geometryHelpers.faceForId(face_id, currentStoryGeometry),
            movedPoints = geometryHelpers.verticesForFace(face, currentStoryGeometry).map(v => ({
                x: v.x + dx,
                y: v.y + dy
            })),
            affectedModel = modelHelpers.modelForFace(context.rootState.models, face.id);

        // destroy existing face
        context.dispatch(affectedModel.type === 'space' ? 'models/updateSpaceWithData' : 'models/updateShadingWithData', {
            [affectedModel.type]: affectedModel,
            face_id: null
        }, { root: true });

        context.dispatch('destroyFaceAndDescendents', {
            geometry: currentStoryGeometry,
            face: face
        });

        // create new face from adjusted points
        context.dispatch('createFaceFromPoints', {
            [affectedModel.type]: affectedModel,
            'geometry': currentStoryGeometry,
            'points': movedPoints
        });
    },
    /*
    * create a face and associated edges and vertices from an array of points
    * associate the face with the space or shading included in the payload
    */
    createFaceFromPoints: createFaceFromPoints,

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
                face_id: face.id
            });
        });

        // remove references to the edge being split
        if (geometryHelpers.facesForEdge(payload.edge.id, geometry).length < 2) {
            context.commit('destroyGeometry', { id: payload.edge.id });
        }
    },

    destroyFaceAndDescendents (context, payload) {
        const geometry = context.state.find(g => g.id === payload.geometry.id),

            expFace = payload.face;

        // filter vertices referenced by only the face being destroyed so that no shared edges are destroyed
        const expVertices = geometryHelpers.verticesForFace(expFace, geometry).filter((vertex) => {
            return geometryHelpers.facesForVertex(vertex.id, geometry).length < 2;
        });

        // filter edges referenced by only the face being destroyed so that no shared edges are destroyed
        const expEdgeRefs = expFace.edgeRefs.filter((edgeRef) => {
            return geometryHelpers.facesForEdge(edgeRef.edge_id, geometry).length < 2;
        });

        context.commit('destroyGeometry', { id: expFace.id });

        // delete associated edges
        expEdgeRefs.forEach(edgeRef => context.commit('destroyGeometry', { id: edgeRef.edge_id }));

        // delete associated vertices
        expVertices.forEach(vertex => context.commit('destroyGeometry', { id: vertex.id }));
    }
}
