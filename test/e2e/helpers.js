const d3 = require('d3');

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


module.exports = {
  failOnError: failOnError,
  withScales: withScales,
};
