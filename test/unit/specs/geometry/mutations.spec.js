import _ from 'lodash';
import { assert, assertEqual } from '../../test_helpers';
import { emptyGeometry, neg5by5Rect, simpleGeometry } from './examples';
import { replaceFacePoints, trimGeometry } from '../../../../src/store/modules/geometry/mutations';

describe('replaceFacePoints', () => {
  const triangle = {
    vertices: [
      { x: 0, y: 0, id: 'origin' },
      { x: 1, y: 0, id: '(1,0)' },
      { x: 0, y: 1, id: '(0,1)' },
    ],
    edges: [
      { id: 'a', v1: 'origin', v2: '(1, 0)' },
      { id: 'b', v1: '(1, 0)', v2: '(0, 1)' },
      { id: 'c', v1: '(0, 1)', v2: 'origin' },
    ],
  };

  it('will create face, edges and verts if necessary', () => {
    const geometry = _.cloneDeep(emptyGeometry);
    replaceFacePoints([geometry], {
      geometry_id: geometry.id,
      ...triangle,
      face_id: '12',
    });

    assert(_.find(geometry.faces, { id: '12' }));
    assert(geometry.vertices.length === 3);
    assert(geometry.edges.length === 3);
  });

  it('will use existing verts if possible', () => {
    const geometry = _.cloneDeep(neg5by5Rect);
    // neg5by5Rect has a vertex already called 'origin'
    assert(_.find(geometry.vertices, { id: 'origin' }));

    replaceFacePoints([geometry], {
      geometry_id: geometry.id,
      ...triangle,
      face_id: '12',
    });

    assertEqual(
      _.filter(geometry.vertices, { id: 'origin' }).length,
      1,
    );
  });

  it('will use an existing face if possible', () => {
    const geometry = _.cloneDeep(neg5by5Rect);
    geometry.faces.push({ id: 'existingFace', edgeRefs: [] });

    replaceFacePoints([geometry], {
      geometry_id: geometry.id,
      ...triangle,
      face_id: 'existingFace',
    });

    assert(geometry.faces.length === 1);
  });
});

describe('trimGeometry', () => {
  it('leaves edges and verts that are in use', () => {
    const geometry = _.cloneDeep(simpleGeometry);
    trimGeometry([geometry], { geometry_id: geometry.id });

    assertEqual(geometry, simpleGeometry);
  });

  it('removes edges and verts that are unused', () => {
    const geometry = _.cloneDeep(simpleGeometry);
    geometry.faces = [geometry.faces[0]];
    trimGeometry([geometry], { geometry_id: geometry.id });

    assert(geometry.vertices.length < simpleGeometry.vertices.length);
    assert(geometry.edges.length === geometry.faces[0].edgeRefs.length);
  });

  it('leaves an empty geometry alone', () => {
    const geometry = _.cloneDeep(emptyGeometry);

    trimGeometry([geometry], { geometry_id: geometry.id });
    assertEqual(geometry, emptyGeometry);
  });
});
