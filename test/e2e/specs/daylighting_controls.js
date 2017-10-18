const { failOnError, withScales, draw50By50Square, drawSquare } = require('../helpers');
// https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/59cbcee5c364c5692f59960a/acab1e2db0df2c56c0d3e261133e733b/capture.png

module.exports = {
  tags: ['components', 'daylighting-controls'],
  setUp: (browser) => {
    withScales(failOnError(browser))
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan svg')
      .getScales() // assigns to client.xScale, client.yScale.
      // unfortunately, it does so asyncronously, so we have to use .perform()
      // if we want to access them.
      .perform(draw50By50Square)
      .click('[data-modetab="components"]')
      .click('#component-icons [title="Daylighting Control Definition"]')
      .click('[data-object-type="daylighting_control_definitions"] .add-new')
      .click('#component-icons [title="Daylighting Control Definition"]')
      .perform((client, done) => {
        client
        .moveToElement('#grid svg', client.xScale(-40), client.yScale(40))
        .mouseButtonClick();

        done();
      })
      .click('[data-modetab="floorplan"]');
  },
  'deleting defn deletes all instances': (browser) => {
    browser
    .click('[data-modetab="components"]')
    .click('#component-icons [title="Daylighting Control Definition"]')
    .click('#component-icons [data-object-type="daylighting_control_definitions"]')
    .click('#component-icons [data-object-type="daylighting_control_definitions"] .destroy')
      // switching tools clears the .highlight
      .click('.tools [data-tool="Remove Component"]')
      .assert.elementCount('.daylighting-control', 0)
      .checkForErrors()
      .end();
  },
  'replacing section of space moves daylighting control to new space': (browser) => {
    browser
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(-50, 0, 30, 50))
      .assert.elementCount('.current.poly .daylighting-control', 1)
      .checkForErrors()
      .end();
  },
  'daylighting control wont "jump" to stay in space': (browser) => {
    browser
      .click('.tools [data-tool="Eraser"]')
      .perform(drawSquare(-50, 25, 30, 20))
      .assert.elementCount('.daylighting-control', 0)
      .checkForErrors()
      .end();
  },
  'modifying edge preserves daylighting controls': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .perform(drawSquare(-10, 50, 10, 10))
      .assert.elementCount('.daylighting-control', 1)
      .checkForErrors()
      .end();
  },
  'splitting edge preserves daylighting controls': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(-10, 50, 10, 10))
      .assert.elementCount('.daylighting-control', 1)
      .checkForErrors()
      .end();
  },
  'covering daylighting control should not remove it': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(-45, 35, 30, 30))
      .assert.elementCount('.daylighting-control', 1)
      .checkForErrors()
      .end();
  },
  'moving space preserves daylighting controls': (browser) => {
    browser
      .click('.tools [data-tool="Select"]')
      .perform((client, done) => {
        client
        .moveToElement('#grid svg', client.xScale(-25), client.yScale(25))
        .pause(10)
        .mouseButtonDown(0)
        .moveToElement('#grid svg', client.xScale(-30), client.yScale(25))
        .mouseButtonUp(0);

        done();
      })
      .assert.elementCount('.daylighting-control', 1)
      .checkForErrors()
      .end();
  },

};
