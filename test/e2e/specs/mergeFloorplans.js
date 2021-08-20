const path = require('path');
const { start, finish } = require('../helpers');

const testFloorplanSidesPath = '../fixtures/test-floorplan-sides.json';
const testFloorplanDownPath = '../fixtures/test-floorplan-down.json';
const testBunchOfStuffPath = '../fixtures/bunch-of-stuff.json';
const testFloorplanStockPath = '../fixtures/testing-floorplan-stock-photo.json';

module.exports = {
  tags: ['merge-floorplans'],
  'merging 2 simple floorplans results in a merged floorplan': (browser) => {
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
  'merging 2 complex floorplans results in a merged floorplan': (browser) => {
    start(browser)
      .waitForElementVisible('[title="Open Floorplan"]', 100)
      .setValue('#toolbarImportInput', path.join(__dirname, testBunchOfStuffPath))
      .waitForElementVisible('#grid svg polygon', 100)
      .setValue('#toolbarMergeInput', path.join(__dirname, testFloorplanStockPath))
      .waitForElementVisible('#grid svg polygon', 100)
      .assert.containsText('[data-object-type="spaces"] .rows', 'Space 1 - 1 (Imported)')
      .assert.containsText('[data-object-type="spaces"] .rows', 'Space 1 - 2 (Imported)')
      .assert.containsText('[data-object-type="spaces"] .rows', 'Space 1 - 3 (Imported)')
      .assert.containsText('[data-object-type="spaces"] .rows', 'Space 1 - 1 (Original)')
      .assert.containsText('[data-object-type="spaces"] .rows', 'Space 1 - 2 (Original)')
      .assert.containsText('[data-object-type="spaces"] .rows', 'Space 1 - 3 (Original)')
      .click('#navigation .pretty-select option[value="shading"]')
      .assert.containsText('[data-object-type="shading"] .rows', 'Shading 1 - 1')
      .assert.containsText('[data-object-type="shading"] .rows', 'Shading 1 - 2')
      .click('#navigation .pretty-select option[value="images"]')
      .assert.containsText('[data-object-type="images"] .rows', 'Image 1 - 1')
      .click('[data-modetab="assignments"]')
      .assert.containsText('[data-object-type="thermal_zones"] .rows', 'Thermal Zone 1')
      .click('#navigation .pretty-select option[value="building_units"]')
      .assert.containsText('[data-object-type="building_units"] .rows', 'Building Unit 1')
      .click('#navigation .pretty-select option[value="space_types"]')
      .assert.containsText('[data-object-type="space_types"] .rows', 'Space Type 1')
      .click('#navigation .pretty-select option[value="pitched_roofs"]')
      .assert.containsText('[data-object-type="pitched_roofs"] .rows', 'Pitched Roof 1')
      .click('[data-modetab="components"]')
      .assert.containsText('[data-object-type="window_definitions"] .rows', 'Window 1')
      .click('#navigation .pretty-select option[value="daylighting_control_definitions"]')
      .assert.containsText('[data-object-type="daylighting_control_definitions"] .rows', 'Daylighting Control 1')
      .assert.containsText('[data-object-type="daylighting_control_definitions"] .rows', 'Daylighting Control 2')
      .click('#navigation .pretty-select option[value="door_definitions"]')
      .assert.containsText('[data-object-type="daylighting_control_definitions"] .rows', 'Door 1');

    finish(browser);
  },
};
