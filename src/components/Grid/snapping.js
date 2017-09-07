import _ from 'lodash';
import { distanceBetweenPoints, pointDistanceToSegment, edgeDirection } from '../../store/modules/geometry/helpers';

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
  const
    theta = edgeDirection({ start: closestEdge.v1, end: closestEdge.v2 }),
    windowDeltaX = (windowWidth * Math.cos(theta)) / 2,
    windowDeltaY = (windowWidth * Math.sin(theta)) / 2;
  return {
    edge_id: closestEdge.id,
    center: closestEdge.proj,
    alpha: closestEdge.v2.x === closestEdge.v1.x ?
      (closestEdge.proj.y - closestEdge.v1.y) / (closestEdge.v2.y - closestEdge.v1.y) :
      (closestEdge.proj.x - closestEdge.v1.x) / (closestEdge.v2.x - closestEdge.v1.x),
    start: {
      x: closestEdge.proj.x - windowDeltaX,
      y: closestEdge.proj.y - windowDeltaY,
    },
    end: {
      x: closestEdge.proj.x + windowDeltaX,
      y: closestEdge.proj.y + windowDeltaY,
    },
  };
}
