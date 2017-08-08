import { gen } from 'testcheck';
import helpers from '../../../../src/store/modules/geometry/helpers';
import { assert, nearlyEqual, assertProperty } from '../../test_helpers';

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
