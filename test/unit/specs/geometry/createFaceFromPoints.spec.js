import _ from 'lodash';
import { gen } from 'testcheck';
import { assert, refute, assertProperty, genPoint } from '../../test_helpers';
import { validateFaceGeometry } from '../../../../src/store/modules/geometry/actions/createFaceFromPoints';

describe('validateFaceGeometry', () => {
  it('preserves rectangularity when possible (issue #72 )', () => {
    // https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/598b63629862dc7224f4df8c/1bc285908438ddc20e64c55752191727/capture.png
    const
      points = JSON.parse('[{"x":0,"y":1},{"x":3.10847804166,"y":1},{"x":3.10847804166,"y":2.75847898924},{"x":0,"y":2.75847898924}]'),
      currentGeometry = JSON.parse(`{
              "id":"2","vertices":[
                {"id":"4","x":0,"y":-4.0358709153},{"id":"5","x":3,"y":-4.0358709153},
                {"id":"6","x":3,"y":0},{"id":"7","x":0,"y":0},{"id":"14","x":7,"y":0},
                {"id":"15","x":7,"y":-4},{"id":"39","x":8,"y":1},{"id":"78","x":0,"y":1},
                {"id":"38","x":8,"y":-4}
              ],"edges":[
                {"id":"8","v1":"4","v2":"5"},{"id":"9","v1":"5","v2":"6"},
                {"id":"10","v1":"6","v2":"7"},{"id":"11","v1":"7","v2":"4"},
                {"id":"16","v1":"6","v2":"14"},{"id":"17","v1":"14","v2":"15"},
                {"id":"18","v1":"15","v2":"5"},{"id":"79","v1":"39","v2":"78"},
                {"id":"80","v1":"78","v2":"7"},{"id":"41","v1":"15","v2":"38"},
                {"id":"42","v1":"38","v2":"39"},{"id":"83","v1":"7","v2":"6"},
                {"id":"84","v1":"6","v2":"14"}],
              "faces":[
                {"id":"12","edgeRefs":[{"edge_id":"8","reverse":false},{"edge_id":"9","reverse":false},{"edge_id":"10","reverse":false},{"edge_id":"11","reverse":false}]},
                {"id":"19","edgeRefs":[{"edge_id":"16","reverse":false},{"edge_id":"17","reverse":false},{"edge_id":"18","reverse":false},{"edge_id":"9","reverse":false}]},
                {"id":"82","edgeRefs":[{"edge_id":"79","reverse":false},{"edge_id":"80","reverse":false},{"edge_id":"83","reverse":false},{"edge_id":"84","reverse":false},{"edge_id":"17","reverse":false},{"edge_id":"41","reverse":false},{"edge_id":"42","reverse":false}
              ]}]
            }
            `);

    const
      res = validateFaceGeometry(points, currentGeometry, 2),
      newVerts = _.reject(res.vertices, v => currentGeometry.vertices.find(c => c.id === v.id));

    assert(newVerts.length === 3);
  });

  const emptyStoryGeometry = { id: 2, vertices: [], edges: [], faces: [] };
  const genTooFewVerts = gen.array(genPoint, { maxSize: 2 });

  it('fails when given too few vertices', () => {
    assertProperty(
      genTooFewVerts, (verts) => {
        const resp = validateFaceGeometry(verts, emptyStoryGeometry, 0);
        refute(resp && resp.success);
      });
  });

  // it('succeeds from empty on a triangle', () => {
  //
  // });
  //
  // it('succeeds from empty on a rectangle', () => {
  //
  // });
  //
  // it('succeeds from empty on a regular polygon', () => {
  //
  // });
  //
  // it('fails when given a zero-area polygon', () => {
  //
  // });
  //
  // it("fails when there's a zero-area portion of the polygon", () => {
  //
  // });
  //
  // it('fails when the polygon is self-intersecting', () => {
  //
  // });
  //
  // it('fails when a vertex lies an edge of which it is not an endpoint', () => {
  //   // https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/598b740a2e569128b4392cb5/f71690195e4801010773652bac9d0a9c/capture.png
  //
  // });
  //
  // it('uses existing vertices when they perfectly overlap', () => {
  //
  // });
  //
  // it('uses existing edges when they perfectly overlap', () => {
  //
  // });
});
