import factory from './../factory.js'
import geometryHelpers from './../helpers'
import modelHelpers from './../../models/helpers'
import createFaceFromPoints from './createFaceFromPoints'

export default {
    /*
    * initializes a new geometry object for a story
    */
    initGeometry (context, payload) {
      const { story_id } = payload;
      const geometry = new factory.Geometry();
      context.commit('initGeometry', { geometry: geometry });

      // set a reference to the new geometry set for the story it belongs to
      context.dispatch('models/updateStoryWithData', {
        story: context.rootState.models.stories.find(s => s.id === story_id),
        geometry_id: geometry.id
      }, { root: true });
    },

    /*
    * Erase the selection defined by a set of points on all faces on the current story
    * Dispatched by the eraser tool and by the createFaceFromPoints action (to prevent overlapping faces)
    */
    eraseSelection (context, payload) {
        const { points } = payload;

        // set of points defining the selection, formatted for clipper
        const clipSelection = points.map(p => ({ ...p, X: p.x, Y: p.y })),
            currentStoryGeometry = context.rootGetters['application/currentStoryGeometry'];

        // validation - a selection must have at least 3 vertices and area
        if (clipSelection.length < 3 || !geometryHelpers.areaOfSelection(clipSelection)) { return; }

        /*
        * find all existing faces that have an intersection with the selection being erased
        * destroy faces intersecting the eraser selection and recreate them
        * from the difference between their original area and the eraser selection
        */
        currentStoryGeometry.faces.filter(face => geometryHelpers.intersectionOfFaces(
            geometryHelpers.verticesForFaceId(face.id, currentStoryGeometry), clipSelection, currentStoryGeometry)
        ).forEach((existingFace) => {
            const existingFaceVertices = geometryHelpers.verticesForFaceId(existingFace.id, currentStoryGeometry),
                affectedModel = modelHelpers.modelForFace(context.rootState.models, existingFace.id);

            // destroy existing face
            context.dispatch(affectedModel.type === 'space' ? 'models/updateSpaceWithData' : 'models/updateShadingWithData', {
                [affectedModel.type]: affectedModel,
                face_id: null
            }, { root: true });

            context.dispatch('destroyFaceAndDescendents', {
                geometry_id: currentStoryGeometry.id,
                face: existingFace
            });

            // create new face by subtracting overlap (intersection) from the existing face's original area
            const differenceOfFaces = geometryHelpers.differenceOfFaces(existingFaceVertices, clipSelection, currentStoryGeometry);
            if (differenceOfFaces) {
                context.dispatch('createFaceFromPoints', {
                    [affectedModel.type]: affectedModel,
                    points: differenceOfFaces
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
            movedPoints = geometryHelpers.verticesForFaceId(face.id, currentStoryGeometry).map(v => ({
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
            geometry_id: currentStoryGeometry.id,
            face: face
        });

        // create new face from adjusted points
        context.dispatch('createFaceFromPoints', {
            [affectedModel.type]: affectedModel,
            points: movedPoints
        });
    },
    /*
    * create a face and associated edges and vertices from an array of points
    * associate the face with the space or shading included in the payload
    */
    createFaceFromPoints: createFaceFromPoints,

    // convert the splitting edge into two new edges
    splitEdge (context, payload) {
        const { edge, vertex } = payload;
        const geometry = context.rootGetters['application/currentStoryGeometry'];

        // splittingEdge.v1 -> midpoint
        const edge1 = new factory.Edge();
        edge1.v1 = edge.v1;
        edge1.v2 = vertex.id;
        context.commit('createEdge', {
            geometry_id: geometry.id,
            edge: edge1
        });

        // midpoint -> splittingEdge.v2
        const edge2 = new factory.Edge();
        edge2.v1 = vertex.id;
        edge2.v2 = edge.v2;
        context.commit('createEdge', {
            geometry_id: geometry.id,
            edge: edge2
        });

        // update faces referencing the edge being split
        geometryHelpers.facesForEdgeId(edge.id, geometry).forEach((face) => {
            context.commit('createEdgeRef', {
                geometry_id: geometry.id,
                face_id: face.id,
                edgeRef: {
                    edge_id: edge1.id,
                    reverse: false
                }
            });
            context.commit('createEdgeRef', {
                geometry_id: geometry.id,
                face_id: face.id,
                edgeRef: {
                    edge_id: edge2.id,
                    reverse: false
                }
            });

            // remove references to the edge being split
            context.commit('destroyEdgeRef', {
                geometry_id: geometry.id,
                edge_id: edge.id,
                face_id: face.id
            });
        });

        // destroy edge that was split
        context.commit('destroyGeometry', { id: edge.id });
    },

    destroyFaceAndDescendents (context, payload) {
      const { geometry_id, face } = payload;

      const geometry = context.state.find(g => g.id === geometry_id),
        // find edges and vertices referenced ONLY by the face being destroyed so that no shared geometry is lost
        expVertices = geometryHelpers.verticesForFaceId(face.id, geometry).filter(v => geometryHelpers.facesForVertexId(v.id, geometry).length < 2),
        expEdgeRefs = face.edgeRefs.filter(edgeRef => geometryHelpers.facesForEdgeId(edgeRef.edge_id, geometry).length < 2 );

      // destroy face, then edges, then vertices
      context.commit('destroyGeometry', { id: face.id });
      expEdgeRefs.forEach(edgeRef => context.commit('destroyGeometry', { id: edgeRef.edge_id }));
      expVertices.forEach(vertex => context.commit('destroyGeometry', { id: vertex.id }));
    }
}
