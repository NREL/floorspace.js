import _ from 'lodash';
import factory from './../factory';
import geometryHelpers, { distanceBetweenPoints } from './../helpers';
import modelHelpers from './../../models/helpers';
import { uniq, dropConsecutiveDups, allPairs } from './../../../../utilities';
import { withPreservedComponents } from './componentPreservationSociety';
/*
 * create a face and associated edges and vertices from an array of points
 * associate the face with the space or shading included in the payload
 */
export default function createFaceFromPoints(context, payload) {
  const {
    model_id,
    points,
  } = payload;

  if (uniq(points).length < 3) { return; }
  // lookup target model and type for face assignment
  const currentStoryGeometry = context.rootGetters['application/currentStoryGeometry'];
  const target = modelHelpers.libraryObjectWithId(context.rootState.models, model_id);

  // if the target already has an existing face, use the union of the new and existing faces
  const existingFace = target.face_id ? geometryHelpers.faceForId(target.face_id, currentStoryGeometry) : null;
  let facePoints;

  if (existingFace) {
    const existingFaceVertices = geometryHelpers.verticesForFaceId(existingFace.id, currentStoryGeometry);
    facePoints = geometryHelpers.setOperation('union', existingFaceVertices, points);
    if (facePoints.error) {
      window.eventBus.$emit('error', `Operation cancelled - ${facePoints.error}`);
      return;
    }
  } else {
    facePoints = points;
  }


  const faceGeometry = validateFaceGeometry(facePoints, context.rootGetters['application/currentStoryGeometry'], context.rootGetters['project/snapTolerance']);
  if (!faceGeometry.success) {
    window.eventBus.$emit('error', faceGeometry.error);
    console.error(faceGeometry.error);
    return;
  }

  const newGeoms = newGeometriesOfOverlappedFaces(
    facePoints,
    // Don't consider face we're modifying as a reason to disqualify the action.
    geometryHelpers.exceptFace(currentStoryGeometry, existingFace && existingFace.id),
  );

  // prevent overlapping faces by erasing existing geometry covered by the points defining the new face
  if (newGeoms.error) {
    window.eventBus.$emit('error', `Operation cancelled - ${newGeoms.error}`);
    return;
  }

  withPreservedComponents(context, currentStoryGeometry.id, () => {

    newGeoms.forEach(newGeom => context.dispatch('replaceFacePoints', newGeom));

    // save the face and its descendent geometry
    storeFace(faceGeometry, target, context, existingFace);

    // split edges where vertices touch them
    splitEdges(context);
  });

  context.dispatch('trimGeometry', { geometry_id: currentStoryGeometry.id });
}

// ////////////////////// HELPERS //////////////////////////// //

export function newGeometriesOfOverlappedFaces(points, geometry) {
  if (points.length < 3 || !geometryHelpers.areaOfSelection(points)) {
    return false;
  }

  const geom = geometryHelpers.denormalize(geometry);
  const intersectedFaces = geom.faces
    .filter((face) => {
      // handle unusual cases where face has no vertices
      if (face.vertices.length === 0) {
        return false
      }
      const inter = geometryHelpers.intersection(face.vertices, points);
      // We care about faces have an intersection with the new one, or that
      // cause errors (eg, split face) upon intersection
      // eg of causing an error upon intersection: https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/599dca36956980d6eef2b009/3849c0e2a87c866fbf630cff073163ff/capture.png
      return inter.error || inter.length > 0;
    });

  const newFaceVertices = intersectedFaces.map(existingFace =>
    geometryHelpers.difference(existingFace.vertices, points),
  );

  const errantCase = _.find(newFaceVertices, 'error');
  if (errantCase) {
    // difference caused split face or hole
    return errantCase;
  }

  const newFaceGeometries = newFaceVertices.map(
    verts => validateFaceGeometry(verts, geometry));

  const errantGeometry = _.find(newFaceGeometries, 'error');
  if (errantGeometry) {
    // validation failed on one of the geometries
    return errantGeometry;
  }

  return _.zip(intersectedFaces, newFaceGeometries).map(([face, { vertices, edges }]) => ({
    geometry_id: geometry.id,
    face_id: face.id,
    vertices,
    edges,
  }));
}

/*
 * Erase the selection defined by a set of points on all faces on the current story
 * used by the eraser tool and by the createFaceFromPoints action (to prevent overlapping faces)
 * returns false if the erase operation splits an existing face
 */
export function eraseSelection(points, context) {
  const currentStoryGeometry = context.rootGetters['application/currentStoryGeometry'];

  // validation - a selection must have at least 3 vertices and area
  if (points.length < 3 || !geometryHelpers.areaOfSelection(points)) {
    return false;
  }

  /*
   * find all existing faces that have an intersection with the selection being erased
   * destroy faces intersecting the eraser selection and recreate them
   * from the difference between their original area and the eraser selection
  */
  const newGeoms = newGeometriesOfOverlappedFaces(points, currentStoryGeometry);
  // prevent overlapping faces by erasing existing geometry covered by the points defining the new face
  if (newGeoms.error) {
    window.eventBus.$emit('error', `Operation cancelled - ${newGeoms.error}`);
    return false;
  }

  newGeoms.forEach(newGeom => context.dispatch('replaceFacePoints', newGeom));

  splitEdges(context);

  return true;
}

/*
* saves the validated face geometry (edges and vertices) to the datastore
* skips shared edges and vertices since they are already stored
* creates and saves a face with edgeRefs, updates the target space or shading in the datastore
*/
function storeFace({ vertices, edges }, target, context, existingFace) {
  const currentStoryGeometry = context.rootGetters['application/currentStoryGeometry'];
  const face = existingFace || new factory.Face([]);
  context.dispatch('replaceFacePoints', {
    face_id: face.id,
    geometry_id: currentStoryGeometry.id,
    vertices,
    edges,
  });
  context.dispatch(target.type === 'space' ? 'models/updateSpaceWithData' : 'models/updateShadingWithData', {
    [target.type]: target,
    face_id: face.id,
  }, {
    root: true,
  });
}

export function findExistingEdge(v1, v2, edges) {
  const sharedEdge = edges.find(e => (
    (e.v1 === v1.id && e.v2 === v2.id) ||
    (e.v2 === v1.id && e.v1 === v2.id)));
  // if a shared edge exists, check if its direction matches the edge direction required for the face being created
  return sharedEdge && {
    ...sharedEdge,
    // this property will be used (then deleted) when we create and save the face with edgeRefs
    reverse: sharedEdge.v1 === v2.id,
  };
}

function matchOrCreateEdge(existingEdges) {
  return ([v1, v2]) => (findExistingEdge(v1, v2, existingEdges) || new factory.Edge(v1.id, v2.id));
}

export function matchOrCreateEdges(vertices, existingEdges) {
   // pair each vertex with the next (wrapping back to start at the end)
  if (!vertices.length) {
    return [];
  }
  return _.zip(vertices, [...vertices.slice(1), vertices[0]])
  // try and find a shared edge, but fall back to creating a new one
    .map(matchOrCreateEdge(existingEdges));
}

function InvalidFaceGeometry(message) {
  this.message = message;
}
InvalidFaceGeometry.prototype = new Error();

export function errOnTooFewVerts(vertices) {
  if (vertices.length < 3) {
    throw new InvalidFaceGeometry(`can't make a polygon with fewer than three vertices: ${JSON.stringify(vertices)}`);
  }
}

export function errOnDuplicateVerts(vertices) {
  vertices.forEach((vertex) => {
    if (
      _.find(vertices, { x: vertex.x, y: vertex.y }).length >= 2
    ) {
      throw new InvalidFaceGeometry(`Duplicate vertex at (${vertex.x}, ${vertex.y})`);
    }
  });
}

export function errOnVertexIntersectsEdge(vertices, edges) {
  edges.forEach(({ v1: v1id, v2: v2id }) => {
    const
      v1 = _.find(vertices, { id: v1id }),
      v2 = _.find(vertices, { id: v2id });

    vertices.forEach((v) => {
      if (v.id === v1id || v.id === v2id) {
        return; // this is an endpoint of an edge under consideration.
      }

      if (!geometryHelpers.ptsAreCollinear(v1, v2, v)) {
        return;
      }

      // if the points *are* collinear, is v between v1 and v2?
      const positionAlongEdge = _.reject(
        [
          (v.x - v1.x) / (v2.x - v1.x),
          (v.y - v1.y) / (v2.y - v1.y),
        ],
        isNaN)[0];
      // positionAlongEdge = 0 implies v == v1
      // positionAlongEdge = 1 implies v == v2
      // positionAlongEdge > 1 or < 0 implies not on the line segment
      if (positionAlongEdge > 1 || positionAlongEdge < 0) {
        return;
      }
      throw new InvalidFaceGeometry(
        `An edge is being touched by a vertex on the same face at (${v.x}, ${v.y})`);
    });
  });
}

export function errOnEdgeIntersectsEdge(vertices, edges) {
  allPairs(edges).forEach(([e1, e2]) => {
    const
      e1v1 = _.find(vertices, { id: e1.v1 }),
      e1v2 = _.find(vertices, { id: e1.v2 }),
      e2v1 = _.find(vertices, { id: e2.v1 }),
      e2v2 = _.find(vertices, { id: e2.v2 });

    const intersection = geometryHelpers.intersectionOfLines(e1v1, e1v2, e2v1, e2v2);
    if (intersection) {
      throw new InvalidFaceGeometry(
        `Self intersection at ${intersection.x}, ${intersection.y}`);
    }
  });
}

/*
 * Given a set of points, creates vertices and edges for the face defined by the points
 * validates the face geometry for self intersection
 * returns object with success boolean and face geometry or error message depending on validation results
 */
export function validateFaceGeometry(points, currentStoryGeometry) {
  /* validation consists of:
   - try and match each vertex to an existing one that is already in the geometry
   - create edges, and try to re-use existing ones (reversed, if necessary)
   - after snapping, check if any vertices were merged to the same point
     Duplicate vertices can cause two problems:
      1. zero-area portions of the face:

       1
        *---------------* 2
        |               |
        |               |3
        |               *-----* 4
        |               |5
        |               |
        *---------------* 6
       7
      2. not even actually a polygon:

        *                         *
        |\                         \
        | \                        \\
        |  \                       \\
        |   \          ====>       \\
        |    \                      \\
        |     \                     \\
        |      \                     \\
        *---@---*                    **

      @ is an existing point (on another face). Both * at the base of the triangle
      were snapped to the location of @, causing a degenerate polygon (just a line).

     Consecutive vertices are okay (we should combine them to a single example) as long
     as the total number of distinct vertices is at least 3.

   - Check if any vertices on the face lie on an edge in the face. Err out if they do.
     (this would cause either a zero-area portion of the face,
      eg: https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/598b740a2e569128b4392cb5/f71690195e4801010773652bac9d0a9c/capture.png
      or a split face.
      eg: https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/598b743607a58f375889faad/99ec60d5ddcf78c97db43e8628efa7b9/capture.png
     )
   - Check if two edges on the new face intersect. (again, to prevent split faces)
  */

  if (points.length === 0) {
    return {
      success: true,
      vertices: [],
      edges: [],
    };
  }
  if (points.length <= 2) {
    return { success: false, error: 'need at least 3 points to make a face' };
  }

  // build an array of vertices for the face being created
  let faceVertices = points.map(point => (
      // if a vertex already exists at a given location, reuse it
    geometryHelpers.vertexForCoordinates(point, currentStoryGeometry) || new factory.Vertex(point.x, point.y)
  ));


  // first, we can just join together consecutive duplicates, since that doesn't change
  // the geometry at all.
  faceVertices = dropConsecutiveDups(faceVertices);

  // create edges connecting each vertex in order
  const faceEdges = matchOrCreateEdges(faceVertices, currentStoryGeometry.edges);

  try {
    errOnTooFewVerts(faceVertices);
    errOnDuplicateVerts(faceVertices);
    errOnVertexIntersectsEdge(faceVertices, faceEdges);
    errOnEdgeIntersectsEdge(faceVertices, faceEdges);
  } catch (e) {
    if (e instanceof InvalidFaceGeometry) {
      return {
        success: false,
        error: e.message,
      };
    }
    // not an error we know about -- shouldn't have caught it
    // (...grumble, grumble javascript's underpowered exceptions...)
    throw e;
  }

  return {
    success: true,
    vertices: faceVertices,
    edges: faceEdges,
  };
}

function edgesFromVerts(verts, existingEdges) {

  return _.zip(verts.slice(0, -1), verts.slice(1))
    .map(matchOrCreateEdge(existingEdges));
}

function replacementEdgeRefs(geometry, dyingEdgeId, newEdges) {
  // look up all faces with a reference to the original edge being split
  const affectedFaces = geometryHelpers.facesForEdgeId(dyingEdgeId, geometry);
  // remove reference to old edge and add references to the new edges
  const replaceEdgeRefs = affectedFaces.map((affectedFace) => {
    const dyingEdgeReversed = _.find(affectedFace.edgeRefs, { edge_id: dyingEdgeId }).reverse;

    const replacementEdges = newEdges.map(({ id, reverse }) => ({
      id,
      // new edge reference should be reversed if exactly one of
      // - the suggested replacement edge ref
      // - the dying edge ref
      // is reversed.
      // if *both* are reversed, they cancel out.
      // if neither is reversed, the edge keeps original direction.
      reverse: ((!reverse) !== (!dyingEdgeReversed)),
    }));

    if (dyingEdgeReversed) {
      // not enough to reverse each individual component -- the whole thing
      // must also be reversed!
      replacementEdges.reverse();
    }

    return {
    type: 'replaceEdgeRef',
    geometry_id: geometry.id,
    edge_id: dyingEdgeId,
    face_id: affectedFace.id,
      newEdges: replacementEdges,
    };
  });
  
  return replaceEdgeRefs;
}

export function edgesToSplit(geometry, spacing) {
  const priorIterationEdges = [];
  return _.compact(geometry.edges.map((edge) => {
    let splittingVertices = geometryHelpers.splittingVerticesForEdgeId(edge.id, geometry, spacing);
    if (!splittingVertices.length) {
      return false;
    }
    const
      startpoint = geometryHelpers.vertexForId(edge.v1, geometry),
      endpoint = geometryHelpers.vertexForId(edge.v2, geometry);

    // sort splittingVertices by location on original edge
    splittingVertices = _.sortBy(splittingVertices, v => distanceBetweenPoints(v, startpoint));

    // add startpoint and endpoint of original edge to splittingVertices array from which new edges will be created
    splittingVertices = [startpoint, ...splittingVertices, endpoint];
    // create new edges by connecting the original edge startpoint, ordered splitting vertices, and original edge endpoint
    // eg: startpoint -> SV1, SV1 -> SV2, SV2 -> SV3, SV3 -> endpoint
    const
      newEdges = edgesFromVerts(splittingVertices, [...geometry.edges, ...priorIterationEdges]),
      replaceEdgeRefs = replacementEdgeRefs(geometry, edge.id, newEdges);
    // The edges we're recommending don't yet exist, but we'd like to re-use them for future iterations.
    // Otherwise we end up creating two edges when one will do.
    priorIterationEdges.push(...newEdges);
    return {
      edgeToDelete: edge.id,
      newEdges,
      replaceEdgeRefs,
    };
  }));
}

/*
 * loop through all edges on the currentStoryGeometry, checking if there are any vertices touching (splitting) them
 * order the splitting vertices based on where they appear on the original edge
 * build and store a new set of edges by connecting the ordered splitting vertices
 * look up all faces referencing the original edge and replace those references with references to the new edges
 * destroy the original edge
 */
function splitEdges(context) {
  const
    currentStoryGeometry = context.rootGetters['application/currentStoryGeometry'],
    currentProjectSpacing = context.rootState.project.grid.spacing,
    edgeChanges = edgesToSplit(currentStoryGeometry, currentProjectSpacing);
  edgeChanges.forEach(payload => context.commit({
    type: 'splitEdge',
    geometry_id: currentStoryGeometry.id,
    ...payload,
  }));
}
