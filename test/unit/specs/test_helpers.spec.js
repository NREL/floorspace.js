import _ from 'lodash';
import {
  assert, assertProperty, nearlyEqual, genRectangle, createIrregularPolygon,
  genRegularPolygon, isNearlyEqual,
} from '../test_helpers';
import helpers from '../../../src/store/modules/geometry/helpers';

describe('genRectangle', () => {
  it('has four vertices', () => {
    assertProperty(genRectangle, (rect) => {
      assert(rect.length === 4);
    });
  });

  it('has consecutive edges that form a right angle', () => {
    assertProperty(genRectangle, (rect) => {
      rect.forEach((point, ix) => {
        const edge = { start: point, end: rect[(ix + 1) % rect.length] },
          nextEdge = {
            start: rect[(ix + 1) % rect.length],
            end: rect[(ix + 2) % rect.length],
          },
          edgeDir = helpers.edgeDirection(edge),
          nextEdgeDir = helpers.edgeDirection(nextEdge);

        assert(
          nearlyEqual((nextEdgeDir - edgeDir) % (Math.PI / 2), 0),
          `expected consecutive angles to be perpendicular: ${edgeDir}, ${nextEdgeDir}`);
      });
    });
  });

  it('has no more than two distinct edge lengths', () => {
    assertProperty(genRectangle, (rect) => {
      const
        edgeLengths = rect.map((point, ix) => (
          helpers.distanceBetweenPoints(point, rect[(ix + 1) % rect.length])
        )),
        distinctEdgeLengths = _.uniq(edgeLengths);

      assert(
        distinctEdgeLengths.length <= 2,
        'expected no more than 2 different edge lengths on a rectangle');
    });
  });
});

describe('createIrregularPolygon', () => {
  it('can make a regular triangle and rect', () => {
    const
      tri = createIrregularPolygon({
        center: { x: 0, y: 0 },
        radii: [4, 4, 4],
      }),
      square = createIrregularPolygon({
        center: { x: 0, y: 0 },
        radii: [5, 5, 5, 5],
      });
    assert(tri.length === 3);
    const edgeDists = tri.map((pt, ix) => (
      helpers.distanceBetweenPoints(pt, tri[(ix + 1) % 3])
    ));
    assert(
      edgeDists.every(dist => nearlyEqual(dist, edgeDists[0])),
      'expected equilateral triangle to always have the same edge distances');

    assert(isNearlyEqual(
      square,
      [
        { x: 0, y: 5 },
        { x: 5, y: 0 },
        { x: 0, y: -5 },
        { x: -5, y: 0 },
      ]));
  });

  it('can make regular polygons', () => {
    assertProperty(genRegularPolygon, (poly) => {
      const edgeDists = poly.map((pt, ix) => (
        helpers.distanceBetweenPoints(pt, poly[(ix + 1) % poly.length])
      ));
      assert(
        edgeDists.every(dist => nearlyEqual(dist, edgeDists[0])),
        'expected regular polygon to always have the same edge distances');
    });
  });
});
