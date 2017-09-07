import _ from 'lodash';
import { gen } from 'testcheck';
import { ptsAreCollinear, haveSimilarAngles, distanceBetweenPoints } from '../../../../src/store/modules/geometry/helpers';
import { gridSnapTargets, snapTargets, snapWindowToEdge } from '../../../../src/components/Grid/snapping';
import { assertProperty, assertEqual, assert, genPoint, refute, nearlyEqual, isNearlyEqual } from '../../test_helpers';

describe('gridSnapTargets', () => {
  it('returns 4 unique points', () => {
    assertProperty(
      genPoint,
      gen.intWithin(1, 100),
      (pt, gridSpacing) => {
        const targets = gridSnapTargets(gridSpacing, pt);

        assertEqual(targets.length, 4);
        assertEqual(_.uniqWith(targets, _.isEqual).length, 4);
      });
  });

  it('returns points aligned on the grid', () => {
    assertProperty(
      genPoint,
      gen.intWithin(1, 100),
      (pt, gridSpacing) => {
        const targets = gridSnapTargets(gridSpacing, pt);

        targets.forEach(t => assertEqual(t.x % gridSpacing, 0));
        targets.forEach(t => assertEqual(t.y % gridSpacing, 0));
      });
  });

  it('gives sensible results for some examples', () => {
    assertEqual(
      _.sortBy(gridSnapTargets(1, { x: 2.43, y: 80.12 }), ['x', 'y']),
      [
        { x: 2, y: 80, type: 'grid' },
        { x: 2, y: 81, type: 'grid' },
        { x: 3, y: 80, type: 'grid' },
        { x: 3, y: 81, type: 'grid' },
      ]);

    assertEqual(
      _.sortBy(gridSnapTargets(5, { x: 2.43, y: 80.12 }), ['x', 'y']),
      [
        { x: 0, y: 80, type: 'grid' },
        { x: 0, y: 85, type: 'grid' },
        { x: 5, y: 80, type: 'grid' },
        { x: 5, y: 85, type: 'grid' },
      ]);
  });
});

describe('snapTargets', () => {
  it('will snap to vertices', () => {
    const
      targets = snapTargets(
        [{ x: 12, y: 0 }, { x: 18, y: 5 }], 5, { x: 13.2, y: 1.2 }),
      closestTarget = targets[0];
    assert(_.isMatch(closestTarget, { type: 'vertex', x: 12, y: 0 }));
  });

  it('will snap to grid points', () => {
    const targets = snapTargets([], 12, { x: 61, y: 23.222 });

    assert(_.isMatch(targets[0], { type: 'grid', x: 60, y: 24 }));
  });

  it('prioritizes a vertex over a grid point that has same distance', () => {
    const
      targets = snapTargets([{ x: 0.4, y: 0.4 }], 1, { x: 0.4, y: 0 }),
      first = targets[0],
      second = targets[1];

    assert(_.isMatch(first, { type: 'vertex', x: 0.4, y: 0.4, dist: 0.4 }));
    assert(_.isMatch(second, { type: 'grid', x: 0, y: 0, dist: 0.4 }));
  });

  it('prioritizes the origin of a polygon over an existing vertex', () => {
    const
      targets = snapTargets([{ x: 0, y: 0 }, { x: 0, y: 0, origin: true }], 1, { x: 0.4, y: 0 }),
      first = targets[0],
      second = targets[1];

    assert(_.isMatch(first, { type: 'vertex', x: 0, y: 0, origin: true }));
    assert(_.isMatch(second, { type: 'vertex', x: 0, y: 0 }));
  });
});

describe('snapWindowToEdge', () => {
  // https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/59b06c1d7ae5ee5570e40141/e69e97620f7e686b0e2e1ddd4a0f8ad0/capture.png
  const
    edges = [
      { id: '8', v1: { id: '4', x: -30, y: 30 }, v2: { id: '5', x: 0, y: 30 } },
      { id: '9', v1: { id: '5', x: 0, y: 30 }, v2: { id: '6', x: 0, y: 0 } },
      { id: '10', v1: { id: '6', x: 0, y: 0 }, v2: { id: '7', x: -30, y: 0 } },
      { id: '11', v1: { id: '7', x: -30, y: 0 }, v2: { id: '4', x: -30, y: 30 } },
      { id: '38', v1: { id: '5', x: 0, y: 30 }, v2: { id: '33', x: -10, y: 40 } },
      { id: '39', v1: { id: '33', x: -10, y: 40 }, v2: { id: '34', x: 10, y: 50 } },
      { id: '40', v1: { id: '34', x: 10, y: 50 }, v2: { id: '35', x: 65, y: 35 } },
      { id: '41', v1: { id: '35', x: 65, y: 35 }, v2: { id: '36', x: 55, y: -25 } },
      { id: '42', v1: { id: '36', x: 55, y: -25 }, v2: { id: '37', x: 5, y: 0 } },
      { id: '43', v1: { id: '37', x: 5, y: 0 }, v2: { id: '5', x: 0, y: 30 } },
    ],
    genPointInNeighborhood = gen.object({
      x: gen.numberWithin(-35, 70),
      y: gen.numberWithin(-30, 50),
    }),
    inclusiveMaxSnapDist = 100,
    narrowMaxSnapDist = 5;

  it('returns null on empty window list', () => {
    refute(snapWindowToEdge([], { x: 12, y: 12 }, 10, inclusiveMaxSnapDist));
  });

  it('returns null when no windows nearby', () => {
    refute(snapWindowToEdge(edges, { x: 100, y: 70 }, 10, narrowMaxSnapDist));
    refute(snapWindowToEdge(edges, { x: -50, y: -50 }, 10, narrowMaxSnapDist));
  });

  it('returns a segment centered on an edge', () => {
    assertProperty(
      genPointInNeighborhood,
      (cursor) => {
        const
          windowLoc = snapWindowToEdge(edges, cursor, 10, inclusiveMaxSnapDist),
          edge = _.find(edges, { id: windowLoc.edge_id });
        assert(
          ptsAreCollinear(edge.v1, windowLoc.center, edge.v2),
          'expected pts to be collinear');
        assert(
          windowLoc.alpha >= 0 && windowLoc.alpha <= 1,
          'expected center to be between endpoints of edge');
      },
    );
  });

  it('alpha accurately describes the location of the center', () => {
    assertProperty(
      genPointInNeighborhood,
      (cursor) => {
        const
          windowLoc = snapWindowToEdge(edges, cursor, 10, inclusiveMaxSnapDist),
          edge = _.find(edges, { id: windowLoc.edge_id }),
          alphaAlongEdge = {
            x: edge.v1.x + (windowLoc.alpha * (edge.v2.x - edge.v1.x)),
            y: edge.v1.y + (windowLoc.alpha * (edge.v2.y - edge.v1.y)),
          };
        assert(isNearlyEqual(
          alphaAlongEdge,
          _.pick(windowLoc.center, ['x', 'y']),
        ));
      },
    );
  });

  it('returns a segment with the same angle as an edge', () => {
    assertProperty(
      genPointInNeighborhood,
      (cursor) => {
        const
          windowLoc = snapWindowToEdge(edges, cursor, 10, inclusiveMaxSnapDist),
          edge = _.find(edges, { id: windowLoc.edge_id });
        assert(
          haveSimilarAngles({ start: edge.v1, end: edge.v2 }, windowLoc),
          `expected ${JSON.stringify(edge)} and ${JSON.stringify(windowLoc)} to be parallel`,
        );
      },
    );
  });

  it('chooses the closest edge when several are within maxSnapDist', () => {
    const windowLoc = snapWindowToEdge(
      edges, { x: 4, y: 5 }, 10, inclusiveMaxSnapDist);
    assertEqual(windowLoc.edge_id, '43');
  });

  it('edges returned always span windowWidth / 2 to either side', () => {
    assertProperty(
      genPointInNeighborhood,
      gen.intWithin(1, 20),
      (cursor, windowWidth) => {
        const windowLoc = snapWindowToEdge(edges, cursor, windowWidth, inclusiveMaxSnapDist);
        assert(
          nearlyEqual(
            distanceBetweenPoints(windowLoc.center, windowLoc.start),
            windowWidth / 2));
        assert(
          nearlyEqual(
            distanceBetweenPoints(windowLoc.center, windowLoc.end),
            windowWidth / 2));
      },
    );
  });
});
