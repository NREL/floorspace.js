import _ from 'lodash';
import { getOrCreateVertex } from '../../../../src/store/modules/geometry/actions/actions';
import { matchOrCreateEdges } from '../../../../src/store/modules/geometry/actions/createFaceFromPoints';
import { assert, assertEqual } from '../../test_helpers';

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


describe('matchOrCreateEdges', () => {
  const existingEdges = [{ id: 1, v1: 2, v2: 3 }, { id: 4, v1: 5, v2: 6 }];
  it('can handle an empty list', () => {
    const edges = matchOrCreateEdges([], existingEdges);
    assertEqual(edges, []);
  });
});
