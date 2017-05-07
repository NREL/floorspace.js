import { expect } from 'chai'
import Geometry from 'src/store/modules/geometry'

import helpers from 'src/store/modules/geometry/helpers'
import geometryFactory from 'src/store/modules/geometry/factory'
import modelFactory from 'src/store/modules/models/factory'
import { Context, testAction, testFunction, parsePoints } from '../../helpers'
import * as CreateFaceFromPoints from 'src/store/modules/geometry/actions/createFaceFromPoints'

export default function () {
    var context, story, space, geometry, vertices, edges, edgeRefs, face;

    const points = [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 1, y: 2 }
    ];
    const pointOnEdge = { x: 1.5, y: 1};

    beforeEach(() => {
        context = new Context('geometry');
        story = context._getCurrentStory();
        space = context._getCurrentSpace();
        geometry = context._getCurrentGeometry();

        ({ vertices, edges, face } = parsePoints(points));

        space.face_id = face.id;
        geometry.vertices = vertices;
        geometry.edges = edges;
        geometry.faces.push(face);
    });
    
    // it('createFaceFromPoints', (done) => {
    //     testAction(context, 'geometry', 'createFaceFromPoints', { points, space }, [], [], done);
    // });

    describe('mergeWithExistingFace', () => {
        var target;

        const pointsOverlap = [
            // shares edge with points
            { x: 2, y: 1 },
            { x: 3, y: 1 },
            { x: 3, y: 2 },
            { x: 2, y: 2 }
        ];

        const pointsNoOverlap = [
            // does not overlap or shared edges with points
            { x: 4, y: 4 },
            { x: 5, y: 4 },
            { x: 5, y: 5 },
            { x: 4, y: 5 }
        ];

        beforeEach(() => {
            target = {
                ...space,
                type: 'space'
            };
        })

        // it('merges if overlap', (done) => {
        //     testFunction(context, 'geometry', CreateFaceFromPoints.mergeWithExistingFace, [pointsOverlap, geometry, target, context], [], [
        //             // actions
        //             {
        //                 type: 'models/updateSpaceWithData',
        //                 paylaod: {
        //                     space: target,
        //                     face_id: null
        //                 }
        //             },
        //             {
        //                 type: 'destroyFaceAndDescendents',
        //                 payload: {
        //                     geometry,
        //                     face
        //                 }

        //             }
        //         ], (ret) => {
        //             expect(ret).to.have.lengthOf(points.length);
        //             done();
        //         });
        // });

        it('doesn\'t merge if no overlap', (done) => {
            testFunction(context, 'geometry', CreateFaceFromPoints.mergeWithExistingFace, [pointsNoOverlap, geometry, target, context], [], [
                    // actions
                    {
                        type: 'models/updateSpaceWithData',
                        paylaod: {
                            space: target,
                            face_id: null
                        }
                    },
                    {
                        type: 'destroyFaceAndDescendents',
                        payload: {
                            geometry,
                            face
                        }

                    }
                ], (ret) => {
                    expect(ret).to.have.lengthOf(pointsNoOverlap.length);
                    expect(ret).to.include.members(pointsNoOverlap);
                    done();
                }); 
        });
    });

    describe('createFaceGeometry', () => {
        it('creates geometry with raw points', (done) => {
            testFunction(context, 'geometry', CreateFaceFromPoints.createFaceGeometry, [points, geometry, context], [
                    ...(points.map(point => ({
                        type: 'createVertex'
                    }))),
                    ...(points.map(point => ({
                        type: 'createEdge'
                    })))
                ], [], (ret) => {
                    expect(ret).to.not.be.empty;
                    expect(ret.id).to.exist;
                    expect(ret.edgeRefs).to.have.lengthOf(points.length);
                    done();
                });
        });

        it('creates geometry with snapped points (existing vertices)', (done) => {
            const { edges: snappedEdges, vertices: snappedVertices } = parsePoints(points);

            geometry.vertices.push(...snappedVertices);
            geometry.edges.push(...snappedEdges);

            testFunction(context, 'geometry', CreateFaceFromPoints.createFaceGeometry, [snappedVertices, geometry, context], [], [], (ret) => {
                    expect(ret).to.not.be.empty;
                    expect(ret.id).to.exist;
                    expect(ret.edgeRefs).to.have.lengthOf(snappedVertices.length);
                    done();
                });
        });
    });

    describe('validateAndSaveFace', () => {
        var target;

        beforeEach(() => {
            target = {
                ...space,
                type: 'space'
            };
        });

        it('saves face if valid', (done) => {
            testFunction(context, 'geometry', CreateFaceFromPoints.validateAndSaveFace, [face, geometry, target, context], [
                    {
                        type: 'createFace',
                        payload: {
                            face,
                            geometry
                        }
                    }
                ],
                [
                    {
                        type: 'models/updateSpaceWithData',
                        payload: {
                            space: target,
                            face_id: face.id
                        }
                    }
                ], (ret) => {
                    expect(ret).to.be.true;
                    done();
                });
        });

        it('destroys face if invalid', (done) => {
            const invalidPoints = [...points, pointOnEdge]; // add invalid point (on edge, not endpoint)
            const {face: invalidFace, edges: invalidEdges, vertices: invalidVertices } = parsePoints(invalidPoints);

            geometry.vertices.push(...invalidVertices);
            geometry.edges.push(...invalidEdges);
            geometry.faces.push(...invalidFace);

            testFunction(context, 'geometry', CreateFaceFromPoints.validateAndSaveFace, [invalidFace, geometry, target, context], [], [
                    {
                        type: 'destroyFaceAndDescendents',
                        payload: {
                            geometry,
                            face
                        }
                    }
                ], done);
        });
    });

    describe('splitEdges', () => {
        it('doesn\'t split if if not needed', (done) => {
            testFunction(context, 'geometry', CreateFaceFromPoints.splitEdges, [geometry, context], [
                    ...(edges.map(edge => ({
                        type: 'setEdgeRefsForFace',
                        payload(mutationPayload) {
                            expect(mutationPayload.face).to.equal(face);
                            expect(mutationPayload.edgeRefs).to.have.lengthOf(edges.length);   
                        }
                    }))),
                ],[], done);
        });

        it('splits edge at intersecting vertex', (done) => {
            const v1 = vertices[0]; // 1,1
            const v2 = vertices[1]; // 2,1
            const v3 = new geometryFactory.Vertex(pointOnEdge.x, pointOnEdge.y); // on edge b/n v1 and v2
            const edge = edges.find(e => ((e.v1 === v1.id && e.v2 === v2.id) || (e.v1 === v2.id && e.v2 === v1.id)));
            const numEdgesIn = edges.length;

            const testCreateEdge = function (mutationPayload) {
                expect(mutationPayload.geometry).to.equal(geometry);

                if (mutationPayload.edge.v1 === v3.id) {
                    expect(mutationPayload.edge.v2).to.be.oneOf([v1.id,v2.id])
                } else {
                    expect(mutationPayload.edge.v1).to.be.oneOf([v1.id,v2.id])
                    expect(mutationPayload.edge.v2).to.equal(v3.id);
                }
            };

            const testCreateRef = function (mutationPayload) {
                expect(mutationPayload.face).to.equal(face);
                expect(mutationPayload.edgeRef.edge_id).to.exist;
                expect(mutationPayload.edgeRef.reverse).to.be.false;
            };

            // check init, just in case
            expect(v1).to.exist;
            expect(v2).to.exist;
            expect(edge).to.exist;

            geometry.vertices.push(v3);

            testFunction(context, 'geometry', CreateFaceFromPoints.splitEdges, [geometry, context], [
                {
                    type: 'createEdge',
                    payload: testCreateEdge
                },
                {
                    type: 'createEdge',
                    payload: testCreateEdge
                },
                {
                    type: 'destroyEdgeRef',
                    payload: {
                        edge_id: edge.id,
                        face: face
                    }
                },
                {
                    type: 'createEdgeRef',
                    payload: testCreateRef
                },
                {
                    type: 'createEdgeRef',
                    payload: testCreateRef
                },
                ...(edges.map(edge => ({
                    type: 'setEdgeRefsForFace',
                    payload(mutationPayload) {
                        expect(mutationPayload.face).to.equal(face);
                        expect(mutationPayload.edgeRefs).to.have.lengthOf(numEdgesIn + 1);   
                    }
                })))
            ],
            [
                {
                    type: 'destroyEdge',
                    payload: {
                        geometry,
                        edge_id: edge.id
                    }
                }
            ], done);
        });
    });

    describe('connectEdges', () => {
        it('orders points and connects edges', (done) => {
            const unorderedPoints = [
                { x: 1, y: 1 },
                { x: 2, y: 2 },
                { x: 1, y: 2 },
                { x: 2, y: 1 }
            ];

            const data = parsePoints(unorderedPoints);

            space.face_id = data.face.id;
            geometry.vertices = data.vertices;
            geometry.edges = data.edges;
            geometry.faces = [data.face];

            testFunction(context, 'geometry', CreateFaceFromPoints.connectEdges, [geometry, context], [
                    {
                        type: 'setEdgeRefsForFace',
                        payload(mutationPayload) {
                            expect(mutationPayload.face).to.equal(data.face);
                            expect(mutationPayload.edgeRefs).to.have.lengthOf(face.edgeRefs.length);
                        }
                    }
                ],[], done);
        });
    });
};