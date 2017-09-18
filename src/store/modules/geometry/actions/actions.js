import _ from 'lodash';
import factory from './../factory.js'
import geometryHelpers from './../helpers'
import modelHelpers from './../../models/helpers'
import { snapWindowToEdge, snapToVertexWithinFace, windowLocation } from '../../../../components/Grid/snapping';
import createFaceFromPoints, { matchOrCreateEdges, eraseSelection, newGeometriesOfOverlappedFaces, validateFaceGeometry } from './createFaceFromPoints'

export function getOrCreateVertex(geometry, coords) {
  return geometryHelpers.vertexForCoordinates(coords, geometry) || factory.Vertex(coords.x, coords.y);
}


function componentsOnFace(state, geometry_id, face_id) {
  const
    geom = geometryHelpers.denormalize(_.find(state.geometry, { id: geometry_id })),
    face = _.find(geom.faces, { id: face_id }),
    story = _.find(state.models.stories, { geometry_id }),
    space = _.find(story.spaces, { face_id });

  if (!face) {
    // brand new face, no components possible
    return { story_id: null, windows: [], daylighting_controls: [] };
  }

  const retval = {
    story_id: story.id,
    windows: story.windows.filter(
      w => _.includes(_.map(face.edges, 'edge_id'), w.edge_id),
    ).map(w => ({
      ...w,
      originalLoc: windowLocation(_.find(face.edges, { edge_id: w.edge_id }), w),
    })),
    daylighting_controls: space.daylighting_controls
    .map(d => ({ ...d, vertex: _.find(geom.vertices, { id: d.vertex_id }) })),
  };
  return retval;
}

function replaceComponents(
  context,
  { windows, daylighting_controls, story_id },
  { geometry_id, face_id, dx, dy },
) {
  const
    geometry = geometryHelpers.denormalize(_.find(context.rootState.geometry, { id: geometry_id })),
    face = _.find(geometry.faces, { id: face_id }),
    spacing = context.rootState.project.grid.spacing;

  context.dispatch('models/destroyAllComponents', { face_id, story_id }, { root: true });

  windows.forEach((w) => {
    const
      newLoc = { x: w.originalLoc.x + dx, y: w.originalLoc.y + dy },
      loc = snapWindowToEdge(face.edges, newLoc, 1, spacing);
    if (!loc) { return; }

    context.dispatch('models/createWindow', {
      story_id,
      edge_id: loc.edge_id,
      alpha: loc.alpha,
      window_defn_id: w.window_defn_id,
    }, { root: true });
  });

  daylighting_controls.forEach((d) => {
    const
      newLoc = { x: d.vertex.x + dx, y: d.vertex.y + dy },
      loc = snapToVertexWithinFace([face], newLoc, spacing);
    if (!loc) { return; }

    context.dispatch('models/createDaylightingControl', {
      daylighting_control_defn_id: d.daylighting_control_defn_id,
      x: loc.x,
      y: loc.y,
      story_id,
      face_id,
    }, { root: true });
  });
}

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
        window.eventBus.$emit('error', 'Operation cancelled - no split faces');
      }
      context.dispatch('trimGeometry', { geometry_id: context.rootGetters['application/currentStoryGeometry'].id });
  	},

  /*
  * Given a dx, dy, and face
  * clone the face with all points adjusted by the delta and destroy the original
  * this will trigger all set operations
  */
  moveFaceByOffset(context, payload) {
    const
      { face_id, dx, dy } = payload,
      currentStoryGeometry = context.rootGetters['application/currentStoryGeometry'],
      face = geometryHelpers.faceForId(face_id, currentStoryGeometry),
      movedPoints = geometryHelpers.verticesForFaceId(face.id, currentStoryGeometry).map(v => ({
        x: v.x + dx,
        y: v.y + dy,
      })),
      newGeoms = newGeometriesOfOverlappedFaces(
        movedPoints,
        // Don't consider face we're modifying as a reason to disqualify the action.
        geometryHelpers.exceptFace(currentStoryGeometry, face_id),
      );

    if (newGeoms.error) {
      window.eventBus.$emit('error', `Operation cancelled - ${newGeoms.error}`);

      window.eventBus.$emit('reload-grid');
      return;
    }

    const movedGeom = validateFaceGeometry(movedPoints, currentStoryGeometry);
    if (!movedGeom.success) {
      window.eventBus.$emit('error', movedGeom.error);
      window.eventBus.$emit('reload-grid');
      return;
    }

    newGeoms.forEach(newGeom => context.dispatch('replaceFacePoints', newGeom));

    context.dispatch('replaceFacePoints', {
      geometry_id: currentStoryGeometry.id,
      face_id,
      vertices: movedGeom.vertices,
      edges: movedGeom.edges,
      dx,
      dy,
    });
    context.dispatch('trimGeometry', { geometry_id: currentStoryGeometry.id });
  },
  /*
  * create a face and associated edges and vertices from an array of points
  * associate the face with the space or shading included in the payload
  */
  createFaceFromPoints,

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
    },

  replaceFacePoints(context, { geometry_id, face_id, vertices, edges, dx, dy }) {
    // get all components
    const components = componentsOnFace(context.rootState, geometry_id, face_id);
    context.commit('replaceFacePoints', {
      geometry_id,
      vertices,
      edges,
      face_id,
    });
    // replay the components
    replaceComponents(context, components, {
      geometry_id, face_id, dx: (dx || 0), dy: (dy || 0),
    });
  },

  trimGeometry({ rootState, commit }, { geometry_id }) {
    const
      story = _.find(rootState.models.stories, { geometry_id }),
      vertsReferencedByDCs = _.flatMap(story.spaces, s => _.map(s.daylighting_controls, 'vertex_id'));

    commit('trimGeometry', { geometry_id, vertsReferencedElsewhere: vertsReferencedByDCs });
  },
}
