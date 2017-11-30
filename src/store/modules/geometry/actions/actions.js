import _ from 'lodash';
import factory from './../factory';
import geometryHelpers from './../helpers';
import createFaceFromPoints, { eraseSelection, newGeometriesOfOverlappedFaces, validateFaceGeometry } from './createFaceFromPoints';
import { withPreservedComponents } from './componentPreservationSociety';

export function getOrCreateVertex(geometry, coords) {
  return geometryHelpers.vertexForCoordinates(coords, geometry) || factory.Vertex(coords.x, coords.y);
}

export default {
  /*
  * initializes a new geometry object for a story
  */
  initGeometry(context, payload) {
    const { story_id } = payload;
    const geometry = new factory.Geometry();
    context.commit('initGeometry', { geometry });

    // set a reference to the new geometry set for the story it belongs to
    context.dispatch('models/updateStoryWithData', {
      story: context.rootState.models.stories.find(s => s.id === story_id),
      geometry_id: geometry.id,
    }, { root: true });
  },

  /*
  * Erase the selection defined by a set of points on all faces on the current story
  * Dispatched by the eraser tool
  */
  eraseSelection(context, payload) {
    const
      { points } = payload,
      geometry_id = context.rootGetters['application/currentStoryGeometry'].id;

    withPreservedComponents(context, geometry_id, () => {
      const eraseResult = eraseSelection(points, context);

      if (!eraseResult) {
        window.eventBus.$emit('error', 'Operation cancelled - no split faces');
      }
    });

    context.dispatch('trimGeometry', { geometry_id });
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

    const movementsByFaceId = { [face_id]: { dx, dy } };

    withPreservedComponents(context, currentStoryGeometry.id, movementsByFaceId, () => {
      newGeoms.forEach(newGeom => context.dispatch('replaceFacePoints', newGeom));

      context.dispatch('replaceFacePoints', {
        geometry_id: currentStoryGeometry.id,
        face_id,
        vertices: movedGeom.vertices,
        edges: movedGeom.edges,
        dx,
        dy,
      });
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
  destroyFaceAndDescendents(context, payload) {
    const { geometry_id, face } = payload;

    const
      geometry = context.state.find(g => g.id === geometry_id),
      // find edges and vertices referenced ONLY by the face being destroyed so that no shared geometry is lost
      expVertices = face.edgeRefs
        .map((edgeRef) => {
          const
            edge = geometryHelpers.edgeForId(edgeRef.edge_id, geometry),
            // look up the vertex associated with v1 unless the edge reference on the face is reversed
            vertexId = edgeRef.reverse ? edge.v2 : edge.v1;
          return geometryHelpers.vertexForId(vertexId, geometry);
        })
        .filter(v => geometryHelpers.facesForVertexId(v.id, geometry).length < 2),
      expEdgeRefs = face.edgeRefs.filter(edgeRef => geometryHelpers.facesForEdgeId(edgeRef.edge_id, geometry).length < 2);

    // destroy face, then edges, then vertices
    context.commit('destroyGeometry', { id: face.id });
    expEdgeRefs.forEach(edgeRef => context.commit('destroyGeometry', { id: edgeRef.edge_id }));
    expVertices.forEach(vertex => context.commit('destroyGeometry', { id: vertex.id }));
  },

  replaceFacePoints(context, { geometry_id, face_id, vertices, edges }) {
    const geom = _.find(context.state, { id: geometry_id });
    // because we make several calls to replaceFacePoints in a row,
    // (eg: when a new polygon overlaps existing ones, we need to replace the
    //  existing polygon's face points with new ones)
    // it's possible for duplicate vertices to sneak in.
    let replacementVertIds = _.chain(vertices)
      .map((vert) => {
        const gVert = _.find(geom.vertices, _.pick(vert, ['x', 'y']));
        if (!gVert) return null; // this vertex doesn't match any existing ones
        if (vert.id === gVert.id) return null; // this vertex already exists
        return [vert.id, gVert.id]; // this vertex *would* be a dup, so use the existing one
      })
      .compact()
      .fromPairs()
      .value();
    replacementVertIds = {};

    vertices.forEach((v) => {
      v.id = replacementVertIds[v.id] || v.id;
    });
    edges.forEach((e) => {
      e.v1 = replacementVertIds[e.v1] || e.v1;
      e.v2 = replacementVertIds[e.v2] || e.v2;
    });

    context.commit('replaceFacePoints', {
      geometry_id,
      vertices,
      edges,
      face_id,
    });
  },

  trimGeometry({ rootState, commit }, { geometry_id }) {
    const
      story = _.find(rootState.models.stories, { geometry_id }),
      vertsReferencedByDCs = _.flatMap(story.spaces, s => _.map(s.daylighting_controls, 'vertex_id'));

    commit('trimGeometry', { geometry_id, vertsReferencedElsewhere: vertsReferencedByDCs });
  },
};
