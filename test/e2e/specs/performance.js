const _ = require('lodash');
const { failOnError, withScales, drawSquare } = require('../helpers');

module.exports = {
  tags: ['performance'],
  setUp: (browser) => {
    withScales(failOnError(browser))
    .waitForElementVisible('.modal .new-floorplan svg', 5000)
    .setFlagOnError()
    .click('.modal .new-floorplan svg')
    .getScales();
  },
  'lotsa floors': (browser) => {
    browser
        .perform(drawSquare(0, 0, 50, 50))
        .click('[data-object-type="spaces"] .add-new')
        .perform(drawSquare(0, 0, -50, 50))
        .click('[data-object-type="spaces"] .add-new')
        .perform(drawSquare(0, 0, -50, -50))
        .click('[data-object-type="spaces"] .add-new')
        .perform(drawSquare(0, 0, 50, -50))
        .click('[data-tool="Fill"]');

    _.range(50).forEach(() => {
      browser.perform((client, done) => {
        client
          .click('[data-object-type="stories"] .add-new')
          .moveToElement('#grid svg', client.xScale(25), client.yScale(25))
          .mouseButtonClick()
          .click('[data-object-type="spaces"] .add-new')
          .moveToElement('#grid svg', client.xScale(-25), client.yScale(25))
          .mouseButtonClick()
          .click('[data-object-type="spaces"] .add-new')
          .moveToElement('#grid svg', client.xScale(-25), client.yScale(-25))
          .mouseButtonClick()
          .click('[data-object-type="spaces"] .add-new')
          .moveToElement('#grid svg', client.xScale(25), client.yScale(-25))
          .mouseButtonClick();

        done();
      });
    });
    browser
      .pause()
      .checkForErrors()
      .end();
  },

};
