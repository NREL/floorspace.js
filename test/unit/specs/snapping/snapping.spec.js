import _ from 'lodash';
import { gen } from 'testcheck';
import { gridSnapTargets } from '../../../../src/components/Grid/snapping';
import { assertProperty, assertEqual, genPoint } from '../../test_helpers';

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
