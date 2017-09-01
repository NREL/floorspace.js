// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage
const { failOnError, withScales, draw50By50Square } = require('../helpers');

module.exports = {
  'make space and new story': (browser) => {
    withScales(failOnError(browser))
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan')
      .getScales() // assigns to client.xScale, client.yScale.
      // unfortunately, it does so asyncronously, so we have to use .perform()
      // if we want to access them.
      .perform(draw50By50Square)
      .perform((client, done) => {
        client.click('.create-story')
        .pause(10);

        done();
      })
      .perform((client, done) => {
        client.expect.element('.previousStory polygon')
          .to.have.css('stroke-dasharray').which.contains('10');
        client.expect.element('.previousStory polygon')
          .to.have.css('fill-opacity').which.equals('0.3');
        done();
      })
      .checkForErrors()
      .end();
  },
  'no text for empty polygons': (browser) => {
    withScales(failOnError(browser))
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan')
      .getScales() // assigns to client.xScale, client.yScale.
      // unfortunately, it does so asyncronously, so we have to use .perform()
      // if we want to access them.
      .perform(draw50By50Square)
      .click('.tools [data-tool="Eraser"]')
      .perform((client, done) => {
        client
        .moveToElement('#grid svg', client.xScale(-55), client.yScale(-5))
        .pause(10)
        .mouseButtonClick()
        .pause(10)
        .moveToElement('#grid svg', client.xScale(5), client.yScale(55))
        .pause(10)
        .mouseButtonClick()
        .pause(10)
        .assert.elementCount('.poly', 0);
        done();
      })
      .pause()
      .checkForErrors()
      .end();
  },
};
