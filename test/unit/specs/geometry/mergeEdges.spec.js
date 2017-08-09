import _ from 'lodash';
import { gen } from 'testcheck';
import { assert, refute, nearlyEqual, assertProperty } from '../../test_helpers';
import mergeEdges from '../../../../src/store/modules/geometry/mergeEdges';

describe('endpointsNearby', () => {
  const
    a = { x: 0, y: 12 },
    b = { x: 100, y: 15 },
    c = { x: 1, y: 11 },
    d = { x: 101, y: 15 };
  it('finds edges whose endpoints are close', () => {
    const edge1 = { start: a, end: b };
    const edge2 = { start: c, end: d };

    const res = mergeEdges.endpointsNearby(edge1, edge2);
    assert(
      res && res.mergeType === 'sameEndpoints',
      'expected edges to be merged');
  });

  it('finds edges who should be reversed, but endpoints are close', () => {
    const edge1 = { start: a, end: b };
    const edge2 = { start: d, end: c };

    const res = mergeEdges.endpointsNearby(edge1, edge2);
    assert(
      res && res.mergeType === 'reverseEndpoints',
      'expected edges to be merged');
  });

  it("doesn't say endpoints are nearby when they're not", () => {
    const res = mergeEdges.endpointsNearby(
      { start: a, end: c },
      { start: b, end: d });

    assert(!res, "those edges aren't nearby");
  });

  it('is sensitive to the length of an edge', () => {
    const res = mergeEdges.endpointsNearby(
      { start: { x: 0, y: 0 }, end: { x: 10, y: 0 } },
      { start: { x: 0, y: 1 }, end: { x: 10, y: 1 } });
    assert(!res, "Those edges aren't nearby relative to the edge length");

    const res2 = mergeEdges.endpointsNearby(
      { start: { x: 0, y: 0 }, end: { x: 100, y: 0 } },
      { start: { x: 0, y: 1 }, end: { x: 100, y: 1 } });
    assert(
      res2 && res2.mergeType === 'sameEndpoints',
      'Those edges *are* nearby relative to the edge length');
  });
});

describe('edgeDirection', () => {
  it('can handle a 45-deg angle', () => {
    const angle = mergeEdges.edgeDirection({
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    });
    assert(
      nearlyEqual(angle, Math.PI / 4),
      'expected an angle of 45-deg (PI/4 radians)');
  });

  it('can handle a straight up or straight down line', () => {
    const
      north = mergeEdges.edgeDirection({
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
      }),
      south = mergeEdges.edgeDirection({
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
      east = mergeEdges.edgeDirection({
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
      }),
      west = mergeEdges.edgeDirection({
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
    const angle = mergeEdges.edgeDirection({
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
      mergeEdges.haveSimilarAngles(
        { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
        { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
      ));

    assert(
      mergeEdges.haveSimilarAngles(
        { start: { x: 0, y: 0 }, end: { x: 1, y: 5 } },
        { start: { x: -1, y: -5 }, end: { x: 0, y: 0 } },
    ));
  });

  it('recognizes that right angles are not similar', () => {
    assert(
      !mergeEdges.haveSimilarAngles(
        { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
        { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
      ));
  });

  it('considers north and south similar', () => {
    assert(
      mergeEdges.haveSimilarAngles(
        { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
        { start: { x: 0, y: 0 }, end: { x: 0, y: -1 } },
      ));
  });

  it('considers barely-north-of-east and barely-north-west similar', () => {
    assert(
      mergeEdges.haveSimilarAngles(
        { start: { x: 0, y: 0 }, end: { x: 100, y: 1 } },
        { start: { x: 0, y: 0 }, end: { x: -100, y: -1 } },
      ));
  });

  it('finds dissimilar angles dissimilar', () => {
    assert(
      !mergeEdges.haveSimilarAngles(
        { start: { x: 0, y: 0 }, end: { x: 3, y: 2 } },
        { start: { x: 0, y: 0 }, end: { x: 2, y: 3 } },
      ));
    assert(
      !mergeEdges.haveSimilarAngles(
        { start: { x: 12, y: 1 }, end: { x: 3, y: 18 } },
        { start: { x: 1, y: 24 }, end: { x: 1, y: 10 } },
      ));
  });
});

describe('consolidateVertices', () => {
  // A tool for making generic arguments for the consolidateVertices
  // function. (generative testing saves me from having to come up with
  // my own examples).
  const genVertices = gen.object({
    startX: gen.numberWithin(-10000, 10000),
    startY: gen.numberWithin(-10000, 10000),
    endX: gen.numberWithin(-10000, 10000),
    endY: gen.numberWithin(-10000, 10000),
    pointsAlong: gen.array(gen.numberWithin(0, 1), { minSize: 0, maxSize: 10 }),
  })
  .suchThat(({ startX, startY, endX, endY }) => startX !== endX || startY !== endY)
  .then(({ startX, startY, endX, endY, pointsAlong }) => {
    const toPointOnLine = t => ({
      x: startX + (t * (endX - startX)),
      y: startY + (t * (endY - startY)),
    });

    const arr = [
      /* start */{ x: startX, y: startY, identity: 'start' },
      /* end */{ x: endX, y: endY, identity: 'end' },
      /* verts */
      ...pointsAlong.map(toPointOnLine),
    ];
    if (pointsAlong.length) {
      /* and a duplicate out of order for good measure */
      arr.push(toPointOnLine(pointsAlong[0]));
    }
    return arr;
  });

  it('puts the end point in the last position', () => {
    assertProperty(genVertices, (verts) => {
      const consolidated = mergeEdges.consolidateVertices(...verts);
      return (
        verts[1].identity === 'end' &&
        consolidated[consolidated.length - 1].identity === 'end');
    });
  });

  it('drops duplicate points', () => {
    assertProperty(genVertices, (verts) => {
      const
        consolidated = mergeEdges.consolidateVertices(...verts),
        uniqVerts = _.uniqBy(verts, _.isEqual);
      assert(consolidated.length >= uniqVerts.length);
    });
  });

  it('never eats start and end', () => {
    assertProperty(genVertices, (verts) => {
      const consolidated = mergeEdges.consolidateVertices(verts[0], verts[1]);
      assert(consolidated.length === 2);
    });
  });

  it('drops points that are close relative to the size of the edge', () => {
    const
      verts = [
        { x: 0, y: 200, id: 'start' },
        { x: 200, y: 0, id: 'end' },
        { x: 2, y: 198, id: 'expect_gone' },
        { x: 25, y: 175, id: 'expect_here' },
        { x: 80, y: 120, id: 'expect_here' },
        { x: 81, y: 119, id: 'expect_gone' },
        { x: 198, y: 2, id: 'expect_gone' },
      ],
      consolidated = mergeEdges.consolidateVertices(...verts);

    refute(
      _.find(consolidated, { id: 'expect_gone' }),
      'Expected those verts to be omitted (too close to start or to one another)');

    assert(
      _.filter(consolidated, { id: 'expect_here' }).length === 2,
      'Expected those two to still be present');
    assert(
      consolidated.length === 4,
      'Expected to keep start, end, two intermediary verts');
  });
});

describe('oneEdgeCouldEatAnother', () => {
  it('eats edges that are on top of one another', () => {
    const couldEat = mergeEdges.oneEdgeCouldEatAnother(
      { start: { x: 2, y: 3, id: 'a' }, end: { x: 22, y: 33, id: 'b' } },
      { start: { x: 7, y: 10.5, id: 'c' }, end: { x: 17, y: 25.5, id: 'd' } },
    );
    assert(
      couldEat && couldEat.mergeType === 'oneEdgeEatsAnother',
      'expected these edges to combine');
    assert(
      couldEat.newVertexOrder[0].id === 'a' &&
      couldEat.newVertexOrder[couldEat.newVertexOrder.length - 1].id === 'b',
      'Expected larger edge to have the outer vertices.');
  });

  it('wont eat edges that are far apart, even if the angle is close', () => {
    const couldEat = mergeEdges.oneEdgeCouldEatAnother(
      { start: { x: -1000, y: 0 }, end: { x: 1000, y: 0 } },
      { start: { x: -1000, y: -100 }, end: { x: 1000, y: -100 } },
    );
    refute(couldEat);
  });

  it('wont eat edges with a different angle, even if the points are close', () => {
    const couldEat = mergeEdges.oneEdgeCouldEatAnother(
      { start: { x: -1000, y: 0 }, end: { x: 1000, y: 0 } },
      { start: { x: -3, y: -1 }, end: { x: 3, y: 1 } },
    );
    // The distance between the small edge's endpoints to the line is small
    // compared with the average edge length. But the angle is different enough
    // that we won't try and merge them. Angle is about 18 deg, vs 0 deg flat.
    // The cutoff is 9 deg
    refute(couldEat, 'expected angle difference to be too large to merge edges');
  });

  // A tool for making generic arguments for the oneEdgeCouldEatAnother
  // function. (generative testing saves me from having to come up with
  // my own examples).
  const genEdgePairSmallNearEndpoint = gen.object({
    startX: gen.numberWithin(-10000, 10000),
    startY: gen.numberWithin(-10000, 10000),
    endX: gen.numberWithin(-10000, 10000),
    endY: gen.numberWithin(-10000, 10000),
    smallEdgeStart: gen.numberWithin(0, 0.02),
    smallEdgeEnd: gen.numberWithin(0.08, 1),
  })
  .suchThat(({ startX, startY, endX, endY }) => startX !== endX || startY !== endY)
  .then(({ startX, startY, endX, endY, smallEdgeStart, smallEdgeEnd }) => {
    const toPointOnLine = t => ({
      x: startX + (t * (endX - startX)),
      y: startY + (t * (endY - startY)),
    });

    const arr = [
      { start: { x: startX, y: startY }, end: { x: endX, y: endY } },
      { start: toPointOnLine(smallEdgeStart), end: toPointOnLine(smallEdgeEnd) },
    ];

    // sometimes (deterministically) reverse the array
    return startX > startY ? arr : arr.reverse();
  });

  it('eats edges when the small one starts near an endpoint', () => {
    assertProperty(genEdgePairSmallNearEndpoint, (edgePair) => {
      assert(mergeEdges.oneEdgeCouldEatAnother(...edgePair));
    });
  });
});

describe('edgesCombine', () => {
  it('combines edges that are parallel and nearby', () => {
    const merge = mergeEdges.edgesCombine(
      { start: { x: -30, y: -1 }, end: { x: 0, y: 0 } },
      { start: { x: 30, y: 2 }, end: { x: -15, y: 0.5 } },
    );
    assert(merge);
  });

  it('combines edges that have slightly different angles and are nearby', () => {
    const merge = mergeEdges.edgesCombine(
      { start: { x: -30, y: -1 }, end: { x: 0, y: 0 } },
      { start: { x: 30, y: 2 }, end: { x: -16, y: 0.5 } },
    );
    assert(merge);
  });


  it("won't combine edges that have too different angles", () => {
    const merge = mergeEdges.edgesCombine(
      { start: { x: -30, y: -30 }, end: { x: 0, y: 0 } },
      { start: { x: -0.3, y: -0.3 }, end: { x: 40, y: 20 } },
    );
    refute(merge);
  });

  it("won't combine edges that are too far apart", () => {
    const merge = mergeEdges.edgesCombine(
      { start: { x: -5, y: 0 }, end: { x: 5, y: 10 } },
      { start: { x: 0, y: 0 }, end: { x: 10, y: 10 } },
    );
    refute(merge);
  });

  it('creates a new edge by taking the direction of most variance', () => {
    const merge = mergeEdges.edgesCombine(
      { start: { x: -30, y: -1, id: 'earliest' }, end: { x: 0, y: 0 } },
      { start: { x: 30, y: 2, id: 'latest' }, end: { x: -16, y: 0.5 } },
    );
    assert(merge.newVertexOrder[0].id === 'earliest');
    assert(merge.newVertexOrder[merge.newVertexOrder.length - 1].id === 'latest');
  });
});

describe('edgesExtend', () => {
  it('combines edges that almost overlap', () => {
    const merge = mergeEdges.edgesExtend(
      { start: { x: -30, y: -1 }, end: { x: 0, y: 0 } },
      { start: { x: 0.5, y: 0.5 }, end: { x: 31, y: 1 } },
    );
    assert(merge);
  });

  it('combines edges that almost overlap (even when one needs to reverse)', () => {
    const merge = mergeEdges.edgesExtend(
      { start: { x: -30, y: -1 }, end: { x: 0, y: 0 } },
      { start: { x: 31, y: 1 }, end: { x: 0.5, y: 0.5 } },
    );
    assert(merge);
  });

  it('ignores edges that almost overlap, but have different angles', () => {
    const merge = mergeEdges.edgesExtend(
      { start: { x: -30, y: -1 }, end: { x: 0, y: 0 } },
      { start: { x: 2, y: 31 }, end: { x: 0.5, y: 0.5 } },
    );
    refute(merge);
  });

  it('ignores edges that do not nearly-overlap', () => {
    const merge = mergeEdges.edgesExtend(
      { start: { x: 0, y: 0 }, end: { x: 3, y: 0 } },
      { start: { x: 4, y: 0 }, end: { x: 5, y: 0 } },
    );
    refute(merge);
  });
});

describe('findMergeableEdges', () => {
  it('preserves the edge that has more popular vertices', () => {

  });
});
