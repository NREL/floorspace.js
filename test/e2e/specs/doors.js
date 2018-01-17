const { failOnError, withScales, draw50By50Square, drawSquare } = require('../helpers');
// test these things https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/59cbced9f6d415088a8aea95/f55303e067fe0e6b8c38231f62d0cd45/capture.png

module.exports = {
  tags: ['components', 'doors'],
  setUp: (browser) => {
    withScales(failOnError(browser))
      .waitForElementVisible('.modal .new-floorplan svg', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan svg')
      .getScales() // assigns to client.xScale, client.yScale.
      // unfortunately, it does so asyncronously, so we have to use .perform()
      // if we want to access them.
      .perform(draw50By50Square)
      .click('[data-modetab="components"]')
      .click('[data-object-type] .input-select option[value="door_definitions"]')
      .click('[data-object-type="door_definitions"] .add-new')
      .perform((client, done) => {
        client
          .moveToElement('#grid svg', client.xScale(-40), client.yScale(50))
          .mouseButtonClick();

        done();
      })
      .click('[data-modetab="floorplan"]');
  },
  'deleting defn deletes all instances': (browser) => {
    browser
      .click('[data-modetab="components"]')
      .click('[data-object-type] .input-select option[value="door_definitions"]')
      .click('[data-object-type="door_definitions"] .rows a.destroy')
      // switching modes clears the .highlight
      .click('[data-modetab="floorplan"]')
      .assert.elementCount('.door', 0)
      .checkForErrors()
      .end();
  },
  'modifying edge preserves doors': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .perform(drawSquare(-10, 50, 10, 10))
      .assert.elementCount('.door', 1)
      .checkForErrors()
      .end();
  },
  'replacing section of space moves door to new space': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(-50, 0, 30, 50))
      .assert.elementCount('.door', 1)
      .checkForErrors()
      .end();
  },
  'splitting edge preserves doors': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(-10, 50, 10, 10))
      .assert.elementCount('.door', 1)
      .checkForErrors()
      .end();
  },
  'covering edge removes doors': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(-55, 40, 30, 20))
      .assert.elementCount('.door', 0)
      .checkForErrors()
      .end();
  },
  'doors on exterior edges that become interior should be removed': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(-50, 50, 50, 10))
      .assert.elementCount('.door', 0)
      .checkForErrors()
      .end();
  },
  'doors on exterior edges that become interior should be removed (partial overlap)': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(-50, 50, 40, 10))
      .assert.elementCount('.door', 0)
      .checkForErrors()
      .end();
  },
};
