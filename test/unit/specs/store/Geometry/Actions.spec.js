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
        }])
    });

    it('createFaceFromPoints', () => {
        testAction(Geometry.actions.createFaceFromPoints, {}, {}, [{
            type: 'createFace',
            testPayload (payload) { }
        }])
    });
});
