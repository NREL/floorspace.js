import _ from 'lodash';
import { distanceBetweenPoints, pointDistanceToSegment, edgeDirection, vertInRing } from '../../store/modules/geometry/helpers';

export function gridSnapTargets(gridSpacing, { x, y }) {
  return [
    { x: Math.floor(x / gridSpacing) * gridSpacing, y: Math.floor(y / gridSpacing) * gridSpacing },
    { x: (Math.floor(x / gridSpacing) + 1) * gridSpacing, y: Math.floor(y / gridSpacing) * gridSpacing },
    { x: Math.floor(x / gridSpacing) * gridSpacing, y: (Math.floor(y / gridSpacing) + 1) * gridSpacing },
    { x: (Math.floor(x / gridSpacing) + 1) * gridSpacing, y: (Math.floor(y / gridSpacing) + 1) * gridSpacing },
  ].map(t => ({ ...t, type: 'grid' }));
}

function vertexSnapTargets(vertices, gridSpacing, location) {
  return vertices
    .filter(v => distanceBetweenPoints(location, v) <= gridSpacing)
    .map(v => ({ ...v, type: 'vertex' }));
}

export function snapTargets(vertices, gridSpacing, cursor) {
  const targets = [
    ...gridSnapTargets(gridSpacing, cursor),
    ...vertexSnapTargets(vertices, gridSpacing, cursor),
  ].map(
    target => ({
      ...target,
      dist: distanceBetweenPoints(target, cursor),
      dx: cursor.x - target.x,
      dy: cursor.y - target.y,
    }));

  return _.orderBy(targets, ['dist', 'origin', 'type'], ['asc', 'asc', 'desc']);
}

export function expandWindowAlongEdge(edge, center, { width, window_definition_type }) {
  if (window_definition_type === 'Window to Wall Ratio' ||
      window_definition_type === 'Repeating Windows'
  ) {
    return {
      edge_id: edge.id,
      center,
      edge_start: edge.v1,
      alpha: 0.5,
      start: edge.v1,
      end: edge.v2,
    };
  }
  const
    theta = edgeDirection({ start: edge.v1, end: edge.v2 }),
    windowDeltaX = (width * Math.cos(theta)) / 2,
    windowDeltaY = (width * Math.sin(theta)) / 2,
    alpha = edge.v2.x === edge.v1.x ?
      (center.y - edge.v1.y) / (edge.v2.y - edge.v1.y) :
      (center.x - edge.v1.x) / (edge.v2.x - edge.v1.x);
  return {
    edge_id: edge.id,
    center,
    edge_start: edge.v1,
    alpha,
    start: {
      x: center.x - windowDeltaX,
      y: center.y - windowDeltaY,
    },
    end: {
      x: center.x + windowDeltaX,
      y: center.y + windowDeltaY,
    },
  };
}

export function findClosestEdge(edges, cursor) {
  const
    withDistance = edges.map(e => ({
      ...e,
      ...pointDistanceToSegment(cursor, { start: e.v1, end: e.v2 }),
    })),
    closestEdge = _.minBy(withDistance, 'dist');
  return closestEdge;
}

export function findClosestWindow(windows, cursor) {
  const withDistance = windows.map(w => ({
    ...w,
    dist: distanceBetweenPoints(cursor, w.center),
    proj: w.center,
    // alias start, end to v1, v2 so we can make this thing look like an edge.
    // Then we can use the same code to display the distance markers from
    // daylighting control to either closest window or closest edge.
    v1: w.start,
    v2: w.end,
  }));
  return _.minBy(withDistance, 'dist');
}

function snapWindowToEdgeAnywhere(edges, cursor, windowWidth, maxSnapDist) {
  const closestEdge = findClosestEdge(edges, cursor);
  if (!closestEdge || closestEdge.dist > maxSnapDist) {
    return null;
  }
  return expandWindowAlongEdge(closestEdge, closestEdge.proj, { width: windowWidth });
}

function snapWindowToEdgeAtGridIntervals(edges, cursor, windowWidth, maxSnapDist, gridSpacing) {
  const closestEdge = findClosestEdge(edges, cursor);
  if (!closestEdge || closestEdge.dist > maxSnapDist) {
    return null;
  }

  const
    dist = distanceBetweenPoints(closestEdge.v1, closestEdge.proj),
    roundedDist = Math.round(dist / gridSpacing) * gridSpacing,
    dx = (closestEdge.v2.x - closestEdge.v1.x),
    dy = (closestEdge.v2.y - closestEdge.v1.y),
    norm = Math.sqrt((dx * dx) + (dy * dy)),
    snapLoc = {
      x: closestEdge.v1.x + (roundedDist * (dx / norm)),
      y: closestEdge.v1.y + (roundedDist * (dy / norm)),
    };

  return expandWindowAlongEdge(closestEdge, snapLoc, { width: windowWidth });
}

export function snapWindowToEdge(snapMode, ...args) {
  if (snapMode === 'grid-strict') {
    return snapWindowToEdgeAtGridIntervals(...args);
  }
  return snapWindowToEdgeAnywhere(...args);
}

export function snapToVertexWithinFace(snapMode, faces, cursor, gridSpacing) {
  const existingVerts = snapMode === 'grid-strict' ? [] : [cursor];
  // We'll pretend `cursor` is an existing vert when we're not in strict snapping mode.
  // That way, we will suggest the exact location of the cursor.
  return _.chain(snapTargets(existingVerts, gridSpacing, cursor))
    .map(g => ({
      ...g,
      face_id: _.find(faces, f => vertInRing(g, f.vertices)),
    }))
    .filter('face_id')
    .map(g => ({ ...g, face_id: g.face_id.id }))
    .first()
    .value();
}

export function windowLocation(edge, windw) {
  const alpha = windw.alpha || 0.5; // if not given, assume center
  // (this is useful for repeating window groups and window-wall-ratios
  return {
    x: edge.v1.x + (alpha * (edge.v2.x - edge.v1.x)),
    y: edge.v1.y + (alpha * (edge.v2.y - edge.v1.y)),
  };
}
