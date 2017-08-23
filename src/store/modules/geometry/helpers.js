import _ from 'lodash';
import ClipperLib from 'js-clipper';
import { dropConsecutiveDups } from '../../../utilities';

export function distanceBetweenPoints(p1, p2) {
  const
    dx = Math.abs(p1.x - p2.x),
    dy = Math.abs(p1.y - p2.y);
  return Math.sqrt((dx * dx) + (dy * dy));
}

const helpers = {
  // ************************************ CLIPPER ************************************ //
  // scaling - see https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperoffsetexecute
  clipScale: 100,
  // prevent floating point inaccuracies by expanding faces by the offset before performing a clip operation, and then scaling the result back down
  // https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperoffset
  offset: 0.01,

  /*
  * given two sets of points defining two faces
  * perform the specified operation (intersection, difference, union), return the resulting set of points
  * return false if the result contains multiple faces (a face was divided in two during the operation)
  */
  setOperation(type, f1Points, f2Points) {
    // translate points for each face into a clipper path
    const
      f1Path = f1Points.map(p => ({ X: p.x, Y: p.y })),
      f2Path = f2Points.map(p => ({ X: p.x, Y: p.y }));

    // offset both paths prior to executing clipper operation to acount for tiny floating point inaccuracies
    const offset = new ClipperLib.ClipperOffset(),
      f1PathsOffsetted = new ClipperLib.Paths(),
      f2PathsOffsetted = new ClipperLib.Paths();

    offset.AddPaths([f1Path], ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
    offset.Execute(f1PathsOffsetted, this.offset);
    offset.Clear();
    offset.AddPaths([f2Path], ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
    offset.Execute(f2PathsOffsetted, this.offset);
    offset.Clear();

    // scale paths up before performing operation
    ClipperLib.JS.ScaleUpPaths(f1PathsOffsetted, this.clipScale);
    ClipperLib.JS.ScaleUpPaths(f2PathsOffsetted, this.clipScale);

    const
      cpr = new ClipperLib.Clipper(),
      resultPathsOffsetted = new ClipperLib.Paths();

    cpr.AddPaths(f1PathsOffsetted, ClipperLib.PolyType.ptSubject, true);
    cpr.AddPaths(f2PathsOffsetted, ClipperLib.PolyType.ptClip, true);

    const operation =
      type === 'union' ? ClipperLib.ClipType.ctUnion :
      type === 'intersection' ? ClipperLib.ClipType.ctIntersection :
      type === 'difference' ? ClipperLib.ClipType.ctDifference :
      null;
    if (operation === null) {
      throw new Error(`invalid operation "${type}". expected union, intersection, or difference`);
    }

    cpr.Execute(operation, resultPathsOffsetted, ClipperLib.PolyFillType.pftEvenOdd, ClipperLib.PolyFillType.pftEvenOdd);

    // scale down path
    ClipperLib.JS.ScaleDownPaths(resultPathsOffsetted, this.clipScale);

    // undo offset on resulting path
    const resultPaths = new ClipperLib.Paths();
    offset.AddPaths(resultPathsOffsetted, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
    offset.Execute(resultPaths, -this.offset);

    // if multiple paths were created, a face has been split and the operation should fail
    if (resultPaths.length === 1) {
      // translate into points
      return resultPaths[0].map(p => ({ x: p.X, y: p.Y }));
    } else if (resultPaths.length === 0) {
      return [];
    }
    return {
      error: 'no split faces',
    };
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
		const paths = points.map(p => ({ X: p.x, Y: p.y }))
		// NOTE: clipper will sometimes return 0 area for self intersecting paths, this is fine because they'll fail validation regardless
		return ClipperLib.JS.AreaOfPolygon(paths);
	},

    // ************************************ PROJECTIONS ************************************ //
    /*
     * return the set of saved vertices directly on an edge, not including edge endpoints
     */
    splittingVerticesForEdgeId(edge_id, geometry) {
        const edge = geometry.edges.find(e => e.id === edge_id),
            edgeV1 = this.vertexForId(edge.v1, geometry),
            edgeV2 = this.vertexForId(edge.v2, geometry);

        // look up all vertices touching the edge, ignoring the edge's endpoints
        return geometry.vertices.filter((vertex) => {
            if ((edge.v1 !== vertex.id && edge.v2 !== vertex.id) &&
				!(edgeV1.x === vertex.x && edgeV1.y === vertex.y) &&
				!(edgeV2.x === vertex.x && edgeV2.y === vertex.y)
			) {
                const projection = this.projectionOfPointToLine(vertex, {
                    p1: edgeV1,
                    p2: edgeV2
                });
                return this.distanceBetweenPoints(vertex, projection) <= 1 / this.clipScale;
            }
        });
    },

    /*
     * given a point and a line (object with two points p1 and p2)
     * return the coordinates of the projection of the point onto the line
     */
    projectionOfPointToLine(point, line) {
        const {
            p1: {
                x: x1,
                y: y1
            },
            p2: {
                x: x2,
                y: y2
            }
        } = line;
        const A = point.x - x1,
            B = point.y - y1,
            C = x2 - x1,
            D = y2 - y1,
            dot = A * C + B * D,
            lenSq = (C * C + D * D) || 2,
            param = dot / lenSq;

        // projection is an endpoint
        if (param <= 0) {
            return line.p1;
        } else if (param > 1) {
            return line.p2;
        }

        return {
            x: x1 + param * C,
            y: y1 + param * D
        };
    },

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

    ptsAreCollinear(p1, p2, p3) {
      const [a, b] = [p1.x, p1.y],
        [m, n] = [p2.x, p2.y],
        {x, y} = p3;
      return Math.abs((n - b) * (x - m) - (y - n) * (m - a)) < 0.00001;
    },

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
  edgeDirection({ start, end }) {
    // return the angle from east, in radians.
    const
      deltaX = end.x - start.x,
      deltaY = end.y - start.y;
    return deltaX === 0 ? 0.5 * Math.PI : Math.atan(deltaY / deltaX);
  },
  haveSimilarAngles(edge1, edge2) {
    const
      angleDiff = this.edgeDirection(edge1) - this.edgeDirection(edge2),
      correctedDiff = Math.min(
        Math.abs(angleDiff),
        Math.PI - angleDiff, // To catch angles that are very similar, but opposite directions
      );
    return correctedDiff < 0.05 * Math.PI;
  },
  pointDistanceToSegment(pt, { start, end }) {
    const proj = helpers.projectionOfPointToLine(pt, { p1: start, p2: end });
    return {
      dist: helpers.distanceBetweenPoints(pt, proj),
      proj,
    };
  },

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
            _.flatMap( this.edges, e => (e.reverse ? [e.v2, e.v1] : [e.v1, e.v2])),
            v => v.id)
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

export default helpers;
