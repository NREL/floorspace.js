import ClipperLib from 'js-clipper'

const helpers = {
    /*
    * clipper helpers
    */
    clipScale () {
        // TODO: this scaling feature could be useful for snapping, could calculate based on grid settings but we'd need to add an offset...
        return 100000;
    },
    initClip (f1Paths, f2Paths, geometry) {
        const cpr = new ClipperLib.Clipper(),
            // TODO: when we add support for holes, pass them in as additional subject/clip paths
            subj_paths = JSON.parse(JSON.stringify([f1Paths.slice()])),
            clip_paths = JSON.parse(JSON.stringify([f2Paths.slice()]));

        ClipperLib.JS.ScaleUpPaths(subj_paths, this.clipScale());
        ClipperLib.JS.ScaleUpPaths(clip_paths, this.clipScale());

        cpr.AddPaths(subj_paths, ClipperLib.PolyType.ptSubject, true);
        cpr.AddPaths(clip_paths, ClipperLib.PolyType.ptClip, true);
        return cpr;
    },
    differenceOfFaces (f1Paths, f2Paths, geometry) {
        const cpr = this.initClip(f1Paths, f2Paths, geometry)
        var difference = new ClipperLib.Paths();
        cpr.Execute(ClipperLib.ClipType.ctDifference, difference, ClipperLib.PolyFillType.pftEvenOdd, ClipperLib.PolyFillType.pftEvenOdd);
        if (difference.length && difference[0].length) {
            return difference[0].map((p) => {
                return {
                    x: p.X / this.clipScale(),
                    y: p.Y / this.clipScale()
                };
            });
        }
    },
    intersectionOfFaces (f1Paths, f2Paths, geometry) {
        const cpr = this.initClip(f1Paths, f2Paths, geometry)
        var intersection = new ClipperLib.Paths();
        cpr.Execute(ClipperLib.ClipType.ctIntersection, intersection, ClipperLib.PolyFillType.pftEvenOdd, ClipperLib.PolyFillType.pftEvenOdd);
        if (intersection.length && intersection[0].length) {
            return intersection[0].map((p) => {
                return {
                    x: p.X / this.clipScale(),
                    y: p.Y / this.clipScale()
                };
            });
        }
    },
    unionOfFaces (f1Paths, f2Paths, geometry) {
        const cpr = this.initClip(f1Paths, f2Paths, geometry)
        var union = new ClipperLib.Paths();
        cpr.Execute(ClipperLib.ClipType.ctUnion, union, ClipperLib.PolyFillType.pftEvenOdd, ClipperLib.PolyFillType.pftEvenOdd);
        if (union.length && union[0].length) {
            return union[0].map((p) => {
                return {
                    x: p.X / this.clipScale(),
                    y: p.Y / this.clipScale()
                };
            });
        }
    },
    combineFacesByEdge (face1, face2) {
        /*
        * given two faces with a shared edge, destroy the shared edge
        * and create a single larger face
        */
    },
    verticesOnEdge (edge, geometry) {
        const edgeV1 = this.vertexForId(edge.v1, geometry),
            edgeV2 = this.vertexForId(edge.v2, geometry);

        // look up all vertices directly ON the edge, ignoring the edge's endpoints
        return geometry.vertices.filter((vertex) => {
            if ((edgeV1.x === vertex.x && edgeV1.y === vertex.y) || (edgeV2.x === vertex.x && edgeV2.y === vertex.y)) { return; }
            return this.projectToEdge(vertex, edgeV1, edgeV2).dist <= 1 / this.clipScale();
        });
    },

    /*
    * lookup helpers
    */
    // by id
    vertexForId (vertex_id, geometry) {
        return geometry.vertices.find((vertex) => { return vertex.id === vertex_id; });
    },
    edgeForId (edge_id, geometry) {
        return geometry.edges.find((edge) => { return edge.id === edge_id; });
    },
    faceForId (face_id, geometry) {
        return geometry.faces.find((face) => { return face.id === face_id; });
    },
    // by face
    edgesForFace (face, geometry) {
        return face.edgeRefs.map((edgeRef) => {
            return this.edgeForId(edgeRef.edge_id, geometry);
        });
    },
    verticesForFace (face, geometry) {
        return face.edgeRefs.map((edgeRef) => {
            // look up the edge referenced by the face
            const edge = this.edgeForId(edgeRef.edge_id, geometry);

            // look up the vertex associated with v1 unless the edge reference on the face is reversed
            const vertexId = edgeRef.reverse ? edge.v2 : edge.v1;
            return this.vertexForId(vertexId, geometry);
        });
    },
    edgesForVertex (vertex_id, geometry) {
        return geometry.edges.filter((edge) => {
            return (edge.v1 === vertex_id || edge.v2 === vertex_id);
        });
    },

    // find a vertex with certain coordinates
    vertexWithXY () {},
    // find an edge referencing two vertices
    edgeWithVertices (startpoint, endpoint, geometry) {},

    // find a face
    facesForVertex (vertex_id, geometry) {
        return geometry.faces.filter((face) => {
            return face.edgeRefs.find((edgeRef) => {
                const edge = this.edgeForId(edgeRef.edge_id, geometry);
                return (edge.v1 === vertex_id || edge.v2 === vertex_id);
            });
        });
    },
    facesForEdge (edge_id, geometry) {
        return geometry.faces.filter((face) => {
            return face.edgeRefs.find((edgeRef) => {
                return edgeRef.edge_id === edge_id;
            });
        });
    },

    projectToEdge (point, v1, v2) {
        const x = point.x,
            y = point.y,
            x1 = v1.x,
            y1 = v1.y,
            x2 = v2.x,
            y2 = v2.y,
            A = x - x1,
            B = y - y1,
            C = x2 - x1,
            D = y2 - y1,
            dot = A * C + B * D,
            lenSq = (C * C + D * D) || 2;

        const param = dot / lenSq;
        var xProjection, yProjection;

        if (param <= 0) {
            xProjection = x1;
            yProjection = y1;
        } else if (param > 1) {
            xProjection = x2;
            yProjection = y2;
        } else {
            xProjection = x1 + param * C;
            yProjection = y1 + param * D;
        }

        const dx = x - xProjection,
            dy = y - yProjection;

        return {
            dist: Math.sqrt(dx * dx + dy * dy),
            scalar: {
                x: xProjection,
                y: yProjection
            }
        };
    },

    /*
    * run through all edges on a face, sort them, and set the reverse property logically
    * this actually mutates faces, call it from a
    */
    normalizedEdges (face, geometry) {
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
                if (edgeRef.edge_id === currentEdge.id) { return; }

                const nextEdge = this.edgeForId(edgeRef.edge_id, geometry);
                if (nextEdge.v1 === currentEdgeEndpoint || nextEdge.v2 === currentEdgeEndpoint) {
                    if (normalizedEdgeRefs.map(eR => eR.edge_id).indexOf(nextEdge.id) !== -1) {
                        debugger;
                        return;
                    }
                    reverse = nextEdge.v1 === currentEdgeEndpoint ? false : true;
                    return true;
                }
            });
            if (!nextEdgeRef) { debugger; }
            // prevent direct mutation of state
            const nextEdgeRefCopy = JSON.parse(JSON.stringify(nextEdgeRef));
            // set the reverse property on the next edge depending on whether its v1 or v2 references the endpoint of the current edge
            // we want the startpoint of the next edge to be the endpoint of the currentEdge
            nextEdgeRefCopy.reverse = reverse;
            normalizedEdgeRefs.push(nextEdgeRefCopy);
        }
        return normalizedEdgeRefs;
    },
    dc (data) {
        return JSON.parse(JSON.stringify(data));
    }

};

export default helpers;
