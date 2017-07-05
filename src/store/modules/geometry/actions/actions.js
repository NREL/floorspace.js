import factory from './../factory.js'
import geometryHelpers from './../helpers'
import modelHelpers from './../../models/helpers'
import createFaceFromPoints, { eraseSelection } from './createFaceFromPoints'

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
    * Dispatched by the eraser tool
    */
    eraseSelection (context, payload) {
  		const { points } = payload;
  		const eraseResult = eraseSelection(points, context);
      if (!eraseResult) {
        window.eventBus.$emit('error', "no split faces");
      }
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
            model_id: affectedModel.id,
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

	/*
	* given a face which may or may not be saved to the datastore
	* look up and destroy all edges and vertices referenced only by that face
	* destroy the face
	*/
    destroyFaceAndDescendents (context, payload) {
      const { geometry_id, face } = payload;

      const geometry = context.state.find(g => g.id === geometry_id),
	  	isSaved = !!geometry.faces.find(f => f.id === face.id),
        // find edges and vertices referenced ONLY by the face being destroyed so that no shared geometry is lost
        expVertices = face.edgeRefs.map((edgeRef) => {
				const edge = geometryHelpers.edgeForId(edgeRef.edge_id, geometry),
					// look up the vertex associated with v1 unless the edge reference on the face is reversed
					vertexId = edgeRef.reverse ? edge.v2 : edge.v1;
				return geometryHelpers.vertexForId(vertexId, geometry);
			})
			.filter(v => geometryHelpers.facesForVertexId(v.id, geometry).length <2),
        expEdgeRefs = face.edgeRefs.filter(edgeRef => geometryHelpers.facesForEdgeId(edgeRef.edge_id, geometry).length <2);

      // destroy face, then edges, then vertices
      context.commit('destroyGeometry', { id: face.id });
      expEdgeRefs.forEach(edgeRef => context.commit('destroyGeometry', { id: edgeRef.edge_id }));
      expVertices.forEach(vertex => context.commit('destroyGeometry', { id: vertex.id }));
    }
}
