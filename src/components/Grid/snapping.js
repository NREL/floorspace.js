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

export function expandWindowAlongEdge(edge, center, windowWidth) {
  const
    theta = edgeDirection({ start: edge.v1, end: edge.v2 }),
    windowDeltaX = (windowWidth * Math.cos(theta)) / 2,
    windowDeltaY = (windowWidth * Math.sin(theta)) / 2;
  return {
    edge_id: edge.id,
    center,
    alpha: edge.v2.x === edge.v1.x ?
      (center.y - edge.v1.y) / (edge.v2.y - edge.v1.y) :
      (center.x - edge.v1.x) / (edge.v2.x - edge.v1.x),
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


export function snapWindowToEdge(edges, cursor, windowWidth, maxSnapDist) {
  const
    withDistance = edges.map(e => ({
      ...e,
      ...pointDistanceToSegment(cursor, { start: e.v1, end: e.v2 }),
    })),
    closestEdge = _.minBy(withDistance, 'dist');
  if (!closestEdge || closestEdge.dist > maxSnapDist) {
    return null;
  }
  return expandWindowAlongEdge(closestEdge, closestEdge.proj, windowWidth);
}

export function snapToVertexWithinFace(faces, cursor, gridSpacing) {
  return _.chain(snapTargets([], gridSpacing, cursor))
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
  return {
    x: edge.v1.x + (windw.alpha * (edge.v2.x - edge.v1.x)),
    y: edge.v1.y + (windw.alpha * (edge.v2.y - edge.v1.y)),
  };
}
