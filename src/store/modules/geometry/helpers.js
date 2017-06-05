import ClipperLib from 'js-clipper'

const helpers = {
    // ************************************ CLIPPER ************************************ //
    clipScale: 100,
	offset: 0.01,
    differenceOfFaces(f1Points, f2Points) {
		return this.setOperation('difference', f1Points, f2Points);
    },
    intersectionOfFaces(f1Points, f2Points) {
		return this.setOperation('intersection', f1Points, f2Points);
    },
    unionOfFaces(f1Points, f2Points) {
		return this.setOperation('union', f1Points, f2Points);
    },

	/*
	* given a set of points
	*/
	setOperation (type, f1Points, f2Points) {
		// translate points for each face into a clipper path
		const f1Path = f1Points.map(p => ({ X: p.x, Y: p.y })),
        	f2Path = f2Points.map(p => ({ X: p.x, Y: p.y }));

		// offset both paths to prevent floating point inaccuracies from causing incorrect intersections
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
		switch (type) {
			case 'union':
				operation = ClipperLib.ClipType.ctUnion;
				break;
			case 'intersection':
				operation = ClipperLib.ClipType.ctIntersection;
				break;
			case 'difference':
				operation = ClipperLib.ClipType.ctDifference;
				break;
		}

        cpr.Execute(operation, resultPathsOffsetted, ClipperLib.PolyFillType.pftEvenOdd, ClipperLib.PolyFillType.pftEvenOdd);

		// scale down path
		ClipperLib.JS.ScaleUpPaths(resultPathsOffsetted, 1 / this.clipScale);

		// undo offset
		const resultPaths = new ClipperLib.Paths();
		offset.AddPaths(resultPathsOffsetted, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
		offset.Execute(resultPaths, -this.offset);

        if (resultPaths.length === 1) {
			// translate into points
			return resultPaths[0].map(p => ({ x: p.X, y: p.Y }));
        } else if (resultPaths.length === 0) {
        	return [];
        } else if (resultPaths.length > 1) {
			// TODO: the operation created multiple faces, we need to handle this case
			throw new Error('The operation resulted in multiple closed faces, we need to handle this case.');
        	return false;
        }
	},

    // given an array of points return the area of the space they enclose
    areaOfSelection(points) {
		const paths = points.map(p => ({ X: p.x, Y: p.y }))
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

    // ************************************ EDGES ************************************ //
    /*
     * run through all edges on a face, sort them, and set the reverse property logically
     * this actually mutates faces, call it from a data store mutation
     */
    normalizedEdges(face, geometry) {
        // initialize the set with the first edge, we assume the reverse property is correctly set for this one
        const normalizedEdgeRefs = [];
        normalizedEdgeRefs.push(face.edgeRefs[0]);

        // there will be exactly two edges on the face referencing each vertex
        for (var i = 0; i < face.edgeRefs.length - 1; i++) {
            const currentEdgeRef = normalizedEdgeRefs[i],
                currentEdge = this.edgeForId(currentEdgeRef.edge_id, geometry),

                // each edgeref's edge will have a startpoint and an endpoint, v1 or v2 depending on the reverse property
                currentEdgeEndpoint = currentEdgeRef.reverse ? currentEdge.v1 : currentEdge.v2;

            var reverse;
            // find the next edge by looking up the second edge with a reference to the endpoint of the current edge
            const nextEdgeRef = face.edgeRefs.find((edgeRef) => {
                // skip current edge
                if (edgeRef.edge_id === currentEdge.id) {
                    return;
                }

                const nextEdge = this.edgeForId(edgeRef.edge_id, geometry);
                const currentEdgeEndpointVertex = this.vertexForId(currentEdgeEndpoint, geometry),
                    nextEdgeVertex1 = this.vertexForId(nextEdge.v1, geometry),
                    nextEdgeVertex2 = this.vertexForId(nextEdge.v2, geometry);

                if ((nextEdgeVertex1.x === currentEdgeEndpointVertex.x && nextEdgeVertex1.y === currentEdgeEndpointVertex.y) ||
                    (nextEdgeVertex2.x === currentEdgeEndpointVertex.x && nextEdgeVertex2.y === currentEdgeEndpointVertex.y)) {
                    if (normalizedEdgeRefs.map(eR => eR.edge_id).indexOf(nextEdge.id) !== -1) {
                        return;
                    }
                    reverse = (nextEdgeVertex1.x === currentEdgeEndpointVertex.x && nextEdgeVertex1.y === currentEdgeEndpointVertex.y) ? false : true;
                    return true;
                }
            });
            // prevent direct mutation of state
            const nextEdgeRefCopy = JSON.parse(JSON.stringify(nextEdgeRef));
            // set the reverse property on the next edge depending on whether its v1 or v2 references the endpoint of the current edge
            // we want the startpoint of the next edge to be the endpoint of the currentEdge
            nextEdgeRefCopy.reverse = reverse;
            normalizedEdgeRefs.push(nextEdgeRefCopy);
        }
        return normalizedEdgeRefs;
    },


    // ************************************ GEOMETRY LOOKUP ************************************ //

    // given a vertex id, find the vertex on the geometry set with that id
    vertexForId(vertex_id, geometry) {
        return geometry.vertices.find(v => v.id === vertex_id);
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
    }
};

export default helpers;
