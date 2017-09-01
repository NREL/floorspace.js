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


module.exports = {
  failOnError: failOnError,
}
