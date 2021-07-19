const { draw50By50Square, drawSquare, start, finish } = require('../helpers');

module.exports = {
  tags: ['geometry'],
  'interior wall must remain interior after erasing': (browser) => {
    start(browser)
      .perform(drawSquare(30, 25, 50, -50))
      .assert.elementCount('.wall.interior', 0)
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(30, 25, 50, 50))
      .assert.elementCount('.wall.interior', 1)
      .click('[data-tool="Eraser"]')
      .perform(drawSquare(30, 25, 30, 10))
      .assert.elementCount('.wall.interior', 1)
      .assert.validGeometry();

    finish(browser);
  },
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
  'combine edges when extending an existing space (issue #253)': (browser) => {
    // Assert we have 4 edges and not 6
    start(browser)
      .perform(draw50By50Square)
      .perform(drawSquare(-50, 50, 50, 50))
      .assert.elementCount('.wall.exterior', 4);
    finish(browser);
  },
  'cloning a space correctly clones all properties including shading and name(issue #178)': (browser) => {
    start(browser)
      .perform(draw50By50Square)
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(-50, 50, 150, 50))
      .click('.duplicate')
      .pause(6000);
    finish(browser);
  },
};
