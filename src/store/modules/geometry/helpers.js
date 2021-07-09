import _ from 'lodash';
import * as turf from '@turf/helpers';
import area from 'area-polygon'
import { union, difference, intersection } from 'polygon-clipping';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { dropConsecutiveDups } from '../../../utilities';

function toTurfPoly(vertices) {
  const coords = vertices.map(v => [v.x, v.y]);
  if (
    coords[0][0] !== coords[coords.length - 1][0] ||
    coords[0][1] !== coords[coords.length - 1][1]
  ) {
      coords.push(coords[0]);
  }
  return turf.polygon([coords]);
}

function ringEqualsWithSameWindingOrder(vs, ws) {
  const pivotVert = vs[0];
  const pivotIx = _.findIndex(ws, _.pick(pivotVert, ['x', 'y']));

  if (pivotIx === -1) return false;
  const wsp = _.map([...ws.slice(pivotIx), ...ws.slice(0, pivotIx)], w => _.pick(w, ['x', 'y']));
  return _.isEqualWith(vs, wsp, (v, w) => _.isMatch(v, w));
}

function dropClosingVertex(vs) {
  // a ring is "self-closing" if it's final vertex is the same as it's initial one.
  // This is the way most of our geometry is stored, but for this algorithm it's easier to
  // work with non-self-closing rings.
  if (vs.length <= 3) return vs; // a polygon must have at least 3 pts, not including a closing vert.
  if (_.isEqual(vs[0], vs[vs.length - 1])) return vs.slice(0, -1);
  return vs;
}

export function ringEquals(vs_, ws_) {
  if (vs_.length !== ws_.length) return false;
  if (vs_.length === 0) return true;

  const vs = dropClosingVertex(vs_);
  const ws = dropClosingVertex(ws_);
  return (
    ringEqualsWithSameWindingOrder(vs, ws) ||
    ringEqualsWithSameWindingOrder(vs, [...ws].reverse())
  );
}


export function distanceBetweenPoints(p1, p2) {
  const
    dx = Math.abs(p1.x - p2.x),
    dy = Math.abs(p1.y - p2.y);
  return Math.sqrt((dx * dx) + (dy * dy));
}

export function fitToAspectRatio(xExtent, yExtent, widthOverHeight, adjustToFit = 'expand') {
  const
    xSpan = xExtent[1] - xExtent[0],
    ySpan = yExtent[1] - yExtent[0],
    xAccordingToY = ySpan * widthOverHeight,
    yAccordingToX = xSpan / widthOverHeight,
    xDiff = xAccordingToY - xSpan,
    yDiff = yAccordingToX - ySpan;

  // xDiff and yDiff are either both zero (already have correct aspect ratio),
  // or they have opposite signs.

  if ((xDiff > 0) === (adjustToFit === 'expand')) {
    // xDiff > 0 and adjustToFit === 'expand ==> this expands region
    // xDiff <= 0 and adjustToFit !== 'expand' ==> this contracts region
    return {
      xExtent: [xExtent[0] - xDiff / 2, xExtent[1] + xDiff / 2],
      yExtent,
    };
  }
  return {
    xExtent,
    yExtent: [yExtent[0] - yDiff / 2, yExtent[1] + yDiff / 2],
  };
}

export function edgeDirection({ start, end }) {
  // return the angle from east, in radians.
  const
    deltaX = end.x - start.x,
    deltaY = end.y - start.y;
  return deltaX === 0 ? 0.5 * Math.PI : Math.atan(deltaY / deltaX);
}

export function haveSimilarAngles(edge1, edge2) {
  const
    angleDiff = edgeDirection(edge1) - edgeDirection(edge2),
    correctedDiff = Math.min(
      Math.abs(angleDiff),
      Math.PI - angleDiff, // To catch angles that are very similar, but opposite directions
    );
  return correctedDiff < 0.05 * Math.PI;
}
function normalize({ dx, dy }) {
  if (dx === 0 && dy === 0) {
    return { dx: 0, dy: 0 };
  }
  const normalization = Math.sqrt((dx * dx) + (dy * dy));
  return {
    dx: dx / normalization,
    dy: dy / normalization,
  };
}
export function unitPerpVector(p1, p2) {
  let dx, dy;
  if (p1.x !== p2.x) {
    dy = 1;
    dx = ((p1.y - p2.y)) / (p1.x - p2.x);
  } else if (p1.y !== p2.y) {
    dx = 1;
    dy = ((p1.x - p2.x)) / (p1.y - p2.y);
  } else {
    dx = dy = 1;
  }
  return normalize({ dx, dy });
}

export function unitVector(p1, p2) {
  const
    dx = p2.x - p1.x,
    dy = p2.y - p1.y;
  return normalize({ dx, dy });
}


/*
 * given a point and a line (object with two points p1 and p2)
 * return the coordinates of the projection of the point onto the line
 */
export function projectionOfPointToLine(point, line) {
  const { p1: { x: x1, y: y1 }, p2: { x: x2, y: y2 } } = line;
  const
    A = point.x - x1,
    B = point.y - y1,
    C = x2 - x1,
    D = y2 - y1,
    dot = (A * C) + (B * D),
    lenSq = (C * C) + (D * D) || 2,
    param = dot / lenSq;

  // projection is an endpoint
  if (param <= 0) {
    return line.p1;
  } else if (param > 1) {
    return line.p2;
  }

  return {
    x: x1 + (param * C),
    y: y1 + (param * D),
  };
}

export function pointDistanceToSegment(pt, { start, end }) {
  const proj = projectionOfPointToLine(pt, { p1: start, p2: end });
  return {
    dist: distanceBetweenPoints(pt, proj),
    proj,
  };
}

export function ptsAreCollinear(p1, p2, p3) {
  const
    [a, b] = [p1.x, p1.y],
    [m, n] = [p2.x, p2.y],
    { x, y } = p3;
  return Math.abs(((n - b) * (x - m)) - ((y - n) * (m - a))) < 0.00001;
}

export function repeatingWindowCenters({ start, end, spacing, width }) {
  const
    maxDist = distanceBetweenPoints(start, end),
    centers = [],
    direction = unitVector(start, end);

  let nextCenterDist = width / 2;
  while (nextCenterDist + width / 2 < maxDist) {
    // we have room to place another window
    const
      offX = direction.dx * nextCenterDist,
      offY = direction.dy * nextCenterDist;
    centers.push({ x: start.x + offX, y: start.y + offY, distFromStart: nextCenterDist });
    nextCenterDist += width + (spacing || 1);
  }
  if (centers.length === 0) return [];
  const
    margin = (
      (distanceBetweenPoints(centers[centers.length - 1], end) - width / 2)
      / 2),
    totalDist = distanceBetweenPoints(start, end),
    offX = direction.dx * margin,
    offY = direction.dy * margin;

  // center the group by adjusting each center by margin
  return centers.map(c => ({
    x: c.x + offX,
    y: c.y + offY,
    alpha: (c.distFromStart + margin) / totalDist,
  }));
}

export function cleanInvalidPoly(vertices) {
  for (let ix = 1; ix < vertices.length - 1; ix ++) {
    const
      a = vertices[ix - 1],
      b = vertices[ix],
      c = vertices[ix + 1];
    if (!ptsAreCollinear(a, b, c)) continue;
    // if the points *are* collinear, is a between b and c?
    const positionAlongEdge = _.reject(
      [
        (a.x - b.x) / (c.x - b.x),
        (a.y - b.y) / (c.y - b.y),
      ],
      isNaN)[0];
    // positionAlongEdge = 0 implies v == v1
    // positionAlongEdge = 1 implies v == v2
    // positionAlongEdge > 1 or < 0 implies not on the line segment
    if (positionAlongEdge > 1 || positionAlongEdge < 0) continue;
    // Uh oh! we have a redundant vertex.
    // going from a -> b -> c produces a zero-area region. Here's a picture:
    //              b----------a--------c
    // faster to just go a -> c.
    return cleanInvalidPoly([
      ...vertices.slice(0, ix),
      ...vertices.slice(ix + 1),
    ]);
  }
  // got to end of loop without returning, so no edits necessary
  return vertices;
}

const helpers = {
  /*
  * given two sets of points defining two faces
  * perform the specified operation (intersection, difference, union), return the resulting set of points
  * error if the result contains multiple faces (a face was divided in two during the operation), or holes
  */
  setOperation(type, f1Points, f2Points) {
    const
      f1Poly = toTurfPoly(f1Points).geometry.coordinates,
      f2Poly = toTurfPoly(f2Points).geometry.coordinates;
    const operation =
      type === 'union' ? union :
      type === 'intersection' ? intersection :
      type === 'difference' ? difference :
      null;
    if (operation === null) {
      throw new Error(`invalid operation "${type}". expected union, intersection, or difference`);
    }
    const result = operation(f1Poly, f2Poly);
    if (result === null || result.length === 0) {
      return [];
    }
    if (result.length > 1) return { error: 'no split faces' };
    if (result[0].length > 1) return { error: 'no holes' };
    return dropClosingVertex(result[0][0].map(([x, y]) => ({ x, y })));
  },
  // convenience functions for setOperation
  intersection(f1, f2) {
    return this.setOperation('intersection', f1, f2);
  },
  union(f1, f2) {
    return this.setOperation('union', f1, f2);
  },
  difference(f1, f2) {
    return this.setOperation('difference', f1, f2);
  },

  // given an array of points return the area of the space they enclose
  areaOfSelection(points) {
    if (points.length < 3) return 0;
		return area(points);
	},

    // ************************************ PROJECTIONS ************************************ //
  /**
   * Return the set of saved vertices directly on an edge, not including edge endpoints
   *
   * @param {*} edge Edge to check against vertices for a collision
   * @param {*} geometry 
   * @param {*} spacing
   * @returns 
   */
  splittingVerticesForEdgeId(edge, geometry, spacing) {
    const edgeV1 = this.vertexForId(edge.v1, geometry),
      edgeV2 = this.vertexForId(edge.v2, geometry);
      // look up all vertices touching the edge, ignoring the edge's endpoints
    
    return geometry.vertices.filter((vertex) => {
      const
        vertexIsEndpointById = edge.v1 === vertex.id || edge.v2 === vertex.id,
        vertexIsLeftEndpointByValue = edgeV1.x === vertex.x && edgeV1.y === vertex.y,
        vertexIsRightEndpointByValue = edgeV2.x === vertex.x && edgeV2.y === vertex.y,
        vertexIsEndpoint = vertexIsEndpointById || vertexIsLeftEndpointByValue || vertexIsRightEndpointByValue;

      if (vertexIsEndpoint) {
        return false;
      }
      // vertex is not an endpoint, consider for splitting
      const projection = this.projectionOfPointToLine(vertex, {
        p1: edgeV1,
        p2: edgeV2,
      });
      const distBetween = this.distanceBetweenPoints(vertex, projection);
      const shouldSplit = distBetween <= spacing / 20;
      return shouldSplit;
    });
  },

  projectionOfPointToLine,

    /*
     * given two points return the distance between them
     */
  distanceBetweenPoints,

	intersectionOfLines(p1, p2, p3, p4) {
	    var eps = 0.0000001;

	    const between = (a, b, c) => {
			return ((a - eps) <= b) && (b <= (c + eps));
		}

        var x = ((p1.x * p2.y - p1.y * p2.x) * (p3.x - p4.x) - (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x)) /
            ((p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x));
        var y = ((p1.x * p2.y - p1.y * p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x)) /
            ((p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x));

        if (isNaN(x) || isNaN(y) ||
			this.distanceBetweenPoints({ x, y }, p1) < eps ||
			this.distanceBetweenPoints({ x, y }, p2) < eps ||
			this.distanceBetweenPoints({ x, y }, p3) < eps ||
			this.distanceBetweenPoints({ x, y }, p4) < eps) {
            return false;
        } else {
            if (p1.x >= p2.x) {
                if (!between(p2.x, x, p1.x)) {
                    return false;
                }
            } else {
                if (!between(p1.x, x, p2.x)) {
                    return false;
                }
            }
            if (p1.y >= p2.y) {
                if (!between(p2.y, y, p1.y)) {
                    return false;
                }
            } else {
                if (!between(p1.y, y, p2.y)) {
                    return false;
                }
            }
            if (p3.x >= p4.x) {
                if (!between(p4.x, x, p3.x)) {
                    return false;
                }
            } else {
                if (!between(p3.x, x, p4.x)) {
                    return false;
                }
            }
            if (p3.y >= p4.y) {
                if (!between(p4.y, y, p3.y)) {
                    return false;
                }
            } else {
                if (!between(p3.y, y, p4.y)) {
                    return false;
                }
            }
        }
        return {
            x: x,
            y: y
        };

	},


    // ************************************ GEOMETRY LOOKUP ************************************ //

    // given a vertex id, find the vertex on the geometry set with that id
    vertexForId(vertex_id, geometry) {
        return geometry.vertices.find(v => v.id === vertex_id);
    },

    // given a set of coordinates, find the vertex on the geometry set within their tolerance zone
  vertexForCoordinates(coordinates, geometry) {
    return geometry.vertices.find(v => this.distanceBetweenPoints(v, coordinates) < 0.00001)
  },

    // given a face id, returns the populated vertex objects reference by edges on that face
    verticesForFaceId(face_id, geometry) {
        return geometry.faces.find(f => f.id === face_id)
            .edgeRefs.map((edgeRef) => {
                const edge = this.edgeForId(edgeRef.edge_id, geometry),
                    // look up the vertex associated with v1 unless the edge reference on the face is reversed
                    vertexId = edgeRef.reverse ? edge.v2 : edge.v1;
                return this.vertexForId(vertexId, geometry);
            });
    },


    // given an edge id, find the edge on the geometry set with that id
    edgeForId(edge_id, geometry) {
        return geometry.edges.find(e => e.id === edge_id);
    },

    // given a vertex id returns edges referencing that vertex
    edgesForVertexId(vertex_id, geometry) {
        return geometry.edges.filter(e => (e.v1 === vertex_id) || (e.v2 === vertex_id));
    },

    // given a face id, return the populated edge objects referenced by that face
    edgesForFaceId(face_id, geometry) {
        return geometry.faces.find(f => f.id === face_id)
            .edgeRefs.map(eR => this.edgeForId(eR.edge_id, geometry));
    },


    // given a face id, find the face on the geometry set with that id
    faceForId(face_id, geometry) {
        return geometry.faces.find(f => f.id === face_id);
    },

    // given a vertex id returns all faces with an edge referencing that vertex
    facesForVertexId(vertex_id, geometry) {
        return geometry.faces.filter((face) => {
            return face.edgeRefs.find((edgeRef) => {
                const edge = this.edgeForId(edgeRef.edge_id, geometry);
                return (edge.v1 === vertex_id || edge.v2 === vertex_id);
            });
        });
    },

    // given an edge id returns all faces referencing that edge
    facesForEdgeId(edge_id, geometry) {
        return geometry.faces.filter(face => face.edgeRefs.find(eR => eR.edge_id === edge_id));
    },

    pointInFace(point, faceVertices) {
      const facePoly = toTurfPoly(faceVertices);
      const testPoint = turf.point([point.x, point.y]);
      return booleanPointInPolygon(testPoint, facePoly);
    },

  ptsAreCollinear,
  syntheticRectangleSnaps(points, rectStart, cursorPt) {
    // create synthetic snapping points by considering
    // points that are near to the corners we're not drawing.
    // Consider the diagram below. We're drawing a rectangle from the top-left
    // corner ● to the bottom-right corner ○. The top-right, and bottom-left
    // _could_ snap to nearby points @, but they're not where the cursor is.
    // so we'll make synthetic points * and snap to those, even though they're
    // not really part of the geometry.
    /*

       ●-------------------------------------   @
       |                                     |    \
       |                                     |     |
       |                                     |     |
       |                                     |     |
       |                                     |     |
       |                                     |     |
       |                                     |     |
       |                                     |     |
       |                                     |     |
       |                                     |    /
        -------------------------------------○  *


       @                                     *
        \                                   /
         -----------------------------------
    */

    // We will reflect each point across both the horizontal and vertical
    // midlines of the rectangle.
    const xMid = (rectStart.x + cursorPt.x) / 2;
    const yMid = (rectStart.y + cursorPt.y) / 2;

    return [
      ...points.map(({ x, y }) => (
        { y, x: x + (2 * (xMid - x)), synthetic: true, originalPt: { x, y } })),
      ...points.map(({ x, y }) => (
        { x, y: y + (2 * (yMid - y)), synthetic: true, originalPt: { x, y } })),
    ];
  },
  edgeDirection,
  haveSimilarAngles,
  pointDistanceToSegment,

  exceptFace(geometry, face_id) {
    if (!face_id) { return geometry; }
    return {
      ...geometry,
      faces: _.reject(geometry.faces, { id: face_id }),
    };
  },

  denormalize(geometry) {
    const
      edges = geometry.edges.map(edge => ({
        ...edge,
        v1: this.vertexForId(edge.v1, geometry),
        v2: this.vertexForId(edge.v2, geometry),
      })),
      edgesById = _.zipObject(
        _.map(edges, 'id'),
        edges),
      faces = geometry.faces.map(face => ({
        id: face.id,
        edges: face.edgeRefs.map(({ edge_id, reverse }) => ({
          ...edgesById[edge_id],
          edge_id,
          reverse,
        })),
        get vertices() {
          return dropConsecutiveDups(
            _.flatMap(this.edges, e => (e.reverse ? [e.v2, e.v1] : [e.v1, e.v2])),
            v => v.id);
        },
      }));
    return {
      ...geometry,
      edges,
      faces,
    };
  },

  // probably best to use this only for testing
  normalize(geometry) {
    const
      edges = _.uniqBy(
        [
          ...geometry.edges,
          ..._.flatMap(geometry.faces, f => f.edges),
        ], 'id'),
      vertices = _.uniqBy(
        [
          ...geometry.vertices,
          ..._.flatMap(edges, e => [e.v1, e.v2]),
        ], 'id');
    return {
      id: geometry.id,
      vertices: vertices.map(v => _.pick(v, ['id', 'x', 'y'])),
      edges: edges.map(e => ({
        id: e.id,
        v1: e.v1.id,
        v2: e.v2.id,
      })),
      faces: geometry.faces.map(f => ({
        id: f.id,
        edgeRefs: f.edges.map(er => ({ edge_id: er.id, reverse: er.reverse })),
      })),
    };
  },
};

function isPointCoord(coord) {
  return coord.length === 2 && _.isNumber(coord[0]) && _.isNumber(coord[1]);
}

function isRingCoords(coords) {
  return coords.length >= 1 && _.every(coords, isPointCoord);
}

function isPolygonCoords(coords) {
  return coords.length >= 1 && _.every(coords, isRingCoords);
}

// Many of the below geometry functions are copyright 2017 TurfJS, MIT License.

// http://en.wikipedia.org/wiki/Even%E2%80%93odd_rule
// modified from: https://github.com/Turfjs/turf/blob/master/packages/turf-inside/index.js
// which was modified from https://github.com/substack/point-in-polygon/blob/master/index.js
// which was modified from http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
helpers.inside = function (pt, poly, ignoreBoundary = false) {
  // validation
  if (!isPointCoord(pt)) throw new Error(`point does not have correct coords: ${pt}`);
  if (!isPolygonCoords(poly)) throw new Error(`polygon does not have correct coords: ${poly}`);

  const bbox = helpers.bboxOfRing(poly[0]);

  // Quick elimination if point is not inside bbox
  if (bbox && helpers.inBBox(pt, bbox) === false) return false;

  let insidePoly = false;
  for (let i = 0; i < poly.length && !insidePoly; i++) {
    // check if it is in the outer ring first
    if (helpers.inRing(pt, poly[0], ignoreBoundary)) {
      let inHole = false;
      let k = 1;
      // check for the point in any of the holes
      while (k < poly.length && !inHole) {
        if (helpers.inRing(pt, poly[k], !ignoreBoundary)) {
          inHole = true;
        }
        k++;
      }
      if (!inHole) insidePoly = true;
    }
  }
  return insidePoly;
};

helpers.bboxOfRing = function (ring) {
  // a bbox is [west, south, east, north]
  return [
    _.min(_.map(ring, 0)),
    _.min(_.map(ring, 1)),
    _.max(_.map(ring, 0)),
    _.max(_.map(ring, 1)),
  ];
};

/**
 * inRing
 *
 * @private
 * @param {[number, number]} pt [x,y]
 * @param {Array<[number, number]>} ring [[x,y], [x,y],..]
 * @param {boolean} ignoreBoundary ignoreBoundary
 * @returns {boolean} inRing
 */
helpers.inRing = function (pt, ring, ignoreBoundary) {
  let isInside = false;
  if (ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]) ring = ring.slice(0, ring.length - 1);

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const onBoundary = (pt[1] * (xi - xj) + yi * (xj - pt[0]) + yj * (pt[0] - xi) === 0) &&
      ((xi - pt[0]) * (xj - pt[0]) <= 0) && ((yi - pt[1]) * (yj - pt[1]) <= 0);
    if (onBoundary) return !ignoreBoundary;
    const intersect = ((yi > pt[1]) !== (yj > pt[1])) &&
      (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
};

export function vertInRing(vert, ring) {
  const toLst = ({ x, y }) => [x, y];
  return helpers.inRing(toLst(vert), ring.map(toLst));
}

export default helpers;
