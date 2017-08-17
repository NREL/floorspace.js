import _ from 'lodash';
import { gen } from 'testcheck';
import {
 assert, refute, assertProperty,
 genPoint, genTriangle, genRectangle, genRegularPolygon, genIrregularPolygon,
 createIrregularPolygon,
} from '../../test_helpers';
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
      res = validateFaceGeometry(points, currentGeometry),
      newVerts = _.reject(res.vertices, v => currentGeometry.vertices.find(c => c.id === v.id));

    assert(newVerts.length === 3);
  });

  const emptyStoryGeometry = { id: 2, vertices: [], edges: [], faces: [] };
  const neg5by5Rect = {
    id: 3,
    vertices: [
      { x: 0, y: 0, id: 'origin' }, { x: -5, y: 0, id: '(-5, 0)' },
      { x: -5, y: -5, id: '(-5, -5)' }, { x: 0, y: -5, id: '(0, -5)' }],
    edges: [
      { id: 'top', v1: 'origin', v2: '(-5, 0)' },
      { id: 'left', v1: '(-5, 0)', v2: '(-5, -5)' },
      { id: 'bottom', v1: '(-5, -5)', v2: '(0, -5)' },
      { id: 'right', v1: '(0, -5)', v2: 'origin' }],
    faces: [],
  };


  const genTooFewVerts = gen.array(genPoint, { maxSize: 2 });

  it('fails when given too few vertices', () => {
    assertProperty(
      genTooFewVerts, (verts) => {
        const resp = validateFaceGeometry(verts, emptyStoryGeometry);
        refute(resp && resp.success);
      });
  });

  it('succeeds from empty on a triangle', () => {
    assertProperty(
      genTriangle, (tri) => {
        const resp = validateFaceGeometry(tri, emptyStoryGeometry);
        assert(resp && resp.success);
      });
  });

  it('succeeds from empty on a rectangle', () => {
    assertProperty(
      genRectangle, (rect) => {
        const resp = validateFaceGeometry(rect, emptyStoryGeometry);
        assert(resp && resp.success);
      });
  });

  it('succeeds from empty on a regular polygon', () => {
    assertProperty(
      genRegularPolygon, (poly) => {
        const resp = validateFaceGeometry(poly, emptyStoryGeometry);
        assert(resp && resp.success);
      });
  });

  it('succeeds from empty on an irregular polygon', () => {
    assertProperty(
      genIrregularPolygon, (poly) => {
        const resp = validateFaceGeometry(poly, emptyStoryGeometry);
        assert(resp && resp.success);
      });
  });

  const
    genZeroAreaTriangle = gen.array(genPoint, { size: 2 })
      .then(([a, b]) => ([a, b, a])),
    genZeroAreaRectangle = gen.array(genPoint, { size: 2 })
      .then(([a, b]) => ([a, b, b, a])),
    genZeroAreaPolygon = gen.oneOf([
      genZeroAreaTriangle, genZeroAreaRectangle,
    ]);

  it('fails when given a zero-area polygon', () => {
    assertProperty(
      genZeroAreaPolygon, (poly) => {
        const resp = validateFaceGeometry(poly, emptyStoryGeometry);
        refute(resp && resp.success);
      });
  });

  const genPolygonWithSpur = gen.object({
    center: genPoint,
    radii: gen.array(gen.intWithin(5, 100), { minSize: 3, maxSize: 20 }),
    spurPos: gen.sPosInt,
  })
  .then(({ center, radii, spurPos: spurPosBeforeMod }) => {
    const
      spurPos = spurPosBeforeMod % radii.length,
      poly = createIrregularPolygon({ center, radii }),
      spikyPoly = createIrregularPolygon({
        center,
        radii: [
          ...radii.slice(0, spurPos),
          radii[spurPos] + 20,
          ...radii.slice(spurPos + 1),
        ],
      });
    poly.splice(spurPos + 1, 0, spikyPoly[spurPos], poly[spurPos]);
    return poly;
  });

  it("fails when there's a zero-area portion of the polygon", () => {
    const resp = validateFaceGeometry(
      [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 20, y: 0 }, { x: 5, y: 0 },
        { x: 5, y: 5 }, { x: 0, y: 5 }], emptyStoryGeometry);
    refute(resp && resp.success);

    assertProperty(genPolygonWithSpur, (poly) => {
      const resp2 = validateFaceGeometry(poly, emptyStoryGeometry);
      refute(resp2 && resp2.success);
    });
  });

  it('fails when the polygon is self-intersecting', () => {
    const resp = validateFaceGeometry(
      [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 0, y: 5 }, { x: 5, y: 5 }],
      emptyStoryGeometry);
    refute(resp && resp.success);
  });

  it('fails when a vertex lies an edge of which it is not an endpoint', () => {
    // https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/598b740a2e569128b4392cb5/f71690195e4801010773652bac9d0a9c/capture.png
    const resp = validateFaceGeometry(
      [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 0, y: 3 }, { x: 0, y: 5 }],
      emptyStoryGeometry);

    refute(resp && resp.success);
  });

  it('uses existing vertices when they perfectly overlap', () => {
    const resp = validateFaceGeometry(
      [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }],
      neg5by5Rect);
    assert(resp && resp.success);
    assert(_.find(resp.vertices, { x: 0, y: 0 }).id === 'origin');
  });

  it('uses existing edges when they perfectly overlap', () => {
    const resp = validateFaceGeometry(
      [{ x: 0, y: 0 }, { x: -5, y: 0 }, { x: -5, y: 5 }, { x: 0, y: 5 }],
      neg5by5Rect);
    assert(resp && resp.success);
    assert(_.find(resp.vertices, { x: 0, y: 0 }).id === 'origin');
    assert(_.find(resp.vertices, { x: -5, y: 0 }).id === '(-5, 0)');
    assert(_.find(resp.edges, { v1: 'origin', v2: '(-5, 0)' }).id === 'top');
  });

  it('uses existing edges when they perfectly overlap (even backwards)', () => {
    const resp = validateFaceGeometry(
      [{ x: 0, y: 5 }, { x: -5, y: 5 }, { x: -5, y: 0 }, { x: 0, y: 0 }],
      neg5by5Rect);
    assert(resp && resp.success);
    assert(_.find(resp.vertices, { x: 0, y: 0 }).id === 'origin');
    assert(_.find(resp.vertices, { x: -5, y: 0 }).id === '(-5, 0)');
    const edge = _.find(resp.edges, { v1: 'origin', v2: '(-5, 0)' });
    assert(edge.id === 'top' && edge.reverse);
  });
});
