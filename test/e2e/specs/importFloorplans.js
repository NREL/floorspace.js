const path = require('path');
const failOnError = require('../helpers').failOnError;

module.exports = {
  tags: ['import-floorplan'],
  'try importing floorplans': (browser) => {
    const devServer = browser.globals.devServerURL;

    failOnError(browser)
      .url(devServer)
      .resizeWindow(1000, 800)
      .waitForElementVisible('.modal .open-floorplan', 100)
      .setFlagOnError()
      .setValue('#importInput', path.join(__dirname, '../fixtures/floorplan-2017-08-31.json'))
      .waitForElementVisible('#grid svg polygon', 100)
      .checkForErrors()
      .end();
  },
};
