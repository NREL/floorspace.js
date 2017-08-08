import _ from 'lodash';
import ClipperLib from 'js-clipper'

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
	setOperation (type, f1Points, f2Points) {
		// translate points for each face into a clipper path
		const f1Path = f1Points.map(p => ({ X: p.x, Y: p.y })),
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

		const cpr = new ClipperLib.Clipper(),
			resultPathsOffsetted = new ClipperLib.Paths();

        cpr.AddPaths(f1PathsOffsetted, ClipperLib.PolyType.ptSubject, true);
        cpr.AddPaths(f2PathsOffsetted, ClipperLib.PolyType.ptClip, true);

		var operation;
		if (type === 'union') { operation = ClipperLib.ClipType.ctUnion; }
		else if (type === 'intersection') { operation = ClipperLib.ClipType.ctIntersection; }
		else if (type === 'difference') { operation = ClipperLib.ClipType.ctDifference; }

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
        } else if (resultPaths.length > 1) {
			return false;
        }
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
    distanceBetweenPoints(p1, p2) {
        const dx = Math.abs(p1.x - p2.x),
            dy = Math.abs(p1.y - p2.y);
        return Math.sqrt((dx * dx) + (dy * dy));
    },

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
    const { x, y } = coordinates;
    return geometry.vertices.find(v => v.x === x && v.y === y);
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

  findMergeableEdges(edges) {
    // Find edges that are very near to one another, and the user might
    // mistakenly think they are the same.

    // mergeable edges are:
    // - edges with whose endpoints are very near to one another
    // - edges with similar angles where the vertices of one/both lie near the
    // edge of the other.
  },
  areMergeable(edge1, edge2) {
    return this.endpointsNearby(edge1, edge2);
  },
  oneEdgeCouldEatAnother(edge1, edge2) {
    /*
          o-------o
     o--------------------------o
    */
    if (!this.haveSimilarAngles(edge1, edge2)) {
      return false;
    }
    return (
      this.leftEdgeEatsRight(edge1, edge2) ||
      this.leftEdgeEatsRight(edge2, edge1));
  },
  leftEdgeEatsRight(left, right) {
    const
      { start, end } = right,
      avgEdgeLen = this.avgEdgeLength(left, right),
      { dist: startDist, proj: startProj } = this.pointDistanceToSegment(start, left),
      { dist: endDist, proj: endProj } = this.pointDistanceToSegment(end, left);

    if (!(Math.max(startDist, endDist) < 0.05 * avgEdgeLen)) {
      return false;
    }

    return {
      mergeType: 'oneEdgeEatsAnother',
      newVertexOrder: this.consolidateVertices(left.start, left.end, startProj, endProj),
    };
  },
  edgesExtend(edge1, edge2) {
    /*
                  o----------------o
        o--------o
    */
    if (!this.haveSimilarAngles(edge1, edge2)) {
      return false;
    }
    const distCutoff = 0.05 * this.avgEdgeLength(edge1, edge2);

    let left, right; // eslint-disable-line one-var-declaration-per-line
    if (this.distanceBetweenPoints(edge1.end, edge2.start) < distCutoff) {
      left = edge1;
      right = edge2;
    } else if (this.distanceBetweenPoints(edge2.end, edge1.start) < distCutoff) {
      left = edge2;
      right = edge1;
    } else {
      return false;
    }

    return {
      mergeType: 'edgesExtend',
      newVertexOrder: this.consolidateVertices(left.start, right.end, left.end, right.start),
    };
  },
  edgesCombine(edge1, edge2) {
    /*

      o------------o
           o---------------o
    */
    if (!this.haveSimilarAngles(edge1, edge2)) {
      return false;
    }
    // if close enough
    let left, right; // eslint-disable-line one-var-declaration-per-line
    if (this.edgesCombine_LeftBeforeRight(edge1, edge2)) {
      left = edge1;
      right = edge2;
    } else if (this.edgesCombine_LeftBeforeRight(edge2, edge1)) {
      left = edge1;
      right = edge2;
    } else {
      return false;
    }

    // project onto the direction with most variance to get order
    // then output that order
    const
      dirWithMostVar = { p1: left.start, p2: right.end },
      leftMiddle = this.projectionOfPointToLine(right.start, dirWithMostVar),
      rightMiddle = this.projectionOfPointToLine(left.end, dirWithMostVar);
    return {
      mergeType: 'combine',
      newVertexOrder: this.consolidateVertices(
        left.start, right.end, leftMiddle, rightMiddle),
    };
  },
  edgesCombine_LeftBeforeRight(left, right) {
    const
      avgEdgeLength = this.avgEdgeLength(left, right),
      distCutoff = 0.05 * avgEdgeLength,
      { dist: leftEndDist } = this.pointDistanceToSegment(left.end, right),
      { dist: rightStartDist } = this.pointDistanceToSegment(right.start, left);

    return Math.min(leftEndDist, rightStartDist) < distCutoff;
  },
  avgEdgeLength({ start: start1, end: end1 }, { start: start2, end: end2 }) {
    return (
      this.distanceBetweenPoints(start1, end1) +
      this.distanceBetweenPoints(start2, end2)
    ) / 2;
  },
  endpointsNearby(edge1, edge2) {
    /*

      o---------------------o
     o----------------------o

    */
    const { start: start1, end: end1 } = edge1;
    const { start: start2, end: end2 } = edge2;
    const avgEdgeLen = this.avgEdgeLength(edge1, edge2);

    const startDist = this.distanceBetweenPoints(start1, start2);
    const endDist = this.distanceBetweenPoints(end1, end2);

    if (startDist < 0.05 * avgEdgeLen && endDist < 0.05 * avgEdgeLen) {
      return { mergeType: 'sameEndpoints' };
    }

    const startEndDist = this.distanceBetweenPoints(start1, end2);
    const endStartDist = this.distanceBetweenPoints(end1, start2);

    if (startEndDist < 0.05 * avgEdgeLen && endStartDist < 0.05 * avgEdgeLen) {
      return { mergeType: 'reverseEndpoints' };
    }

    return false;
  },
  consolidateVertices(start, end, ...interveningPts) {
    const distCutoff = 0.05 * this.distanceBetweenPoints(end, start),
      finalPts = [start, end],
      // First, make sure we're considering points in order left-to-right
      intervening = _.sortBy(
        interveningPts,
        pt => this.distanceBetweenPoints(pt, start));

    // now, consider each point for inclusion. A point will be included if it's
    // farther than distCutoff from every point so far.
    intervening.forEach((pt) => {
      if (_.every(finalPts, fp => (this.distanceBetweenPoints(pt, fp) > distCutoff))) {
        finalPts.push(pt);
      }
    });

    // Now put the 'end' back at the end.
    finalPts.push(finalPts.splice(1, 1)[0]);
    return finalPts;
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
    const proj = this.projectionOfPointToLine(pt, { p1: start, p2: end });
    return {
      dist: this.distanceBetweenPoints(pt, proj),
      proj,
    };
  },
};

export default helpers;
