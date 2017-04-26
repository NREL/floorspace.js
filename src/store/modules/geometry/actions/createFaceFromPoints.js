import factory from './../factory.js'
import geometryHelpers from './../helpers'
import modelHelpers from './../../models/helpers'

/*
* create a face and associated edges and vertices from an array of points
* associate the face with the space or shading included in the payload
*/
export default function createFaceFromPoints (context, payload) {
    // points defining the boundaries of the new face
    var points = payload.points.map(p => ({ ...p, X: p.x, Y: p.y }));

    // validation - a face must have at least 3 vertices and area
    if (points.length < 3 || !geometryHelpers.areaOfFace(points)) { return; }

    const currentStoryGeometry = context.rootGetters['application/currentStoryGeometry'],
        target = modelHelpers.libraryObjectWithId(context.rootState.models, payload.space ? payload.space.id : payload.shading.id);


    // if target already has an existing face, destroy existing face and calculate a new set of points
    if (target.face_id) {
        points = mergeWithExistingFace(points, currentStoryGeometry, target, context);
    }

    // prevent overlapping faces by erasing existing geometry covered by the points defining the new face
    context.dispatch('eraseSelection', { points: points });

    // create and save vertices and edges for the face
    const face = createFaceGeometry(points, currentStoryGeometry, context);

    // validate and save the face, return if validation fails
    const validFace = validateAndSaveFace(face, currentStoryGeometry, target, context);
    if (!validFace) { return; }

    // split edges where vertices touch them
    splitEdges(currentStoryGeometry, context);
    connectEdges(currentStoryGeometry, context);
};

//////////////////////// HELPERS //////////////////////////////

/*
* if the target has an existing face - destroy the existing face on the target
* if the new face being created intersects the existing face or shares an edge with the existing face,
* update the points used to create the new face to be the UNION of the new and existing faces
*/
function mergeWithExistingFace (points, currentStoryGeometry, target, context) {
    const existingFace = geometryHelpers.faceForId(target.face_id, currentStoryGeometry),
        existingFaceVertices = geometryHelpers.verticesForFace(existingFace, currentStoryGeometry);

    /*
    * if new and existing face share an edge, update points to use their union
    * loop through all points for the new face and check if they are splitting an edge which belongs to the existing face
    * check if the edges to be created for the new face are split by any vertices on the existing face
    */
    for (var i = 0; i < points.length; i++) {
        // infer edges to be created for the new face based on points
        const edgeV1 = points[i],
            edgeV2 = points[i < points.length - 1 ? i + 1 : 0],
            // look up all existing face vertices splitting the edge to be created for the new face
            verticesOnEdge = existingFaceVertices.filter((vertex) => {
                if ((edgeV1.x === vertex.x && edgeV1.y === vertex.y) || (edgeV2.x === vertex.x && edgeV2.y === vertex.y)) { return true; }
                return geometryHelpers.projectToEdge(vertex, edgeV1, edgeV2).dist <= 1 / geometryHelpers.clipScale();
            });
        if ((points[i].splittingEdge && ~existingFace.edgeRefs.map(e => e.edge_id).indexOf(points[i].splittingEdge.id)) || verticesOnEdge.length) {
            points = geometryHelpers.unionOfFaces(existingFaceVertices, points, currentStoryGeometry);
            break;
        }
    }

    // check if new and existing face intersect
    if (geometryHelpers.intersectionOfFaces(existingFaceVertices, points, currentStoryGeometry)) {
        points = geometryHelpers.unionOfFaces(existingFaceVertices, points, currentStoryGeometry);
    }

    // destroy the existing face and remove references to it
    context.dispatch(target.type === 'space' ? 'models/updateSpaceWithData' : 'models/updateShadingWithData', {
        [target.type]: target,
        face_id: null
    }, { root: true });

    context.dispatch('destroyFaceAndDescendents', {
        geometry: currentStoryGeometry,
        face: existingFace
    });

    return points;
}

/*
* instantiate vertices, edges, and face for the set of points defining the face being created
* handle snapped vertiecs - points with an id property
* and shared edges - edges referencing two vertices with matching ids
* persist vertices and edges to datastore so that validation on the unsaved face can be done, they will be removed from the store if validation fails
*/
function createFaceGeometry (points, currentStoryGeometry, context) {
    // build an array of vertices for the face being created, setting the same ID for points with the same coordinates to prevent overlapping vertices
    const faceVertices = points.map((point) => {
        // if a point was snapped to an existing vertex during drawing, it will have a vertex id
        var vertex = point.id && geometryHelpers.vertexForId(point.id, currentStoryGeometry);
        // reuse the existing vertex or create a new one
        if (!vertex) {
            vertex = new factory.Vertex(point.x, point.y);
            // merge vertices with the same coordinates
            points.filter(p => p !== point && p.x === vertex.x && p.y === vertex.y)
                .forEach((mergePoint) => { mergePoint.id = vertex.id; });

            context.commit('createVertex', {
                vertex: vertex,
                geometry: currentStoryGeometry
            });
        }
        return vertex;
    });

    // build an array of edges for the face based on the set of vertices
    const faceEdges = faceVertices.map((v1, i) => {
        // v2 is the first vertex in the array when the face is being closed
        const v2 = i + 1 < faceVertices.length ? faceVertices[i + 1] : faceVertices[0];
        // check if an edge referencing the two vertices already exists
        var sharedEdge = currentStoryGeometry.edges.find((e) => {
            return (e.v1 === v1.id && e.v2 === v2.id) || (e.v2 === v1.id && e.v1 === v2.id);
        });

        if (sharedEdge) {
            // if a shared edge exists, check if its direction matches the edge direction required for the face being created
            sharedEdge = JSON.parse(JSON.stringify(sharedEdge));
            sharedEdge.reverse = (sharedEdge.v1 !== v1.id);
            return sharedEdge;
        } else {
            // create and store a new edge with the vertices
            const edge = new factory.Edge(v1.id, v2.id);
            context.commit('createEdge', {
                edge: edge,
                geometry: currentStoryGeometry
            });
            return edge;
        }
    });

    // create a new face object with references to the edges
    const face = new factory.Face(faceEdges.map(e => ({
        edge_id: e.id,
        reverse: e.reverse
    })));

    // return these, they will be used during validation
    return face;
}

/*
* Validate the new face against self intersection by checking for:
* folded (duplicate geometry) edges referencing the same two endpoints on the same face
* vertex on the face splitting an edge on the face
* vertex on the face snapped to another vertex on the face
* TODO: prevent crossing edges on the same face
* Save the fave if validation passes, destroy its vertices and edges if validation fails
*/
function validateAndSaveFace (face, currentStoryGeometry, target, context) {
    // vertices and edges on the face being created
    const faceEdges = geometryHelpers.edgesForFace(face, currentStoryGeometry),
        // faceVertices will include a vertex (the startpoint) for every single edge ref on the face,
        // so multiple edges referencing the same vertex will result in duplicate vertices in the array, causing our validation to fail as expected
        faceVertices = geometryHelpers.verticesForFace(face, currentStoryGeometry);

    // validate and save the face
    var validFace = true;
    for (var i = 0; i < faceEdges.length; i++) {
        const edge = faceEdges[i];

        // saved vertices which are touching the edge (excluding the edge's endpoints)
        const splittingVertices = geometryHelpers.verticesOnEdge(edge, currentStoryGeometry)

        // if a vertex on the face touches an edge on the face, then the face is self intersecting and invalid
        for (let j = 0; j < splittingVertices.length; j++) {
            const vertex = splittingVertices[j];
            if (faceVertices.indexOf(vertex) !== -1) {
                validFace = false;
            }
        }

        // if more than one vertex on the face has a single id, the face has snapped to itself and is self intersecting
        for (let j = 0; j < faceVertices.length; j++) {
            const vertex = faceVertices[j];
            if (faceVertices.filter(v => v.id === vertex.id).length >= 2) {
                validFace = false;
            }
        }
    }

    // save the face if it is valid, otherwise destroy the edges and vertices created earlier to prevent an invalid state
    if (validFace) {
        context.commit('createFace', {
            face: face,
            geometry: currentStoryGeometry
        });

        context.dispatch(target.type === 'space' ? 'models/updateSpaceWithData' : 'models/updateShadingWithData', {
            [target.type]: target,
            face_id: face.id
        }, { root: true });
    } else {
        // dispatch destroyFaceAndDescendents to destroy edges and vertices created for the invalid face
        context.dispatch('destroyFaceAndDescendents', {
            geometry: currentStoryGeometry,
            face: face
        });
    }
    return validFace;
}


/*
* loop through all edges on the currentStoryGeometry, checking if there are any vertices touching (splitting) them
* order the splitting vertices based on where they appear on the original edge
* build and store a new set of edges by connecting the ordered splitting vertices
* look up all faces referencing the original edge and replace those references with references to the new edges
* destroy the original edge
*/
function splitEdges (currentStoryGeometry, context) {
    currentStoryGeometry.edges.forEach((edge) => {
        const splittingVertices = geometryHelpers.verticesOnEdge(edge, currentStoryGeometry);

        if (splittingVertices.length) {
            // endpoints of the original edge
            const startpoint = geometryHelpers.vertexForId(edge.v1, currentStoryGeometry),
                endpoint = geometryHelpers.vertexForId(edge.v2, currentStoryGeometry);

            // sort splittingVertices by location on original edge
            splittingVertices.sort((va, vb) => {
                const vaDist = Math.sqrt(
                        Math.pow(Math.abs(va.x - startpoint.x), 2) +
                        Math.pow(Math.abs(va.y - startpoint.y), 2)
                    ),
                    vbDist = Math.sqrt(
                        Math.pow(Math.abs(vb.x - startpoint.x), 2) +
                        Math.pow(Math.abs(vb.y - startpoint.y), 2)
                    );

                // compare distance from vertices to original edge startpoint
                return vaDist > vbDist;
            });

            // add startpoint and endpoint of original edge to splittingVertices array from which new edges will be created
            splittingVertices.unshift(startpoint);
            splittingVertices.push(endpoint);

            // create new edges by connecting the original edge startpoint, ordered splitting vertices, and original edge endpoint
            // eg: startpoint -> SV1, SV1 -> SV2, SV2 -> SV3, SV3 -> endpoint
            const newEdges = [];
            for (var i = 0; i < splittingVertices.length - 1; i++) {
                const newEdgeV1 = splittingVertices[i],
                    newEdgeV2 = splittingVertices[i + 1],
                    newEdge = new factory.Edge(newEdgeV1.id, newEdgeV2.id);

                context.commit('createEdge', {
                    edge: newEdge,
                    geometry: currentStoryGeometry
                });
                newEdges.push(newEdge);
            }

            // look up all faces with a reference to the original edge being split
            const affectedFaces = geometryHelpers.facesForEdge(edge.id, currentStoryGeometry);

            // remove reference to old edge and add references to the new edges
            affectedFaces.forEach((affectedFace) => {
                context.commit('destroyEdgeRef', {
                    edge_id: edge.id,
                    face: affectedFace
                });

                newEdges.forEach((newEdge) => {
                    context.commit('createEdgeRef', {
                        face: affectedFace,
                        edgeRef: {
                            edge_id: newEdge.id,
                            reverse: false
                        }
                    });
                })
            });

            // destroy original edge
            context.dispatch('destroyEdge', {
                geometry: currentStoryGeometry,
                edge_id: edge.id
            });
        }
        connectEdges(currentStoryGeometry, context);
    });
}

/*
* order the edgeRefs on each face on the currentStoryGeometry so that all edges are connected from startpoint to endpoint
* set reverse property on edgeRefs as needed
*/
function connectEdges (currentStoryGeometry, context) {
    currentStoryGeometry.faces.forEach((face) => {
        const faceEdges = geometryHelpers.edgesForFace(face, currentStoryGeometry);

        // initialize ordered edgeRef array with our origin edge
        const connectedEdgeRefs = [];
        var reverse = false;

        // pick an arbitrary edge (edges[0]) and treat its v2 as the endpoint
        // all ordering will assume this edge's v1 as the origin of the face
        var nextEdge = faceEdges[0],
            endpoint = nextEdge.v2;

        while (connectedEdgeRefs.length < faceEdges.length) {
            connectedEdgeRefs.push({
                edge_id: nextEdge.id,
                reverse: reverse
            });
            reverse = false;

            // each vertex must be referenced by exactly two edges, it acts as the endpoint for the first edge and the startpoint for the next
            // look up the next edge by finding the edge on the face referencing the endpoint of the current edge
            nextEdge = faceEdges.find((e) => {
                if (e.id === nextEdge.id) { return; }
                if ((e.v2 === endpoint || e.v1 === endpoint) && e !== faceEdges[0] && ~connectedEdgeRefs.map(eR => eR.edge_id).indexOf(e.id)) {
                    // TODO: sometimes multiple edges reference the same endpoint, causing duplicated in the connectedEdgeRefs array. not sure why this is happening.
                    return false;
                }
                // if the next edge is connected to the endpoint of the current edge by its v2 and not its v1, it is reversed
                if (e.v2 === endpoint) {
                    reverse = true;
                    endpoint = e.v1;
                    return true;
                } else if (e.v1 === endpoint) {
                    endpoint = e.v2;
                    return true;
                }
            });
            if (nextEdge === faceEdges[0]) { break; }
        }

        // update the face with the ordered edge refs
        context.commit('setEdgeRefsForFace', {
            face: face,
            edgeRefs: connectedEdgeRefs
        });
    });
}
