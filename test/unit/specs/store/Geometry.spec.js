import { expect } from 'chai'
import Geometry from '../../../../src/store/modules/geometry/index.js'
import factory from '../../../../src/store/factory/index.js'

describe('mutations', () => {
    it('initGeometry', () => {
        // mock state
        const geometryState = [];
        const payload = {
            geometry: new factory.Geometry(),
            story: {}
        };
        // apply mutation
        Geometry.mutations.initGeometry(geometryState, payload);
        // assert result
        expect(geometryState.length).to.equal(1);
        expect(payload.story.geometry_id).to.equal(payload.geometry.id);
    });
});
