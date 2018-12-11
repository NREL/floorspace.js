import _ from 'lodash';
    /*
    * create a new geometry set, face, edge, or vertex in the data store
    */

export function trimGeometry(state, { geometry_id, vertsReferencedElsewhere }) {
  const
    geometry = _.find(state, { id: geometry_id }),
    edgesInUse = new Set(_.flatMap(geometry.faces, f => _.map(f.edgeRefs, 'edge_id'))),
    vertsOnEdges = _.flatMap(
      geometry.edges.filter(e => edgesInUse.has(e.id)),
      e => [e.v1, e.v2]),
    verticesInUse = new Set([
      ...(vertsReferencedElsewhere || []),
      ...vertsOnEdges,
    ]);
  const newEdges = geometry.edges.filter(e => edgesInUse.has(e.id));
  const newVerts = geometry.vertices.filter(v => verticesInUse.has(v.id));
  const missingEdges = _.difference([...edgesInUse], _.map(newEdges, 'id'));
  if (missingEdges.length) {
    console.error('An edge is referenced by a face, but does not exist!', JSON.stringify(geometry));
  }
  const missingVerts = _.difference(vertsOnEdges, _.map(newVerts, 'id'));
  if (missingVerts.length) {
    console.error('A vertex is referenced by a face, but does not exist!', JSON.stringify(geometry));
  }
  geometry.vertices = newVerts;
  geometry.edges = newEdges;
}

export function initGeometry(state, payload) {
      const { geometry } = payload;
      state.push(geometry);
}

export function createVertex(state, payload) {
      const { geometry_id, vertex } = payload;
      state.find(g => g.id === geometry_id).vertices.push(vertex);
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
                // may not be necessary... this was done before i really knew what was going on. 
                g.faces.forEach((face) => {
                  face.edgeRefs.forEach((edgeRef) => {
                    if (id === edgeRef.edge_id) {
                      face.edgeRefs.splice(face.edgeRefs.findIndex(r => r.edge_id === id), 1);
                    }
                  });
                });
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
    edgeRefIx = _.findIndex(face.edgeRefs, { edge_id });
  face.edgeRefs.splice(
    edgeRefIx, 1, // remove existing edge
    // replacing it with these ones, in the same direction.
    ...newEdges.map(({ id: newEdgeId, reverse }) => ({
      edge_id: newEdgeId,
      reverse,
    })),
  );
}


export function ensureVertsExist(state, { geometry_id, vertices }) {
  const geometry = _.find(state, { id: geometry_id });
  vertices.forEach(v =>
    _.find(geometry.vertices, { id: v.id }) || geometry.vertices.push(v)
  );
}

export function ensureEdgesExist(state, { geometry_id, edges }) {
  const geometry = _.find(state, { id: geometry_id });
  edges.forEach(e =>
    _.find(geometry.edges, { id: e.id }) || geometry.edges.push(e)
  );
}

export function splitEdge(state, { geometry_id, edgeToDelete, newEdges, replaceEdgeRefs }) {
  ensureEdgesExist(state, { geometry_id, edges: newEdges });
  replaceEdgeRefs.forEach(replacement => replaceEdgeRef(state, replacement));
  destroyGeometry(state, { id: edgeToDelete });
}

export function replaceFacePoints(state, { geometry_id, vertices, edges, face_id }) {
  const geometry = _.find(state, { id: geometry_id });
  ensureVertsExist(state, { geometry_id, vertices });
  ensureEdgesExist(state, { geometry_id, edges });

  let face = _.find(geometry.faces, { id: face_id });
  if (!face) {
    face = { id: face_id, edgeRefs: [] };
    geometry.faces.push(face);
  }

  face.edgeRefs = edges.map(e => ({
    edge_id: e.id,
    reverse: !!e.reverse,
  }));
}
