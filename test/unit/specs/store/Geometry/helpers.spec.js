import { expect } from 'chai';
import helpers from '../../../../../src/store/modules/geometry/helpers';

describe('syntheticRectangleSnaps', () => {
  let resp = helpers.syntheticRectangleSnaps(
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
  expect(resp).to.have.deep.members([
    { x: 3, y: 12 }, // a
    { x: 8, y: -3 }, // b
    { x: 9, y: -2 }, // c
    { x: 2, y: 11 }, // d
  ]);

  // now check with negative y vals
  resp = helpers.syntheticRectangleSnaps(
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
  expect(resp).to.have.deep.members([
    { x: 3, y: 0 }, // a
    { x: 8, y: -15 }, // b
    { x: 9, y: -14 }, // c
    { x: 2, y: -1 }, // d
  ]);
});
