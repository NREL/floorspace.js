const { failOnError, withScales, draw50By50Square, drawSquare } = require('../helpers');

module.exports = {
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
      .click('#component-menus select option[value="window_definitions"]')
      .perform((client, done) => {
        client
        .moveToElement('#grid svg', client.xScale(-40), client.yScale(50))
        .mouseButtonClick();

        done();
      });
  },
  'splitting edge preserves windows': (browser) => {
    browser
      .click('.tools [data-tool="Rectangle"]')
      .perform(drawSquare(-10, 50, 10, 10))
      .assert.elementCount('.window', 1)
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

};
