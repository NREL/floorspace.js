import ClipperLib from 'js-clipper'

const helpers = {
    /*
    * clipper helpers
    */
    // convert a set of clipper vertices to an SVG path string
    clipperPathToSvgPath (paths) {
        var svgpath = '';
        // loop through each polygon
        for (var i = 0; i < paths.length; i++) {
            // loop through each vertex
            for (var j = 0; j < paths[i].length; j++) {
                svgpath += j ? 'L' : 'M';
                svgpath += paths[i][j].X + ', ' + paths[i][j].Y;
            }
            svgpath += 'Z';
        }

        if (svgpath === '') {
            svgpath = 'M0,0';
        }
        return svgpath;
    },
    // obtain a set of ordered vertices for the face
    faceToClipperPath (face, geometry) {
        return face.edgeRefs.map((edgeRef) => {
            // look up the edge referenced by the face
            const edge = geometry.edges.find((e) => {
                return e.id === edgeRef.edge_id;
            });
            // look up the vertex associated with v1 unless the edge reference on the face is reversed
            const vertexId = edgeRef.reverse ? edge.v2 : edge.v1;
            return geometry.vertices.find((v) => {
                return v.id === vertexId;
            });
        });
    },
    unionOfFaces (face1, paths, geometry) {
        const cpr = new ClipperLib.Clipper(),
            // TODO: if there are holes, just pass them in as additional subject/clip paths
            subj_paths = JSON.parse(JSON.stringify([this.verticesforFace(face1, geometry)])),
            clip_paths = JSON.parse(JSON.stringify([paths.slice()])); // [this.verticesforFace(face2, geometry)];
        console.log(JSON.stringify(subj_paths));
        console.log(JSON.stringify(clip_paths));

        // TODO: this scaling feature could be useful for snapping
        var scale = 100000;
        ClipperLib.JS.ScaleUpPaths(subj_paths, scale);
        ClipperLib.JS.ScaleUpPaths(clip_paths, scale);

        cpr.AddPaths(subj_paths, ClipperLib.PolyType.ptSubject, true);  // true means closed path
        cpr.AddPaths(clip_paths, ClipperLib.PolyType.ptClip, true);

        var solution_paths = new ClipperLib.Paths();
        cpr.Execute(ClipperLib.ClipType.ctUnion, solution_paths, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);

        console.log(JSON.stringify(solution_paths));
        return solution_paths[0].map((p) => { return {x: p.X / scale, y: p.Y / scale}; });
    },

    /*
    * lookup helpers
    */
    vertexForId (vertex_id, geometry) {
        return geometry.vertices.find((vertex) => { return vertex.id === vertex_id; });
    },
    edgeForId (edge_id, geometry) {
        return geometry.edges.find((edge) => { return edge.id === edge_id; });
    },
    faceForId (face_id, geometry) {
        return geometry.faces.find((face) => { return face.id === face_id; });
    },
    edgesForFace (face, geometry) {
        return face.edgeRefs.map((edgeRef) => {
            return geometry.edges.find((edge) => { return edge.id === edgeRef.edge_id; });
        });
    },
    // the vertices referenced by the edges of a face
    verticesforFace (face, geometry) {
        const vertices = [];
        face.edgeRefs.forEach((edgeRef, i) => {
            const edge = geometry.edges.find((edge) => { return edge.id === edgeRef.edge_id; });
            // each vertex will be referenced by two connected edges, so we only store v1
            const vertex = geometry.vertices.find((vertex) => { return vertex.id === edge.v1; });
            vertices.push(vertex);
        });
        return vertices;
    },
    // the edges with references to a vertex
    edgesForVertex (vertex_id, geometry) {
        return geometry.edges.filter((edge) => {
            return (edge.v1 === vertex_id || edge.v2 === vertex_id);
        });
    },
    // the faces with references to a vertex
    facesForVertex (vertex_id, geometry) {
        return geometry.faces.filter((face) => {
            return face.edgeRefs.find((edgeRef) => {
                const edge = geometry.edges.find((edge) => { return edge.id === edgeRef.edge_id; });
                return (edge.v1 === vertex_id || edge.v2 === vertex_id);
            });
        });
    },
    // the faces with references to an edge
    facesForEdge (edge_id, geometry) {
        return geometry.faces.filter((face) => {
            return face.edgeRefs.find((edgeRef) => {
                return edgeRef.edge_id === edge_id;
            });
        });
    },
    /*
    * run through all edges on a face, sort them, and set the reverse property logically
    */
    normalizedEdges (face, geometry) {
        // initialize the set with the first edge, we assume the reverse property is correctly set for this one
        // TODO: how do we know the startpoint for the first edge?
        const normalizedEdgeRefs = [];
        normalizedEdgeRefs.push(face.edgeRefs[0]);

        // there will be exactly two edges on the face referencing each vertex
        for (var i = 0; i < face.edgeRefs.length - 1; i++) {
            const currentEdgeRef = normalizedEdgeRefs[i];
            const currentEdge = this.edgeForId(currentEdgeRef.edge_id, geometry);

            // each edgeref's edge will have a startpoint and an endpoint, v1 or v2 depending on the reverse property
            // edge.startpoint = edgeref.reverse ? edge.v2 : edge.v1;
            const currentEdgeEndpoint = currentEdgeRef.reverse ? currentEdge.v1 : currentEdge.v2;

            var nextEdgeRefIsReversed;
            // look up the other edge with a reference to the endpoitnt on the current edge
            const nextEdgeRef = face.edgeRefs.find((edgeRef) => {
                // the current edge will also have a reference to the current edge endpoint, don't return that one
                if (edgeRef.edge_id === currentEdge.id) { return; }

                const nextEdge = this.edgeForId(edgeRef.edge_id, geometry);
                if (nextEdge.v1 === currentEdgeEndpoint) {
                    nextEdgeRefIsReversed = false;
                    return true;
                } else if (nextEdge.v2 === currentEdgeEndpoint) {
                    nextEdgeRefIsReversed = true;
                    return true;
                }
            });
            // set the reverse property on the next edge depending on whether its v1 or v2 references the endpoint of the current edge
            // we want the startpoint of the next edge to be the endpoint of the currentEdge
            nextEdgeRef.reverse = nextEdgeRefIsReversed;
            normalizedEdgeRefs.push(nextEdgeRef);
        }
        return normalizedEdgeRefs;
    }
};

export default helpers;
