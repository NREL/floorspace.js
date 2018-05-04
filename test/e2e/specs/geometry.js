const path = require('path');
const { draw50By50Square, drawSquare, start, finish, failOnError, withScales } = require('../helpers');

module.exports = {
  tags: ['geometry'],
  'deformity that scott found (issue #301)': (browser) => {
    failOnError(withScales(browser))
      .url(browser.globals.devServerURL)
      .resizeWindow(1000, 800)
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .setValue('#importInput', path.join(__dirname, '../fixtures/deformity.json'))
      .waitForElementVisible('#grid svg polygon', 100)
      .getScales()
      .click('[data-object-type="spaces"] .rows > div:nth-child(2)')
      .perform(drawSquare(70, 60, 30, -15))
      .execute(
        "return _.map(application.$store.getters['geometry/denormalized'][0].faces, 'vertices')",
        [],
        ({ value }) => {
          const [verts1, verts2] = value;
          browser.assert.ok(_.find(verts1, { x: 15, y: 45 }) && _.find(verts2, { x: 15, y: 45 }));
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
