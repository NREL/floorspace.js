const helpers = {
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
    }
};

helpers.prettyPrintFace = (face, geometry) => {
    console.log('face: ', JSON.stringify(face));
    console.log('edges: ', JSON.stringify(helpers.edgesForFace(face, geometry)));
    console.log('vertices: ', JSON.stringify(helpers.verticesforFace(face, geometry)));
};

helpers.normalizedEdges = (face, geometry) => {
    // initialize the set with the first edge, we assume the reverse property is correctly set for this one
    // TODO: how do we know the startpoint for the first edge?
    const normalizedEdgeRefs = [];
    normalizedEdgeRefs.push(face.edgeRefs[0]);

    // there will be exactly two edges on the face referencing each vertex
    for (var i = 0; i < face.edgeRefs.length - 1; i++) {
        const currentEdgeRef = normalizedEdgeRefs[i];
        const currentEdge = helpers.edgeForId(currentEdgeRef.edge_id, geometry);

        // each edgeref's edge will have a startpoint and an endpoint, v1 or v2 depending on the reverse property
        // edge.startpoint = edgeref.reverse ? edge.v2 : edge.v1;
        const currentEdgeEndpoint = currentEdgeRef.reverse ? currentEdge.v1 : currentEdge.v2;

        var nextEdgeRefIsReversed;
        // look up the other edge with a reference to the endpoitnt on the current edge
        const nextEdgeRef = face.edgeRefs.find((edgeRef) => {
            // the current edge will also have a reference to the current edge endpoint, don't return that one
            if (edgeRef.edge_id === currentEdge.id) { return; }

            const nextEdge = helpers.edgeForId(edgeRef.edge_id, geometry);
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
};

export default helpers;
