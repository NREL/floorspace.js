// OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
// (1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
// (2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
// (3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
// (4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import factory from './../utils/factory'
import store from './../index'

export default {
    /*
    * Create a new face associated with the currentSpace
    */
    createFaceFromPoints: function(state, payload) {
        const geometry = store.getters.currentStoryGeometry;
        const space = store.getters.currentSpace;

        // if the space already had an associated face, destroy it
        // TODO: the logic required to delete a face is complex, store it in a method somewhere
        if (space.face_id) {
            const oldFace = geometry.faces.find((f) => {
                return f.id === space.face_id;
            });

            // destroy edges belonging to the face unless they are referenced by another face
            var isShared;
            oldFace.edges.forEach((edgeRef) => {
                isShared = false;
                geometry.faces.forEach((f) => {
                    // only test other faces for reference to the edge
                    if (oldFace === f) { return; }
                    isShared = f.edges.find((e) => {
                        return e.edge_id === edgeRef.edge_id;
                    }) || isShared;
                });

                // edge is not shared with another face, destroy it and its vertices unless they are shared with edges on other faces
                if (!isShared) {
                    
                    var p1Shared = false,
                        p2Shared = false;

                    const oldEdge = geometry.edges.find((e) => {
                        return e.id === edgeRef.edge_id;
                    });

                    // loop through each edge reference on each face
                    geometry.faces.forEach((f) => {
                        // only test other faces for reference to the vertex
                        if (oldFace === f) { return; }

                        // lookup the edge object for each edge reference
                        f.edges.forEach((eR) => {
                            const e = geometry.edges.find((e) => {
                                return e.id === edgeRef.edge_id;
                            });
                            p1Shared = (e.p1 === oldEdge.p1 || e.p2 === oldEdge.p1) ? true : p1Shared;
                            p1Shared = (e.p1 === oldEdge.p2 || e.p2 === oldEdge.p2) ? true : p1Shared;
                        });
                    });
                    if (!p1Shared) {
                        geometry.vertices.splice(geometry.vertices.findIndex((v) => {
                            return v.id === oldEdge.p1;
                        }), 1);
                    }
                    if (!p2Shared) {
                        geometry.vertices.splice(geometry.vertices.findIndex((v) => {
                            return v.id === oldEdge.p2;
                        }), 1);
                    }

                    // destroy the edge
                    geometry.edges.splice(geometry.edges.findIndex((e) => {
                        return e.id === space.face_id;
                    }), 1);
                }
            });

            geometry.faces.splice(geometry.faces.findIndex((f) => {
                return f.id === space.face_id;
            }), 1);
        }

        // build arrays of the vertices and edges associated with the face being created
        var faceVertices = [],
            faceEdges = [];

        payload.points.forEach((p, i) => {
            const vertex = new factory.Vertex(p.x, p.y);
            geometry.vertices.push(vertex);
            faceVertices.push(vertex);
        });

        faceVertices.forEach((v, i) => {
            const v2 = faceVertices.length > i + 1 ? faceVertices[i + 1] : faceVertices[0];
            const edge = new factory.Edge(v.id, v2.id);
            geometry.edges.push(edge);
            faceEdges.push(edge);
        });

        const edgeRefs = faceEdges.map((e, i) => {
            return {
                edge_id: e.id,
                reverse: false // TODO: implement a check for existing edges using the same vertices
            };
        });
        const face = new factory.Face(edgeRefs);
        geometry.faces.push(face);
        space.face_id = face.id;
    }
};
