import { expect } from 'chai'
import Geometry from 'src/store/modules/geometry'
import geometryFactory from 'src/store/modules/geometry/factory'
import modelFactory from 'src/store/modules/models/factory'

import { Context, testAction, parsePoints } from '../helpers'
import helpers from 'src/store/modules/geometry/helpers'

// specs
import createFaceFromPointsSpec from './Actions/createFaceFromPoints.spec.js'

describe('geometry actions', (done) => {
    var context, geometry, story, space, vertices, edges, edgeRefs, face;

    const poly1 = [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 1, y: 2 }
    ];

    // does not overlap poly1
    const poly2 = [
        { x: 4, y: 4 },
        { x: 5, y: 4 },
        { x: 4, y: 5 },
        { x: 1, y: 5 }
    ];

    // overlaps poly1
    const poly3 = [
        { x: 0, y: 0 },
        { x: 1.5, y: 0 },
        { x: 1.5, y: 1.5 },
        { x: 0, y: 1.5 }
    ];

    beforeEach(() => {
        context = new Context('geometry');

        geometry = context.rootState.geometry[0];
        story = context.rootState.models.stories[0];
        space = story.spaces[0];

        ({ vertices, edges, edgeRefs, face } = parsePoints(poly1));

        space.face_id = face.id;
        geometry.vertices = vertices;
        geometry.edges = edges;
        geometry.faces.push(face);
    });

    it('initGeometry', (done) => {
        testAction(context, 'geometry', 'initGeometry', { story }, [
            {
                type: 'initGeometry',
                payload: function (payload) {
                    expect(payload.story).to.equal(story);
                }
            }
        ], [], done);
    });

    describe('eraseSelection', () => {
        it ('does nothing if less than 3 points are provided', (done) => {
            testAction(context, 'geometry', 'eraseSelection', { points: [] }, [], [], done);
        });

        it('does nothing if new points don\'t overlap', (done) => {
            testAction(context, 'geometry', 'eraseSelection', { points: poly2 }, [], [], done);
        });

        it ('merges with existing face if overlap', (done) => {
            const expectedActions = [{
                    type: 'models/updateSpaceWithData',
                    payload: {
                        space,
                        face_id: null
                    }
                },
                {
                    type: 'destroyFaceAndDescendents',
                    payload: {
                        geometry,
                        face
                    } 
                }];

            // // full overlap (identical points)
            // testAction(context, 'geometry', 'eraseSelection', { points: poly1 }, [], expectedActions);

            // expect additional mutation if points are different from existing face
            testAction(context, 'geometry', 'eraseSelection', { points: poly3 }, [], [
                ...expectedActions,
                {
                    type: 'createFaceFromPoints',
                    payload(actionPayload) {
                        expect(actionPayload.space).to.equal(space);
                        expect(actionPayload.geometry).to.equal(geometry);
                        expect(actionPayload.points).to.not.be.empty;
                    }
                }
            ], done);
        });
    });

    it('splitEdge', () => {
        const edge = edges[0];
        const edgeVertex1 = vertices.find(v => v.id === edge.v1);
        const edgeVertex2 = vertices.find(v => v.id === edge.v2);

        testAction(context, 'geometry', 'splitEdge', { vertex: edgeVertex1, edge }, [
            // mutations
            {
                type: 'createEdge',
                payload(actionPayload) {
                    expect(actionPayload.geometry).to.equal(geometry);
                    expect(actionPayload.edge.id).to.exist;
                }
            },
            {
                type: 'createEdgeRef',
            },
            {
                type: 'createEdgeRef'
            },
            {
                type: 'destroyEdgeRef'
            }
        ],
        [
            // actions
            {
                type: 'destroyEdge'
            }
        ], done);
    });

    describe('destroyFace', () => {
        const testDestroyFace = function() {
            const payload = {
                geometry,
                face_id: face.id
            };

            testAction(context, 'geometry', 'destroyFace', payload, [
                {
                    type: 'destroyFace',
                    payload
                }
            ], []);
        };

        it('throws an error when destroying a face referenced by a space', () => {
            expect(testDestroyFace).to.throw(Error);
        });

        it('destroys a face not referenced by any spaces', () => {
            // remove face from space --> no error
            space.face_id = null;
            expect(testDestroyFace).to.not.throw(Error);
        });
    });

    describe('destroyVertex', () => {
        const testDestroyVertex = function (vertex_id) {
            const payload = {
                geometry,
                vertex_id
            };

            return testAction.bind(null, context, 'geometry', 'destroyVertex', payload, [
                {
                    type: 'destroyVertex',
                    payload
                }
            ], []);
        };

        it('throws an error when destroying a vertex referenced by an edge', () => {
            // vertex assigned to edge --> should throw error when attempting to destroy
            expect(testDestroyVertex(vertices[0].id)).to.throw(Error);
        });

        it('destroys a vertex not referenced by any edges', () => {
            // create orphan vertex --> no error
            const orphanVertex = new geometryFactory.Vertex();
            geometry.vertices.push(orphanVertex);

            expect(testDestroyVertex(orphanVertex.id)).to.not.throw(Error);
        });
    });

    describe('destroyEdge', () => {
        const testDestroyEdge = function (edge_id) {
            const payload = {
                geometry,
                edge_id
            };

            return testAction.bind(null, context, 'geometry', 'destroyEdge', payload, [
                {
                    type: 'destroyEdge',
                    payload
                }
            ], []);
        };

        it('throws an error when destroying an edge referenced by a face', () => {
            expect(testDestroyEdge(edges[0].id)).to.throw(Error);
        });

        it('destroys an edge not referenced by any faces', () => {
            const orphanEdge = new geometryFactory.Edge();
            geometry.edges.push(orphanEdge);

            expect(testDestroyEdge(orphanEdge.id)).to.not.throw(Error);
        });
    });

    describe('destroyFaceAndDescendents', () => {
        var expectedActions;

        beforeEach(() => {
            expectedActions = [
                {
                    type: 'destroyFace',
                    payload: {
                        geometry,
                        face_id: face.id
                    }
                },
            ];
        });

        it ('destroys face and its edges and vertices', (done) => {  
            const edgeIds = edges.map(edge => edge.id);
            const vertexIds = vertices.map(vertex => vertex.id);
            
            for (let i=edges.length; i--; ) {
                expectedActions.push({
                    type: 'destroyEdge',
                    payload(actionPayload) {
                        expect(actionPayload.geometry).to.equal(geometry);
                        expect(actionPayload.edge_id).to.be.oneOf(edgeIds);
                    }
                })
            }

            for (let i=edges.length; i--; ) {
                expectedActions.push({
                    type: 'destroyVertex',
                    payload(actionPayload) {
                        expect(actionPayload.geometry).to.equal(geometry);
                        expect(actionPayload.vertex_id).to.be.oneOf(vertexIds);
                    }
                })
            }

            testAction(context, 'geometry', 'destroyFaceAndDescendents', { geometry, face }, [], expectedActions, done);
        });

        it ('destroys face without edges or vertices', (done) => {
            const newFace = geometryFactory.Face([]);
            testAction(context, 'geometry', 'destroyFaceAndDescendents', { geometry, face: newFace }, [], expectedActions, done);
        })
    });
    
    describe('createFaceFromPoints', createFaceFromPointsSpec);
});