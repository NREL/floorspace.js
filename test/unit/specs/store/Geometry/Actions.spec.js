import { expect } from 'chai'
import { geometry as Geometry } from '../../../../../src/store/modules/geometry/index.js'
import factory from '../../../../../src/store/factory/index.js'
import testAction from '../helpers/testAction.js'

describe('actions', () => {
    it('initGeometry', () => {
        const story = new factory.Story();
        testAction(Geometry.actions.initGeometry, {
            story: story
        }, {}, [{
            type: 'initGeometry',
            testPayload (payload) {
                expect(payload.story).to.equal(story);

                expect(payload.geometry.id).to.be.a('number');
                expect(payload.geometry.vertices).to.be.an('array');
                expect(payload.geometry.edges).to.be.an('array');
                expect(payload.geometry.faces).to.be.an('array');
            }
        }], [])
    });

    it('createFaceFromPoints on a space with no existing face', () => {
        const geometry = new factory.Geometry();
        const space = new factory.Space();
        var context = {
            rootGetters: { 'application/currentStoryGeometry': geometry },
            rootState: {
                application: {
                    currentSelections: { space: space }
                }
            }
        };

        const points = [
            { x: 0, y: 0 },
            { x: 0, y: 50 },
            { x: 50, y: 50 },
            { x: 50, y: 0 }
        ];

        testAction(Geometry.actions.createFaceFromPoints, {
            geometry: geometry,
            space: space,
            points: points
        }, context, [{
            type: 'createFace',
            testPayload (payload) {
                expect(payload.geometry).to.equal(geometry);
                expect(payload.points).to.equal(points);
                expect(payload.space).to.equal(space);
            }
        }], [])
    });

    it('createFaceFromPoints on a space with an existing face', () => {
        const geometry = new factory.Geometry();
        const space = new factory.Space();
        space.face_id = 1;

        var context = {
            rootGetters: { 'application/currentStoryGeometry': geometry },
            rootState: {
                application: {
                    currentSelections: { space: space }
                }
            }
        };

        const points = [
            { x: 0, y: 0 },
            { x: 0, y: 50 },
            { x: 50, y: 50 },
            { x: 50, y: 0 }
        ];

        testAction(Geometry.actions.createFaceFromPoints, {
            geometry: geometry,
            space: space,
            points: points
        }, context, [{
            type: 'createFace',
            testPayload (payload) {
                expect(payload.geometry).to.equal(geometry);
                expect(payload.points).to.equal(points);
                expect(payload.space).to.equal(space);
            }
        }], [{
            type: 'destroyFace',
            testPayload (payload) {
                expect(payload.geometry).to.equal(geometry);
                expect(payload.space).to.equal(space);
            }
        }])
    });
});
