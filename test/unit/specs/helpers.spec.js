import helpers from '../../../src/store/modules/geometry/helpers';
import { assert, nearlyEqual } from '../test_helpers';


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
