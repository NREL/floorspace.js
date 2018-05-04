const { draw50By50Square, drawSquare, start, finish } = require('../helpers');

module.exports = {
  tags: ['geometry'],
  'deformity that scott found (issue #301)': (browser) => {
    start(browser)
      .perform(draw50By50Square)
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(-40, 55, 30, -30))
      .perform(drawSquare(-30, 25, 20, -10))
      .perform(drawSquare(-30, 15, -10, 10))
      .execute(
        "return application.$store.getters['geometry/errors']",
        [],
        ({ value }) => {
          browser.assert.ok(value.length === 0);
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
  'drawing overlapping polygon should not duplicate vertices': (browser) => {
    start(browser)
      .perform(draw50By50Square)
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(0, 50, 20, -20))
      .click('[data-object-type="spaces"] .rows > div:nth-child(1)')
      .perform(drawSquare(0, 50, 10, -30))
      .assert.validGeometry();
    finish(browser);
  },
  'duplicate edge case (issue #253)': (browser) => {
    start(browser)
      .perform(draw50By50Square)
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(0, 65, 20, -25))
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(20, 20, -20, 20))
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(0, 20, 20, -25))
      .click('[data-object-type="spaces"] .rows > div:nth-child(1)')
      .perform(drawSquare(0, 50, 10, -40))
      .assert.validGeometry();
    finish(browser);
  },
};
