// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage
const d3 = require('d3');
const _ = require('lodash');
const failOnError = require('../helpers').failOnError;

module.exports = {
  'make space and new story': (browser) => {
    const devServer = browser.globals.devServerURL;

    let yScale;
    let xScale;

    failOnError(browser)
      .url(devServer)
      .resizeWindow(1000, 800)
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan')
      .waitForElementVisible('#grid svg', 500)
      .execute(
        'return window.application.$store.state.application.scale', [],
        ({ value: scale }) => {
          xScale = d3.scaleLinear()
            .domain(scale.x.rwuRange)
            .range([0, scale.x.pixels]);
          yScale = d3.scaleLinear()
            .domain(scale.y.rwuRange)
            .range([scale.y.pixels, 0]);
        })
      .perform((client, done) => {
        console.log(`moving to ${xScale(-50)}, ${yScale(0)}`);
        client
        .waitForElementVisible('#grid svg', 200)
        .pause(10)
        .moveToElement('#grid svg', xScale(-50), yScale(0))
        .waitForElementVisible('#grid svg .gridpoint', 200)
        .pause(10)
        .mouseButtonClick()
        .pause(10)
        .moveToElement('#grid svg', xScale(0), yScale(50))
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
  'switch to spacing and back, preserve selected space': (browser) => {
    const devServer = browser.globals.devServerURL;

    failOnError(browser)
      .url(devServer)
      .resizeWindow(1000, 800)
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan')
      .click('#navigation #selections select option[value="shading"]')
      .click('.add-sub-selection')
      .click('#navigation #selections select option[value="spaces"]')
      .assert.elementCount('#subselection-list .active', 1)
      .checkForErrors()
      .end();
  },
};
