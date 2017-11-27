const path = require('path');
const failOnError = require('../helpers').failOnError;

module.exports = {
  tags: ['import-floorplan'],
  setUp: (browser) => {
    const devServer = browser.globals.devServerURL;

    failOnError(browser)
      .url(devServer)
      .resizeWindow(1000, 800)
      .waitForElementVisible('.modal .open-floorplan', 100)
      .setFlagOnError();
  },
  'import succeeds': (browser) => {
    browser
      .setValue('#importInput', path.join(__dirname, '../fixtures/floorplan-2017-08-31.json'))
      .waitForElementVisible('#grid svg polygon', 100)
      .checkForErrors()
      .end();
  },
  'project.north_axis new location': (browser) => {
    browser
      .setValue('#importInput', path.join(__dirname, '../fixtures/floorplan-2017-08-31.json'))
      .waitForElementVisible('#grid svg polygon', 100)
      .execute('return window.application.$store.state.project.north_axis', [], ({ value }) => {
        browser.assert.equal(value, 12, 'expected project.config.north_axis to be moved to project.north_axis');
      })
      .execute('return window.application.$store.state.project.config.north_axis', [], ({ value }) => {
        browser.assert.ok(!value); // should be deleted from project.config
      })
      .checkForErrors()
      .end();
  },
};
