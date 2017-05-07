import { expect } from 'chai'
import Geometry from 'src/store/modules/geometry'
import helpers from 'src/store/modules/geometry/helpers'
import geometryFactory from 'src/store/modules/geometry/factory'
import modelFactory from 'src/store/modules/models/factory'

describe('geometry mutations', () => {
    var geometryState, geometry, story;

    beforeEach(() => {
        geometryState = [];
        geometry = new geometryFactory.Geometry();
        story = new modelFactory.Story();

        Geometry.mutations.initGeometry(geometryState, {
            geometry,
            story
        });
    });
    
    it('initGeometry', () => {
        expect(geometry.id).to.exist;
        expect(geometry.vertices).to.be.an('array');
        expect(geometry.edges).to.be.an('array');
        expect(geometry.faces).to.be.an('array');

        // check that geometry was created and saved
        expect(geometryState).to.have.lengthOf(1);
        expect(geometry.vertices).to.have.lengthOf(0);
        expect(geometry.edges).to.have.lengthOf(0);
        expect(geometry.faces).to.have.lengthOf(0);

        // check that the story has a reference to the new geometry
        expect(story.geometry_id).to.equal(geometry.id);
    });

    describe('edge/edgeRefs', () => {
        var face, edge;

        beforeEach(() => {
            edge = new geometryFactory.Edge();
            face = new geometryFactory.Face();
            
            Geometry.mutations.setEdgeRefsForFace(geometryState, {
                face,
                edgeRefs: []
            });
        });

        it('setEdgeRefsForFace', () => {
            expect(face.edgeRefs).to.exist;
            expect(face.edgeRefs).to.have.lengthOf(0);
        });

        describe('edgeRef', () => {
            beforeEach(() => {
                Geometry.mutations.createEdgeRef(geometryState, {
                    face,
                    edgeRef: {
                        edge_id: edge.id,
                        reverse: false
                    }
                });
            })

            it('createEdgeRef', () => {
                expect(face.edgeRefs).to.have.lengthOf(1);
                expect(face.edgeRefs[0].edge_id).to.equal(edge.id);
            });

            it('destroyEdgeRef', () => {
                geometryState[0].faces = [face];
                Geometry.mutations.destroyEdgeRef(geometryState, {
                    face,
                    edge_id: edge.id
                });

                expect(face.edgeRefs.length).to.equal(0);
            });
        });

        describe('edge', () => {
            beforeEach(() => {
                Geometry.mutations.createEdge(geometryState, {
                    geometry,
                    edge
                });
            });

            it('createEdge', () => {
                expect(geometry.edges.length).to.equal(1);
            });

            it('destroyEdge', () => {
                Geometry.mutations.destroyEdge(geometryState, {
                    geometry,
                    edge_id: edge.id
                });

                expect(geometry.edges.length).to.equal(0);
            });

            it('destroyEdgeRef', () => {

            });
        });
    });

    describe('vertex', () => {
        var vertex;

        beforeEach(() => {
            vertex = new geometryFactory.Vertex();

            Geometry.mutations.createVertex(geometryState, {
                geometry,
                vertex
            });
        });

        it('createVertex', () => {
            expect(geometry.vertices.length).to.equal(1);
        });

        it('destroyVertex', () => {
            Geometry.mutations.destroyVertex(geometryState, {
                geometry,
                vertex_id: vertex.id
            });

            expect(geometry.vertices.length).to.equal(0);
        });
    });

    describe('face', () => {
        var face;

        beforeEach(() => {
            face = new geometryFactory.Face();

            Geometry.mutations.createFace(geometryState, {
                geometry,
                face
            });
        });

        it('createFace', () => {
            expect(geometry.faces.length).to.equal(1);
            expect(geometry.faces[0].id).to.equal(face.id);
        });

        it('destroyFace', () => {
            Geometry.mutations.destroyFace(geometryState, {
                geometry
            });

            expect(geometry.faces.length).to.equal(0);
        });
    });
});