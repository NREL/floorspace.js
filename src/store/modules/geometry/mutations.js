import _ from 'lodash';
    /*
    * create a new geometry set, face, edge, or vertex in the data store
    */
export function initGeometry(state, payload) {
      const { geometry } = payload;
      state.push(geometry);
}
export function createVertex(state, payload) {
      const { geometry_id, vertex } = payload;
      state.find(g => g.id === geometry_id).vertices.push(vertex);
}
export function createEdge(state, payload) {
      const { geometry_id, edge } = payload;
      state.find(g => g.id === geometry_id).edges.push(edge);
}
export function createFace(state, payload) {
      const { geometry_id, face } = payload;
      state.find(g => g.id === geometry_id).faces.push(face);
}

    /*
    * removes an object with a given id from the datastore
    * the object can be a geometry set, face, edge, or vertex
    */
export function destroyGeometry(state, payload) {
        // id of the object to be destroyed
        const { id } = payload;

        // loop through all geometry sets in the store and check if they contain the object
        // break from the loop if the object is found
        for (var i = 0; i < state.length; i++) {
            const g = state[i];
            if (g.id === id) {
                state.splice(state.findIndex(g => g.id === id), 1);
                break;
            } else if (~g.faces.map(f => f.id).indexOf(id)) {
                g.faces.splice(g.faces.findIndex(f => f.id === id), 1);
                break;
            } else if (~g.edges.map(e => e.id).indexOf(id)) {
                g.edges.splice(g.edges.findIndex(e => e.id === id), 1);
                break;
            } else if (~g.vertices.map(v => v.id).indexOf(id)) {
                g.vertices.splice(g.vertices.findIndex(v => v.id === id), 1);
                break;
            }
        }
}

    // set a reference to an edge on a face
export function createEdgeRef(state, payload) {
        const { geometry_id, face_id, edgeRef } = payload,
            geometry = state.find(g => g.id === geometry_id),
            face = geometry.faces.find(f => f.id === face_id),
            edge = geometry.edges.find(e => e.id === edgeRef.edge_id);

        if (edge) { face.edgeRefs.push(edgeRef); }
}

    // set the array of edgeRefs on a face
export function setEdgeRefsForFace(state, payload) {
        const { geometry_id, face_id, edgeRefs } = payload,
            geometry = state.find(g => g.id === geometry_id),
            face = geometry.faces.find(f => f.id === face_id);
        face.edgeRefs = edgeRefs.filter(ref => geometry.edges.find(e => e.id === ref.edge_id));
}

    // remove a reference to an edge from a face
export function destroyEdgeRef(state, payload) {
        const { geometry_id, face_id, edge_id } = payload,
            geometry = state.find(g => g.id === geometry_id),
            face = geometry.faces.find(f => f.id === face_id);
        face.edgeRefs.splice(face.edgeRefs.findIndex(eR => eR.edge_id === edge_id), 1);
}

export function replaceEdgeRef(state, payload) {
  const
    { geometry_id, face_id, edge_id, newEdges } = payload,
    geometry = state.find(g => g.id === geometry_id),
    face = geometry.faces.find(f => f.id === face_id),
    edgeRefIx = _.findIndex(face.edgeRefs, { edge_id }),
    edgeRef = face.edgeRefs[edgeRefIx];

  face.edgeRefs.splice(
    edgeRefIx, 1, // remove existing edge
    // replacing it with these ones, in the same direction.
    ...newEdges.map(newEdgeId => ({
      edge_id: newEdgeId,
      reverse: edgeRef.reverse,
    })),
  );
}

export function splitEdge(state, { geometry_id, edgeToDelete, newEdges, replaceEdgeRefs }) {
  newEdges.forEach(edge => createEdge(state, { edge, geometry_id }));
  replaceEdgeRefs.forEach(replacement => replaceEdgeRef(state, replacement));
  destroyGeometry(state, { id: edgeToDelete });
}

function ensureVertsExist(geometry, verts) {
  verts.forEach((v) => {
    _.find(geometry.vertices, { id: v.id }) || geometry.vertices.push(v);
  });
}

function ensureEdgesExist(geometry, edges) {
  edges.forEach((e) => {
    _.find(geometry.edges, { id: e.id }) || geometry.edges.push(e);
  });
}

export function replaceFacePoints(state, { geometry_id, verts, edges, face: { id: face_id } }) {
  const geometry = _.find(state, { id: geometry_id });
  ensureVertsExist(geometry, verts);
  ensureEdgesExist(geometry, edges);
  const face = _.find(geometry.faces, { id: face_id });
  face.edgeRefs = edges.map(e => ({
    edge_id: e.id,
    reverse: !!e.reverse,
  }));
}
