import _ from 'lodash';
import { getOrCreateVertex } from '../../../../src/store/modules/geometry/actions/actions';
import { assert } from '../../test_helpers';

describe('getOrCreateVertex', () => {
  const geometry = {
    vertices: [{ id: 'already_extant', x: 12.34, y: 8.75 }],
  };
  it('will get a vertex if one exists', () => {
    const vert = getOrCreateVertex(geometry, { x: 12.34, y: 8.75 });
    assert(vert.id === 'already_extant');
  });

  it('will create a new vertex if necessary', () => {
    const newVert = getOrCreateVertex(geometry, { x: 1, y: 1 });
    assert(newVert.id !== 'already_extant');
  });
});
