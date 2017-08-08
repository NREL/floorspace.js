import _ from 'lodash';
import { gen } from 'testcheck';
import helpers from '../../../src/store/modules/geometry/helpers';
import { assert, refute, nearlyEqual, assertProperty } from '../test_helpers';


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

describe('endpointsNearby', () => {
  const
    a = { x: 0, y: 12 },
    b = { x: 100, y: 15 },
    c = { x: 1, y: 11 },
    d = { x: 101, y: 15 };
  it('finds edges whose endpoints are close', () => {
    const edge1 = { start: a, end: b };
    const edge2 = { start: c, end: d };

    const res = helpers.endpointsNearby(edge1, edge2);
    assert(
      res && res.mergeType === 'sameEndpoints',
      'expected edges to be merged');
  });

  it('finds edges who should be reversed, but endpoints are close', () => {
    const edge1 = { start: a, end: b };
    const edge2 = { start: d, end: c };

    const res = helpers.endpointsNearby(edge1, edge2);
    assert(
      res && res.mergeType === 'reverseEndpoints',
      'expected edges to be merged');
  });

  it("doesn't say endpoints are nearby when they're not", () => {
    const res = helpers.endpointsNearby(
      { start: a, end: c },
      { start: b, end: d });

    assert(!res, "those edges aren't nearby");
  });

  it('is sensitive to the length of an edge', () => {
    const res = helpers.endpointsNearby(
      { start: { x: 0, y: 0 }, end: { x: 10, y: 0 } },
      { start: { x: 0, y: 1 }, end: { x: 10, y: 1 } });
    assert(!res, "Those edges aren't nearby relative to the edge length");

    const res2 = helpers.endpointsNearby(
      { start: { x: 0, y: 0 }, end: { x: 100, y: 0 } },
      { start: { x: 0, y: 1 }, end: { x: 100, y: 1 } });
    assert(
      res2 && res2.mergeType === 'sameEndpoints',
      'Those edges *are* nearby relative to the edge length');
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
      const consolidated = helpers.consolidateVertices(...verts);
      return (
        verts[1].identity === 'end' &&
        consolidated[consolidated.length - 1].identity === 'end');
    });
  });

  it('drops duplicate points', () => {
    assertProperty(genVertices, (verts) => {
      const
        consolidated = helpers.consolidateVertices(...verts),
        uniqVerts = _.uniqBy(verts, _.isEqual);
      assert(consolidated.length >= uniqVerts.length);
    });
  });

  it('never eats start and end', () => {
    assertProperty(genVertices, (verts) => {
      const consolidated = helpers.consolidateVertices(verts[0], verts[1]);
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
      consolidated = helpers.consolidateVertices(...verts);

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

  });

  it('wont eat edges with a different angle, even if the points are close', () => {

  });

  it('eats edges when the small one starts near an endpoint', () => {

  });
});

// describe('findMergeableEdges', () => {
//   it('preserves the edge that has more popular vertices', () => {
//
//   });
// });
