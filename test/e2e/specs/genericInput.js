// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage
const { failOnError } = require('../helpers');

module.exports = {
  tags: ['input'],
  setUp: (browser) => {
    const devServer = browser.globals.devServerURL;

    failOnError(browser)
      .url(devServer)
      .resizeWindow(1000, 800)
      .waitForElementVisible('.modal .open-floorplan', 100)
      .setFlagOnError();
  },
  'clearing floor to ceiling replaces default, but good changes are preserved': (browser) => {
    const floorToCeiling = '[data-column="floor_to_ceiling_height"] input';
    browser
      .click('.modal .new-floorplan svg')
      .click('[data-object-type="stories"] [title="expand"]')
      .clearValue(floorToCeiling)
      .keys(browser.Keys.ENTER)
      .assert.value(floorToCeiling, '8')
      .clearValue(floorToCeiling)
      .setValue(floorToCeiling, '9')
      .keys(browser.Keys.ENTER)
      .assert.value(floorToCeiling, '9')
      .checkForErrors()
      .end();
  },
  'clearing space floor to ceiling is allowed': (browser) => {
    const floorToCeiling = '[data-column="floor_to_ceiling_height"] input';
    browser
      .click('.modal .new-floorplan svg')
      .click('[data-object-type="spaces"] [title="expand"]')
      .setValue(floorToCeiling, '12')
      .keys(browser.Keys.ENTER)
      .assert.value(floorToCeiling, '12')
      .clearValue(floorToCeiling)
      .keys(browser.Keys.ENTER)
      .assert.value(floorToCeiling, '');
    browser.expect.element(floorToCeiling).to.have.attribute('placeholder').equals('(none)');

    browser
      .checkForErrors()
      .end();
  },
};
