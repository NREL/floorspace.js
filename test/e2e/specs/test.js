// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage
const _ = require('lodash');
const { failOnError, withScales } = require('../helpers');

module.exports = {
  'make space and new story': (browser) => {
    withScales(failOnError(browser))
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan')
      .getScales() // assigns to client.xScale, client.yScale.
      // unfortunately, it does so asyncronously, so we have to use .perform()
      // if we want to access them.
      .perform((client, done) => {
        console.log(`moving to ${client.xScale(-50)}, ${client.yScale(0)}`);
        client
        .waitForElementVisible('#grid svg', 200)
        .pause(10)
        .moveToElement('#grid svg', client.xScale(-50), client.yScale(0))
        .waitForElementVisible('#grid svg .gridpoint', 200)
        .pause(10)
        .mouseButtonClick()
        .pause(10)
        .moveToElement('#grid svg', client.xScale(0), client.yScale(50))
        .waitForElementVisible('.guideline-area-text', 100);

        client.expect.element('.guideline-dist').text.to.contain('50');
        client.expect.element('.guideline-area-text').text.to.contain('2,500');

        client.mouseButtonClick()
          .pause(10);

        client.execute(
          'return window.application.$store.state.geometry[0].vertices', [],
          ({ value: verts }) => {
            [{ x: -50, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 50 }, { x: -50, y: 50 }]
            .forEach((vert) => {
              client.assert.ok(_.find(verts, vert));
            });
          });

        done();
      })
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
};
