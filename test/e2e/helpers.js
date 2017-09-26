const d3 = require('d3');
const _ = require('lodash');

function failOnError(browser) {
  browser.setFlagOnError = () => {
    browser.execute(
      'window.errorOccurred = false; window.addEventListener("error", () => { window.errorOccurred = true; })',
    );
    return browser;
  };
  browser.checkForErrors = () => {
    browser.execute('return window.errorOccurred', [], ({ value }) => {
      browser.assert.ok(!value);
    })
    .getLog('browser', (logs) => {
      const errors = _(logs)
        .filter({ level: 'SEVERE' })
        .reject(log => /favicon.ico - Failed to load resource:/.test(log.message))
        .map('message')
        .value();
      if (errors.length) {
        console.error('errors found');
        errors.forEach(e => console.error(e));
      }
      browser.assert.equal(errors.length, 0);
    });
    return browser;
  };
  browser.assertErrorOccurred = () => {
    browser
      .getLog('browser', (logs) => {
        const errors = _(logs)
          .filter({ level: 'SEVERE' })
          .reject(log => /favicon.ico - Failed to load resource:/.test(log.message))
          .map('message')
          .value();
        browser.assert.ok(errors.length > 0);
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
function drawSquare(x0, y0, width, height, options = { dontFinish: false }) {
  function draw(client, done) {
    console.log(`moving to ${client.xScale(x0)}, ${client.yScale(y0)}`);
    client
    .waitForElementVisible('#grid svg', 200)
    .pause(10)
    .moveToElement('#grid svg', client.xScale(x0), client.yScale(y0))
    .pause(10)
    .mouseButtonClick()
    .pause(10)
    .moveToElement('#grid svg', client.xScale(x0 + width), client.yScale(y0 + height));
    if (!options.dontFinish) {
      client.mouseButtonClick();
    }
    done();
  }
  return draw;
}

function draw50By50Square(client, done) {
  client
    .perform(drawSquare(-50, 0, 50, 50, { dontFinish: true }));
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
  drawSquare: drawSquare,
};
