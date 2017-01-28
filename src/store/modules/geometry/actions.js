import factory from './factory.js'
import helpers from './helpers'

export default {
    // initialize a new geometry object for a story
    initGeometry (context, payload) {
        // create the geometry object
        payload.geometry = new factory.Geometry();
        context.commit('initGeometry', payload);
    },

    createFaceFromPoints (context, payload) {
        // geometry and space for the current story
        const geometry = context.rootGetters['application/currentStoryGeometry'];
        const space = context.rootState.application.currentSelections.space;

        // if the space already had an associated face, destroy it
        if (space.face_id) {
            context.dispatch('destroyFace', {
                'geometry': geometry,
                'space': space
            });
        }

        // create the new face
        context.commit('createFace', {
            ...payload,
            'geometry': geometry,
            'space': space
        });

        // split any edges that the new face shares with existing faces
        payload.points.forEach((p, i) => {
            // when a point is snapped to an edge, this property will be set on the point
            if (p.splittingEdge) {
                context.dispatch('splitEdge', {
                    // the vertex that was created where the edge will be split
                    vertex: geometry.vertices.find((v) => { return v.x === p.x && v.y === p.y; }),
                    edge: p.splittingEdge
                });
            }
        });
    },
    splitEdge (context, payload) {
        const geometry = context.rootGetters['application/currentStoryGeometry'];

        // TODO: figure out reverse/order logic
        // convert the splitting edge into two new edges
        var edge1, edge2;
        // splittingEdge.v1 -> midpoint
        edge1 = geometry.edges.find((e) => {
            return e.v1 === payload.edge.v1 && e.v2 === payload.vertex.id ||
                e.v2 === payload.edge.v1 && e.v1 === payload.vertex.id;
        });
        if (!edge1) {
            edge1 = new factory.Edge();
            edge1.v1 = payload.edge.v1;
            edge1.v2 = payload.vertex.id;
            context.commit('createEdge', {
                geometry: geometry,
                edge: edge1
            });
        }
        // midpoint -> splittingEdge.v2
        edge2 = geometry.edges.find((e) => {
            return e.v1 === payload.edge.v2 && e.v2 === payload.vertex.id ||
                e.v2 === payload.edge.v2 && e.v1 === payload.vertex.id;
        });
        if (!edge2) {
            edge2 = new factory.Edge();
            edge2.v1 = payload.vertex.id;
            edge2.v2 = payload.edge.v2;
            context.commit('createEdge', {
                geometry: geometry,
                edge: edge2
            });
        }

        // look up faces referencing the edge being split
        const affectedFaces = helpers.facesForEdge(payload.edge.id, geometry);

        affectedFaces.forEach((face) => {
            context.commit('createEdgeRef', {
                face: face,
                edgeRef: {
                    edge_id: edge1.id,
                    reverse: false
                }
            });
            context.commit('createEdgeRef', {
                face: face,
                edgeRef: {
                    edge_id: edge2.id,
                    reverse: false
                }
            });
        });

        // if the face which was originally snapped to still exists, normalize its edges
        if (affectedFaces[0]) {
            context.commit('sortEdgesByPolarAngle', {
                face: affectedFaces[0],
                geometry: geometry
            });
        }
        // remove references to the edge being split
        context.commit('destroyEdge', {
            geometry: geometry,
            edge_id: payload.edge.id
        });
    },

    destroyFace (context, payload) {
        const geometry = payload.geometry;
        const space = payload.space;
        const expFace = geometry.faces.find((face) => { return face.id === space.face_id; })

        // delete associated vertices
        // filter edges referenced by only the face being destroyed so that no shared edges are destroyed
        var expVertices = helpers.verticesforFace(expFace, geometry).filter((vertex) => {
            return helpers.facesForVertex(vertex.id, geometry).length === 1;
        });

        expVertices.forEach((vertex) => {
            context.commit('destroyVertex', {
                geometry: geometry,
                vertex_id: vertex.id
            });
        });

        // delete associated edges
        var expEdgeRefs = expFace.edgeRefs;
        // filter edges referenced by only the face being destroyed so that no shared edges are destroyed
        expEdgeRefs = expEdgeRefs.filter((edgeRef) => {
            return helpers.facesForEdge(edgeRef.edge_id, geometry).length === 1;
        });

        expEdgeRefs.forEach((edgeRef) => {
            context.commit('destroyEdge', {
                geometry: geometry,
                edge_id: edgeRef.edge_id
            });
        });

        context.commit('destroyFace', {
            geometry: geometry,
            space: space,
            face_id: expFace.id
        });
    }
}
