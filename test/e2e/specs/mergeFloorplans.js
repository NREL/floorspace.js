const path = require('path');
const { start, finish } = require('../helpers');

const testFloorplanSidesPath = '../fixtures/test-floorplan-sides.json';
const testFloorplanDownPath = '../fixtures/test-floorplan-down.json';

module.exports = {
  tags: ['merge-floorplans'],
  'merging 2 simple floorplans results in a merged floorplan': (browser) => {
    console.log(path.join(__dirname, testFloorplanSidesPath));
    start(browser)
      .waitForElementVisible('[title="Open Floorplan"]', 100)
      .setValue('#toolbarImportInput', path.join(__dirname, testFloorplanSidesPath))
      .waitForElementVisible('#grid svg polygon', 100)
      .setValue('#toolbarMergeInput', path.join(__dirname, testFloorplanDownPath))
      .waitForElementVisible('#grid svg polygon', 100)
      .assert.containsText('[data-object-type="spaces"] .rows', 'Space 1 - 1 (Imported)')
      .assert.containsText('[data-object-type="spaces"] .rows', 'Space 1 - 2 (Imported)')
      .assert.containsText('[data-object-type="spaces"] .rows', 'Space 1 - 1 (Original)')
      .assert.containsText('[data-object-type="spaces"] .rows', 'Space 1 - 2 (Original)')
      .assert.containsText('[data-object-type="spaces"] .rows', 'Space 1 - 3 (Original)');

    finish(browser);
  },
};
