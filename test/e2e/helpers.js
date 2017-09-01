const d3 = require('d3');
const _ = require('lodash');

function failOnError(browser) {
  let errorOccurred;
  browser.setFlagOnError = () => {
    browser.execute(
      'window.errorOccurred = false; window.addEventListener("error", () => { window.errorOccurred = true; })',
    );
    return browser;
  };
  browser.checkForErrors = () => {
    browser.execute('return window.errorOccurred', [], ({ value }) => {
      errorOccurred = value;
    })
    .perform((client, done) => {
      client.assert.ok(!errorOccurred);
      done();
    });
    return browser;
  };
  return browser;
}

function withScales(browser) {
  browser
    .url(browser.globals.devServerURL)
    .resizeWindow(1000, 800);

  browser.getScales = () => {
    browser
      .waitForElementVisible('#grid svg', 500)
      .execute(
        'return window.application.$store.state.application.scale', [],
        ({ value: scale }) => {
          browser.xScale = d3.scaleLinear()
            .domain(scale.x.rwuRange)
            .range([0, scale.x.pixels]);
          browser.yScale = d3.scaleLinear()
            .domain(scale.y.rwuRange)
            .range([scale.y.pixels, 0]);
        });
    return browser;
  };
  return browser;
}

function draw50By50Square(client, done) {
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
}


module.exports = {
  failOnError: failOnError,
  withScales: withScales,
  draw50By50Square: draw50By50Square,
};
