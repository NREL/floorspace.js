const path = require('path');
const { draw50By50Square, drawSquare, start, finish } = require('../helpers');

const testFloorplanSidesPath = '../fixtures/test-floorplan-sides.json';

module.exports = {
  tags: ['merge-floorplans'],
  'merging 2 simple floorplans results in a merged floorplan': (browser) => {
    console.log(path.join(__dirname, testFloorplanSidesPath));
    start(browser)
      .waitForElementVisible('[title="Open Floorplan"]', 100)
      .setValue('#toolbarImportInput', path.join(__dirname, testFloorplanSidesPath))
      .waitForElementVisible('#grid svg polygon', 100)
      .pause(6000);

    finish(browser);
  },
};
