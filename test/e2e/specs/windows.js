const { failOnError, withScales, draw50By50Square, drawSquare } = require('../helpers');

module.exports = {
  tags: ['components', 'windows'],
  setUp: (browser) => {
    withScales(failOnError(browser))
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan')
      .getScales() // assigns to client.xScale, client.yScale.
      // unfortunately, it does so asyncronously, so we have to use .perform()
      // if we want to access them.
      .perform(draw50By50Square)
      .click('#library-type-select option[value="window_definitions"]')
      .click('#library-new-object')
      .setValue('.library-table [data-column="width"] input', '12')
      .click('.tools [data-tool="Place Component"]')
      .perform((client, done) => {
        client
        .moveToElement('#grid svg', client.xScale(-40), client.yScale(50))
        .mouseButtonClick();

        done();
      });
  },
  "can't delete definition when instances exist": (browser) => {
    browser
      .click('.library-table .destroy')
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
  'splitting edge preserves windows': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .click('#selections .add-sub-selection')
      .perform(drawSquare(-10, 50, 10, 10))
      .assert.elementCount('.window', 1)
      .checkForErrors()
      .end();
  },
  'covering edge removes windows': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .click('#selections .add-sub-selection')
      .perform(drawSquare(-55, 40, 30, 20))
      .assert.elementCount('.window', 0)
      .checkForErrors()
      .end();
  },
  'moving space preserves windows': (browser) => {
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
      .assert.elementCount('.window', 1)
      .checkForErrors()
      .end();
  },
  'windows on exterior edges that become interior should be removed': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .click('#selections .add-sub-selection')
      .perform(drawSquare(-50, 50, 50, 10))
      .assert.elementCount('.window', 0)
      .checkForErrors()
      .end();
  },
  'windows on exterior edges that become interior should be removed (partial overlap)': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .click('#selections .add-sub-selection')
      .perform(drawSquare(-50, 50, 40, 10))
      .assert.elementCount('.window', 0)
      .checkForErrors()
      .end();
  },
  'windows on interior edges that become exterior should be removed': (browser) => {
    const rightSideWindow = (client, done) => {
        client
        .moveToElement('#grid svg', client.xScale(0), client.yScale(30))
        .mouseButtonClick();

        done();
      },
      move15ToRight = (client, done) => {
        client
        .moveToElement('#grid svg', client.xScale(15), client.yScale(25))
        .pause(10)
        .mouseButtonDown(0)
        .moveToElement('#grid svg', client.xScale(30), client.yScale(25))
        .mouseButtonUp(0);

        done();
      };

    browser
      .click('.tools [data-tool="Rectangle"]')
      .click('#selections .add-sub-selection')
      .perform(drawSquare(0, 0, 30, 50))
      .assert.elementCount('.window', 1) // original window draw in setUp
      .click('.tools [data-tool="Place Component"]')
      .perform(rightSideWindow)
      .click('.tools [data-tool="Select"]')
      .assert.elementCount('.window', 3) // Two for the new one (two faces),
      // one for the existing one.
      .perform(move15ToRight)
      .assert.elementCount('.window', 1) // back to just the original one.
      .click('.tools [data-tool="Rectangle"]')
      .perform(drawSquare(0, 10, 20, 40))
      .click('.tools [data-tool="Place Component"]')
      .perform(rightSideWindow)
      .click('.tools [data-tool="Select"]')
      .perform(move15ToRight)
      .assert.elementCount('.window', 1)
      .checkForErrors()
      .end();
  },
};
