const { failOnError, withScales, draw50By50Square, drawSquare } = require('../helpers');

function start(browser) {
  return failOnError(withScales(browser))
    .url(browser.globals.devServerURL)
    .resizeWindow(1000, 800)
    .waitForElementVisible('.modal .new-floorplan', 5000)
    .setFlagOnError()
    .click('.modal .new-floorplan svg')
    .getScales();
}

function finish(browser) {
  browser
    .checkForErrors()
    .end();
}

module.exports = {
  tags: ['geometry'],
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
