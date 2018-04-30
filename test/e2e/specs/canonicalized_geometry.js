const { ringEquals } = require('../../../src/store/modules/geometry/helpers');
const { drawSquare, start, finish } = require('../helpers');


module.exports = {
  '@disabled': true, // TODO: enable these tests, once they wont fail.
  tags: ['canonicalized-geometry', 'geometry'],
  'stairs shape drawn in different ways should have same vertices': (browser) => {
    start(browser)
      .perform(drawSquare(0, 0, 100, 30))
      .perform(drawSquare(0, 30, 70, 30))
      .perform(drawSquare(0, 60, 50, 30))
      .click('[data-object-type="stories"] .add-new')
      .perform(drawSquare(0, 0, 50, 90))
      .perform(drawSquare(50, 0, 20, 60))
      .perform(drawSquare(70, 0, 30, 30))
      .execute(
          'return _.map(window.application.$store.getters["geometry/denormalized"], "faces.0.vertices");',
          [],
          ({ value }) => {
            const [verts1, verts2] = value;
            browser.assert.ok(ringEquals(verts1, verts2));
          },
      );

    finish(browser);
  },
  'interior walls should be interior': (browser) => {
    start(browser)
      .perform(drawSquare(30, 25, 50, -50))
      .assert.elementCount('.wall.interior', 0)
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(30, 25, 50, 50))
      .assert.elementCount('.wall.interior', 1)
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(0, 0, 30, 50))
      .assert.elementCount('.wall.interior', 3)
      .assert.validGeometry();

    finish(browser);
  },
};
