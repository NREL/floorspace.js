import _ from 'lodash';
import { gen } from 'testcheck';
import { gridSnapTargets, snapTargets } from '../../../../src/components/Grid/snapping';
import { assertProperty, assertEqual, assert, genPoint } from '../../test_helpers';

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
