// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage
const d3 = require('d3');

module.exports = {
  'make space and new story': (browser) => {
    const devServer = browser.globals.devServerURL;

    let yScale;
    let xScale;

    browser
      .url(devServer)
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .click('.modal .new-floorplan')
      .waitForElementVisible('#grid svg', 500)
      .execute(
        'return window.application.$store.state.application.scale', [],
        ({ value: scale }) => {
          console.log('scale is', JSON.stringify(scale));
          xScale = d3.scaleLinear()
            .domain(scale.x.rwuRange)
            .range([0, scale.x.pixel]);
          yScale = d3.scaleLinear()
            .domain(scale.y.rwuRange)
            .range([scale.y.pixel, 0]);
        })
      .perform((client, done) => {
        client
        .pause(100)
        .moveTo('#grid svg', xScale(-50), yScale(0))
        .pause(100)
        .mouseButtonClick()
        .pause(100)
        .moveTo('#grid svg', xScale(0), yScale(50))
        .pause(100)
        .mouseButtonClick()
        .waitForElementVisible('#grid svg g.poly', 200);
        done();
      })
      .pause();
  },
};
