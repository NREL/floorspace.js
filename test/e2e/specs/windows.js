const { failOnError, withScales, draw50By50Square, drawSquare } = require('../helpers');
// test these things https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/59cbced9f6d415088a8aea95/f55303e067fe0e6b8c38231f62d0cd45/capture.png

module.exports = {
  tags: ['components', 'windows'],
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
      .click('[data-object-type="window_definitions"] .add-new')
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
      .click('[data-object-type="window_definitions"] .rows a.destroy')
      // switching modes clears the .highlight
      .click('[data-modetab="floorplan"]')
      .assert.elementCount('.window', 0)
      .checkForErrors()
      .end();
  },
  'modifying edge preserves windows': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .perform(drawSquare(-10, 50, 10, 10))
      .assert.elementCount('.window', 1)
      .checkForErrors()
      .end();
  },
  'replacing section of space moves window to new space': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(-50, 0, 30, 50))
      .assert.elementCount('.window', 1)
      .checkForErrors()
      .end();
  },
  'splitting edge preserves windows': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(-10, 50, 10, 10))
      .assert.elementCount('.window', 1)
      .checkForErrors()
      .end();
  },
  'covering edge removes windows': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(-55, 40, 30, 20))
      .assert.elementCount('.window', 0)
      .checkForErrors()
      .end();
  },
  // 'moving space preserves windows': (browser) => {
  //   browser
  //     .click('.tools [data-tool="Select"]')
  //     .perform((client, done) => {
  //       client
  //       .moveToElement('#grid svg', client.xScale(-25), client.yScale(25))
  //       .pause(10)
  //       .mouseButtonDown(0)
  //       .moveToElement('#grid svg', client.xScale(-30), client.yScale(25))
  //       .mouseButtonUp(0);
  //
  //       done();
  //     })
  //     .assert.elementCount('.window', 1)
  //     .checkForErrors()
  //     .end();
  // },
  'windows on exterior edges that become interior should be removed': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(-50, 50, 50, 10))
      .assert.elementCount('.window', 0)
      .checkForErrors()
      .end();
  },
  'windows on exterior edges that become interior should be removed (partial overlap)': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(-50, 50, 40, 10))
      .assert.elementCount('.window', 0)
      .checkForErrors()
      .end();
  },
  // 'windows on interior edges that become exterior should be removed': (browser) => {
  //   const rightSideWindow = (client, done) => {
  //       client
  //       .moveToElement('#grid svg', client.xScale(0), client.yScale(30))
  //       .mouseButtonClick();
  //
  //       done();
  //     },
  //     move15ToRight = (client, done) => {
  //       client
  //       .moveToElement('#grid svg', client.xScale(15), client.yScale(25))
  //       .pause(10)
  //       .mouseButtonDown(0)
  //       .moveToElement('#grid svg', client.xScale(30), client.yScale(25))
  //       .mouseButtonUp(0);
  //
  //       done();
  //     };
  //
  //   browser
  //     .click('.tools [data-tool="Rectangle"]')
  //     .click('[data-object-type="spaces"] .add-new')
  //     .perform(drawSquare(0, 0, 30, 50))
  //     .assert.elementCount('.window', 1) // original window draw in setUp
  //     .click('[data-modetab="components"]')
  //     .perform(rightSideWindow)
  //     .click('[data-modetab="floorplan"]')
  //     .click('.tools [data-tool="Select"]')
  //     .assert.elementCount('.window', 3) // Two for the new one (two faces),
  //     // one for the existing one.
  //     .perform(move15ToRight)
  //     .assert.elementCount('.window', 1) // back to just the original one.
  //     .click('.tools [data-tool="Rectangle"]')
  //     .perform(drawSquare(0, 10, 20, 40))
  //     .click('[data-modetab="components"]')
  //     .perform(rightSideWindow)
  //     .click('[data-modetab="floorplan"]')
  //     .click('.tools [data-tool="Select"]')
  //     .perform(move15ToRight)
  //     .assert.elementCount('.window', 1)
  //     .checkForErrors()
  //     .end();
  // },
};
