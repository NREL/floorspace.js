import _ from 'lodash';
import { gen } from 'testcheck';
import helpers, { fitToAspectRatio, ringEquals } from '../../../../src/store/modules/geometry/helpers';
import {
  assert, refute, nearlyEqual, assertProperty, isNearlyEqual,
  assertEqual,
  genTriangleLeftOfOrigin,
  genTriangleRightOfOrigin,
  genTriangle,
  createIrregularPolygon,
  genIrregularPolygonPieces,
  genRegularPolygonPieces,
  genIrregularPolygon,
  genRectangle,
} from '../../test_helpers';
import * as geometryExamples from './examples';
import { validateFaceGeometry } from '../../../../src/store/modules/geometry/actions/createFaceFromPoints';

describe('ringEquals', () => {
  it('identifies truly equal vertex lists', () => {
    assertProperty(
      genIrregularPolygon,
      pts => ringEquals(pts, pts),
    );
  });

  it('ignores id property', () => {
    assertProperty(
      genIrregularPolygon
        .then(pts => ({
          a: pts.map(pt => ({ ...pt, id: _.uniqueId() })),
          b: pts.map(pt => ({ ...pt, id: _.uniqueId() })),
        })),
      ({ a, b }) => ringEquals(a, b),
    );
  });

  it('is independent of rotation', () => {
    assertProperty(
      genIrregularPolygon,
      gen.posInt,
      (pts, pivot) => {
        const pivotIx = pivot % pts.length;
        const ptsPivoted = [...pts.slice(pivotIx), ...pts.slice(0, pivotIx)];
        return ringEquals(pts, ptsPivoted);
      },
    );
  });

  it('is independent of winding order', () => {
    assertProperty(
      genIrregularPolygon,
      (pts) => {
        const ptsReversed = [...pts].reverse();
        return !_.isEqual(pts, ptsReversed) && ringEquals(pts, ptsReversed);
      },
    );
  });

  it('permits closed rings (start == end)', () => {
    assertProperty(
      gen.object({
        pts: genIrregularPolygon,
        pivot: gen.posInt,
      })
      .then(({ pts, pivot }) => {
        const pivotIx = pivot % pts.length;
        const ptsPivoted = [...pts.slice(pivotIx), ...pts.slice(0, pivotIx)];
        return {
          a: [...pts, pts[0]],
          b: [...ptsPivoted, ptsPivoted[0]],
        };
      }),
      ({ a, b }) => ringEquals(a, b),
    );
  });

  it('is independent of both winding order and rotation and closed rings', () => {
    assertProperty(
      gen.object({
        pts: genIrregularPolygon,
        pivot: gen.posInt,
      })
      .then(({ pts, pivot }) => {
        const pivotIx = pivot % pts.length;
        const ptsReversed = [...pts].reverse();
        const ptsReversedAndRotated = [...ptsReversed.slice(pivotIx), ...ptsReversed.slice(0, pivotIx)];
        return {
          a: [...pts, pts[0]],
          b: [...ptsReversedAndRotated, ptsReversedAndRotated[0]],
        };
      }),
      ({ a, b }) => !_.isEqual(a, b) && ringEquals(a, b),
    );
  });

  it('identifies unequal rings', () => {
    assertProperty(
      gen.object({
        a: genIrregularPolygon,
        b: genIrregularPolygon,
      }).suchThat(({ a, b }) => !_.isEqual(a, b)),
      ({ a, b }) => !ringEquals(a, b),
    );
  });

  it('identifies unequal rings with same vertex set', () => {
    assertProperty(
      genRectangle
        .then(pts => ({
          original: pts,
          folded: [pts[0], pts[2], pts[1], pts[3]],
        })),
      ({ original, folded }) => !ringEquals(original, folded),
    );
  });

  it('makes no changes to parameters', () => {
    assertProperty(
      genIrregularPolygon,
      genIrregularPolygon,
      (a, b) => {
        const
          origA = [...a],
          origB = [...b];
        ringEquals(a, b);
        return _.isEqual(a, origA) && _.isEqual(b, origB);
      },
    );
  });
});

describe('fitToAspectRatio', () => {
  it("doesn't mess with values when they already fit", () => {
    const { xExtent, yExtent } = fitToAspectRatio([0, 10], [0, 6], 10 / 6);
    assert(
        nearlyEqual(xExtent[0], 0) &&
        nearlyEqual(xExtent[1], 10) &&
        nearlyEqual(yExtent[0], 0) &&
        nearlyEqual(yExtent[1], 6));
  });

  it('expands x when necessary', () => {
    const { xExtent, yExtent } = fitToAspectRatio(
      [0, 5],
      [0, 6],
      10 / 6,
      'expand');
    assert(isNearlyEqual(yExtent, [0, 6]), 'yExtent should be unchanged');
    assert(
      nearlyEqual(0 - xExtent[0], xExtent[1] - 5),
      'x was expanded equally on either side');
    assert(
      nearlyEqual(xExtent[1] - xExtent[0], 10),
      'x has been expanded to fit the aspect ratio');
  });

  it('contracts y when necessary', () => {
    const { xExtent, yExtent } = fitToAspectRatio(
      [0, 5],
      [0, 6],
      5 / 3,
      'contract');
    assert(isNearlyEqual(xExtent, [0, 5]), 'xExtent should be unchanged');
    assert(
      nearlyEqual(0 - yExtent[0], yExtent[1] - 6),
      'y was contracted equally on either side');
    assert(
      nearlyEqual(yExtent[1] - yExtent[0], 3),
      'y has been contracted to fit the aspect ratio');
  });
});

describe('syntheticRectangleSnaps', () => {
  it('should work', () => {
    const resp = helpers.syntheticRectangleSnaps(
      /* points */ [
        { x: 3, y: -3 }, // @
        { x: 9, y: 11 }], // $
      /* rectStart */ { x: 0, y: 10 },
      /* cursorPt */ { x: 11, y: -1 },
    );
    /*
              a
           d--+---------------$
  (0, 10) ----+---------------+---
          |   |               |  |
          |   |               |  |
          |   |               |  |
          |   |               |  |
          |   |               |  |
          |   |               |  |
          |   |               |  |
          |   |               |  |
          |   |               |  |
          ----+---------------+--- (11, -1)
              |               c
              @-------------- b

    */
    [
      { x: 3, y: 12 }, // a
      { x: 8, y: -3 }, // b
      { x: 9, y: -2 }, // c
      { x: 2, y: 11 }, // d
    ].forEach((entry) => {
      assert(
        resp.find(r => (r.x === entry.x && r.y === entry.y)),
        `expected to find ${JSON.stringify(entry)} in ${JSON.stringify(resp)}`);
    });
  });

  it('should work with negative y vals', () => {
    // now check with negative y vals
    const resp = helpers.syntheticRectangleSnaps(
      /* points */ [
        { x: 3, y: -15 }, // @
        { x: 9, y: -1 }], // $
      /* rectStart */ { x: 0, y: -2 },
      /* cursorPt */ { x: 11, y: -13 },
    );

    /*
              a
           d--+---------------$
  (0, -2) ----+---------------+---
          |   |               |  |
          |   |               |  |
          |   |               |  |
          |   |               |  |
          |   |               |  |
          |   |               |  |
          |   |               |  |
          |   |               |  |
          |   |               |  |
          ----+---------------+--- (11, -13)
              |               c
              @-------------- b

    */
    [
      { x: 3, y: 0 }, // a
      { x: 8, y: -15 }, // b
      { x: 9, y: -14 }, // c
      { x: 2, y: -1 }, // d
    ].forEach((entry) => {
      assert(
        resp.find(r => (r.x === entry.x && r.y === entry.y)),
        `expected to find ${JSON.stringify(entry)} in ${JSON.stringify(resp)}`);
    });
  });
});

describe('projectionOfPointToLine', () => {
  const
    lineUR = { p1: { x: -5, y: -5 }, p2: { x: 5, y: 5 } },
    lineUp = { p1: { x: 0, y: -5 }, p2: { x: 0, y: 5 } },
    lineRt = { p1: { x: -5, y: 3 }, p2: { x: 5, y: 3 } };
  it('projects points on the line to themselves', () => {
    const proj11 = helpers.projectionOfPointToLine({ x: 1, y: 1 }, lineUR);
    assert(
      nearlyEqual(proj11.x, 1) && nearlyEqual(proj11.y, 1),
      `expected proj11 to be (1, 1) (was ${JSON.stringify(proj11)})`);

    const proj33 = helpers.projectionOfPointToLine({ x: -3, y: -3 }, lineUR);
    assert(
      nearlyEqual(proj33.x, -3) && nearlyEqual(proj33.y, -3),
      `expected proj33 to be (-3, -3) (was ${JSON.stringify(proj33)})`);
  });

  it('chooses the right angle projection when possible', () => {
    const proj = helpers.projectionOfPointToLine({ x: 2, y: 0 }, lineUR);
    assert(
      nearlyEqual(proj.x, 1) && nearlyEqual(proj.y, 1),
      `expected proj to be (1, 1) (was ${JSON.stringify(proj)})`);
  });

  it('projects onto verticals and horizontals', () => {
    const genPointAboveLine = gen.object(
      { x: gen.numberWithin(-5, 5), y: gen.int });
    assertProperty(
      genPointAboveLine,
      (pt) => {
        const projHoriz = helpers.projectionOfPointToLine(pt, lineRt);
        assert(
          nearlyEqual(projHoriz.x, pt.x) && nearlyEqual(projHoriz.y, 3),
          `expected projHoriz to be (${pt.x}, 3), (was ${JSON.stringify(projHoriz)})`,
        );
      });

    const genPointBesideLine = gen.object(
      { x: gen.int, y: gen.numberWithin(-5, 5) });

    assertProperty(
      genPointBesideLine,
      (pt) => {
        const projVert = helpers.projectionOfPointToLine(pt, lineUp);
        assert(
          nearlyEqual(projVert.x, 0) && nearlyEqual(projVert.y, pt.y),
          `expected projVert to be (0, ${pt.y}), (was (${JSON.stringify(projVert)})`);
      });
  });

  it('projects points collinear with the line to an endpoint', () => {
    const
      collinearPtsAfterLine = gen.numberWithin(5, 10000)
        .then(num => ({ x: num, y: num })),
      collinearPtsBeforeLine = gen.numberWithin(-10000, -5)
        .then(num => ({ x: num, y: num }));

    assertProperty(
      collinearPtsAfterLine,
      (pt) => {
        const proj = helpers.projectionOfPointToLine(pt, lineUR);
        return nearlyEqual(proj.x, 5) && nearlyEqual(proj.y, 5);
      });

    assertProperty(
      collinearPtsBeforeLine,
      (pt) => {
        const proj = helpers.projectionOfPointToLine(pt, lineUR);
        return nearlyEqual(proj.x, -5) && nearlyEqual(proj.y, -5);
      });
  });

  it('projects to an endpoint when necessary', () => {
    let proj = helpers.projectionOfPointToLine({ x: 5.5, y: 5.3 }, lineUR);
    assert(nearlyEqual(proj.x, 5) && nearlyEqual(proj.y, 5));

    proj = helpers.projectionOfPointToLine({ x: 10, y: 2 }, lineUR);
    assert(nearlyEqual(proj.x, 5) && nearlyEqual(proj.y, 5));

    proj = helpers.projectionOfPointToLine({ x: 8, y: 2 }, lineRt);
    assert(nearlyEqual(proj.x, 5) && nearlyEqual(proj.y, 3));
  });
});

describe('inRing', () => {
  const ringFromPolygon = polygon => polygon.map(pt => [pt.x, pt.y]);
  const xyPointToClipperPoint = p => [p.x, p.y];

  it('returns true if a point is in a ring', () => {
    assertProperty(genIrregularPolygonPieces, (polygonPieces) => {
      const polygon = createIrregularPolygon(polygonPieces);
      const ring = ringFromPolygon(polygon);
      const ringCenter = xyPointToClipperPoint(polygonPieces.center);
      // center
      assert(helpers.inRing(ringCenter, ring, true));
      assert(helpers.inRing(ringCenter, ring, false));

      // random point
      const point = [
        (polygonPieces.center.x + ring[0][0]) / 2,
        (polygonPieces.center.y + ring[0][1]) / 2,
      ];
      assert(helpers.inRing(point, ring, true));
      assert(helpers.inRing(point, ring, false));
    });

    it('returns false if a point is outside of a ring', () => {
      assertProperty(genIrregularPolygonPieces, (polygonPieces) => {
        const polygon = createIrregularPolygon(polygonPieces);
        const ring = ringFromPolygon(polygon);
        const point = [
          (polygonPieces.center.x + ring[0][0]),
          (polygonPieces.center.y + ring[0][1]),
        ];
        refute(helpers.inRing(point, ring, true));
        refute(helpers.inRing(point, ring, false));
      });
    });
  });
});


describe('setOperation', () => {
  it('union or intersection with self is self', () => {
    assertProperty(
      genTriangle,
      (tri) => {
        const union = helpers.setOperation('union', tri, tri);
        const intersection = helpers.setOperation('intersection', tri, tri);

        assert(union && intersection); // didn't cause error
        _.chain([tri, union, intersection])
        // sort the arrays so we can compare same points for equality
        .map(arr => _.sortBy(arr, ['x', 'y']))
        .unzip()
        .forEach(
          ([pt1, pt2, pt3]) => {
            assert(
              isNearlyEqual(pt1, pt2) && isNearlyEqual(pt2, pt3),
              `expected original, union, and intersection to be equal.
              instead: ${JSON.stringify([pt1, pt2, pt3])}`,
            );
          })
        .value();
      },
    );
  });

  it('difference with self is nothing', () => {
    assertProperty(
      genTriangle,
      (tri) => {
        const difference = helpers.setOperation('difference', tri, tri);

        assert(difference); // didn't cause error
        assert(difference.length === 0);
      },
    );
  });

  it('union with disparate shape is split face (error)', () => {
    assertProperty(
      genTriangleLeftOfOrigin, genTriangleRightOfOrigin,
      (tri1, tri2) => {
        const union = helpers.setOperation('union', tri1, tri2);

        assertEqual(union, { error: 'no split faces' });
      });
  });

  it('intersection with disparate shape is nothing', () => {
    assertProperty(
      genTriangleLeftOfOrigin, genTriangleRightOfOrigin,
      (tri1, tri2) => {
        const intersection = helpers.setOperation('intersection', tri1, tri2);

        assert(intersection);
        assert(intersection.length === 0);
      });
  });

  it('calculates correctly when spacing is a decimal', () => {
    const polygon = [{ x: -209.60000000000002, y: 21.8 },
      { x: -187.8, y: 21.8 },
      { x: -187.8, y: 13 }, { x: -209.60000000000002, y: 13 },
      { x: -209.60000000000002, y: 21.8 }];

    const newPolygon = [{ x: -202.4, y: 21.8 },
      { x: -194, y: 21.8 }, { x: -194, y: 18.2 },
      { x: -202.4, y: 18.2 }];

    const points = helpers.setOperation('intersection', polygon, newPolygon);
    assert(points);
    const solution = [{ x: -194, y: 21.8 }, { x: -202.4, y: 21.8 }, { x: -202.4, y: 18.2 }, { x: -194, y: 18.2 }];
    assert(ringEquals(points, solution));
  });

  it('does not allow holes', () => {
    assertProperty(
      genRegularPolygonPieces,
      gen.numberWithin(0.2, 0.8),
      ({ numEdges, radius, center }, scalingFactor) => {
        const polygon = createIrregularPolygon({
          radii: _.range(numEdges).map(_.constant(radius)),
          center,
        });
        const innerPolygon = createIrregularPolygon({
          radii: _.range(numEdges).map(_.constant(radius * scalingFactor)),
          center,
        });

        const difference = helpers.setOperation('difference', polygon, innerPolygon);

        assert(difference.error);
        assertEqual(difference.error, 'no holes');
      },
    );
  });

  it('produces geometry that validateFaceGeometry accepts', () => {
    const existingFaceVertices = [
      {"id":"5","x":-140,"y":220},{"id":"6","x":-15,"y":220},
      {"id":"7","x":-15,"y":70},{"id":"8","x":-140,"y":70}];
    const points = [
      {"x":-125,"y":305,"type":"grid","dist":2.511988458940511,"dx":-2.435064935059998,"dy":-0.6168831168799898}, {"x":-55,"y":305},
      {"x":-55,"y":220,"type":"grid","dist":2.7476818300832977,"dx":2.240259740260001,"dy":1.590909090910003},{"x":-125,"y":220}];
    const currentGeom = {
      id: "2",
      vertices: [
        { id: "5", x: -140, y: 220 },
        { id: "6", x: -15, y: 220 },
        { id: "7", x: -15, y: 70 },
        { id: "8", x: -140, y: 70 }
      ],
      edges: [
        { id: "9", v1: "5", v2: "6" },
        { id: "10", v1: "6", v2: "7" },
        { id: "11", v1: "7", v2: "8" },
        { id: "12", v1: "8", v2: "5" }
      ],
      faces: [
        {
          id: "13",
          edgeRefs: [
            { edge_id: "9", reverse: false },
            { edge_id: "10", reverse: false },
            { edge_id: "11", reverse: false },
            { edge_id: "12", reverse: false }
          ]
        }
      ]
    };
    const facePoints = helpers.union(existingFaceVertices, points);
    const resp = validateFaceGeometry(facePoints, currentGeom);
    assert(resp && resp.success);
  });
});

describe('splittingVerticesForEdgeId', () => {
  it('respects the spacing option for small geometry', () => {
    /*
    using small geometry, splitting vertices for edge ce
    should include only 'd'.
    a +---+ b
      |   |
      |   |
    c +---+-----+ e
      |   d     |
      |         |
      |         |
    f +---------+ g
*/
    const edge = geometryExamples.smallGeometry.edges.find(e => e.id === 'ce');
    const splittingVertices = helpers.splittingVerticesForEdgeId(edge, geometryExamples.smallGeometry, 0.1);
    assert(splittingVertices.length === 1, `should find one splitting vertex, but found ${splittingVertices.length}`);
    assertEqual(splittingVertices[0], { id: 'd', x: 0.4, y: 1 });

    const splittingSmallerVertices = helpers.splittingVerticesForEdgeId(edge, geometryExamples.evenSmallerGeometry, 0.01);
    assert(splittingSmallerVertices.length === 1, `should find one splitting vertex, but found ${splittingSmallerVertices.length}`);
    assertEqual(splittingSmallerVertices[0], { id: 'd', x: 0.04, y: 0.1 });
  });
});

describe('edgeDirection', () => {
  it('can handle a 45-deg angle', () => {
    const angle = helpers.edgeDirection({
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    });
    assert(
      nearlyEqual(angle, Math.PI / 4),
      'expected an angle of 45-deg (PI/4 radians)');
  });

  it('can handle a straight up or straight down line', () => {
    const
      north = helpers.edgeDirection({
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
      }),
      south = helpers.edgeDirection({
        start: { x: 0, y: 0 },
        end: { x: 0, y: -1 },
      });
    assert(
      nearlyEqual(north, 0.5 * Math.PI),
      `expected angle of north to be pi/2 rad (was ${north})`);
    assert(
      nearlyEqual(south, 0.5 * Math.PI),
      `expected angle of south to be pi/2 rad (was ${south})`);
  });

  it('can handle a west or east line', () => {
    const
      east = helpers.edgeDirection({
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
      }),
      west = helpers.edgeDirection({
        start: { x: 0, y: 0 },
        end: { x: -1, y: 0 },
      });
    assert(
      nearlyEqual(east, 0),
      'expected angle of east to be 0 rad');
    assert(
      nearlyEqual(west, 0),
      `expected angle of west to be PI rad (was ${west})`);
  });

  it('can handle a 30-deg angle', () => {
    const angle = helpers.edgeDirection({
      start: { x: 0, y: 0 },
      end: { x: Math.sqrt(3) / 2, y: 0.5 },
    });
    assert(
      nearlyEqual(angle, Math.PI / 6),
      `expected 30-deg angle to be pi/6 (was ${angle})`);
  });
});

describe('haveSimilarAngles', () => {
  it('finds that identical angles are similar', () => {
    assert(
      helpers.haveSimilarAngles(
        { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
        { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
      ));

    assert(
      helpers.haveSimilarAngles(
        { start: { x: 0, y: 0 }, end: { x: 1, y: 5 } },
        { start: { x: -1, y: -5 }, end: { x: 0, y: 0 } },
    ));
  });

  it('recognizes that right angles are not similar', () => {
    assert(
      !helpers.haveSimilarAngles(
        { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
        { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
      ));
  });

  it('considers north and south similar', () => {
    assert(
      helpers.haveSimilarAngles(
        { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
        { start: { x: 0, y: 0 }, end: { x: 0, y: -1 } },
      ));
  });

  it('considers barely-north-of-east and barely-north-west similar', () => {
    assert(
      helpers.haveSimilarAngles(
        { start: { x: 0, y: 0 }, end: { x: 100, y: 1 } },
        { start: { x: 0, y: 0 }, end: { x: -100, y: -1 } },
      ));
  });

  it('finds dissimilar angles dissimilar', () => {
    assert(
      !helpers.haveSimilarAngles(
        { start: { x: 0, y: 0 }, end: { x: 3, y: 2 } },
        { start: { x: 0, y: 0 }, end: { x: 2, y: 3 } },
      ));
    assert(
      !helpers.haveSimilarAngles(
        { start: { x: 12, y: 1 }, end: { x: 3, y: 18 } },
        { start: { x: 1, y: 24 }, end: { x: 1, y: 10 } },
      ));
  });
});

describe('denormalize', () => {
  it('is undone by normalize', () => {
    assertProperty(
      gen.oneOf(_.values(geometryExamples)),
      (geom) => {
        assertEqual(
          geom,
          helpers.normalize(helpers.denormalize(geom)),
        );
      },
      { numTests: _.values(geometryExamples).length },
    );
  });

  it('provides a getter for face.vertices', () => {
    assertProperty(
      gen.oneOf(_.values(geometryExamples)),
      (geom) => {
        helpers.denormalize(geom).faces.forEach((face) => {
          // one more vertex than edge, because vertices need to loop back around.
          assertEqual(face.edges.length, face.vertices.length - 1);

          face.vertices.forEach(v =>
            assert(_.has(v, 'id') && _.has(v, 'x') && _.has(v, 'y')),
          );
        });
      },
      { numTests: _.values(geometryExamples).length },
    );
  });

  it('adding a face persists after normalization', () => {
    assertProperty(
      gen.oneOf(_.values(geometryExamples)),
      (geom) => {
        const denorm = helpers.denormalize(geom);
        denorm.faces.push({
          /* eslint-disable */
          id: 'new_face',
          edges: [
            {id: 'new_edge1', reverse: false,
             v1: {id: 'new_vert1', x: 0, y: 0},
             v2: {id: 'new_vert2', x: 1, y: 0}},
            {id: 'new_edge2', reverse: false,
             v1: {id: 'new_vert2', x: 1, y: 0},
             v2: {id: 'new_vert3', x: 1, y: 1}},
            {id: 'new_edge3', reverse: false,
             v1: {id: 'new_vert3', x: 1, y: 1},
             v2: {id: 'new_vert1', x: 0, y: 0}},
          ],
          /* eslint-enable */
        });

        const
          renorm = helpers.normalize(denorm),
          vertIds = _.map(renorm.vertices, 'id'),
          edgeIds = _.map(renorm.edges, 'id'),
          faceInQuestion = _.find(renorm.faces, { id: 'new_face' });

        assert(_.includes(vertIds, 'new_vert1'));
        assert(_.includes(vertIds, 'new_vert2'));
        assert(_.includes(vertIds, 'new_vert3'));

        assert(_.includes(edgeIds, 'new_edge1'));
        assert(_.includes(edgeIds, 'new_edge2'));
        assert(_.includes(edgeIds, 'new_edge3'));

        assert(faceInQuestion);
        assertEqual(
          _.map(faceInQuestion.edgeRefs, 'edge_id'),
          ['new_edge1', 'new_edge2', 'new_edge3']);
      },
      { numTests: _.values(geometryExamples).length },
    );
  });
});
