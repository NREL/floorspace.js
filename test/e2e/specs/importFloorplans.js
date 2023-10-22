const path = require('path');
const fs = require('fs');
const Ajv = require('ajv');
const jsonSchemaDraft4 = require('ajv/lib/refs/json-schema-draft-04.json');
const schema = require('../../../schema/geometry_schema.json');
const downloads = path.join(require('os').homedir(), 'Downloads');
const failOnError = require('../helpers').failOnError;
const draw50By50Square = require('../helpers').draw50By50Square;
const withScales = require('../helpers').withScales;

const ajv = new Ajv({ allErrors: true });
ajv.addMetaSchema(jsonSchemaDraft4);
const exported = path.join(downloads, 'floorplan_nightwatch_exported.json');

function assertValidSchema(browser) {
  browser.perform(() => {
    // we need to read the file *after* the browser code has run, not when
    // the command pipeline being defined. Hence .perform()
    fs.readFile(exported, 'utf8', (err, data) => {
      browser.assert.ok(!err, 'floorplan file was found');
      if (!err) {
        const valid = ajv.validate(schema, JSON.parse(data));
        if (!valid) {
          browser.assert.ok(
            false,
            'schema failed to validate: ' + JSON.stringify(ajv.errors, null, '  '), // eslint-disable-line
          );
        }
      }
    });
  });
}

function deleteFloorplan() {
  if (fs.existsSync(exported)) {
    fs.unlinkSync(exported);
  }
}

const oldFloorplans = [
  '../fixtures/floorplan-2017-08-31.json',
  '../fixtures/floorplan_two_story_2017_11_28.json',
  '../fixtures/floorplan_two_story_2018_01_17.json',
];

module.exports = {
  tags: ['import-floorplans'],
  setUp: (browser) => {
    const devServer = browser.globals.devServerURL;

    failOnError(browser)
      .url(devServer)
      .resizeWindow(1000, 800)
      .waitForElementVisible('.modal .open-floorplan', 100)
      .setFlagOnError();
  },
  'import succeeds, export is updated to be valid against schema': (browser) => {
    oldFloorplans.forEach((floorplanPath) => {
      browser
        .perform(() => {
          console.log(`testing import, update of ${floorplanPath} from ${__dirname}`);
          browser
            .refresh()
            .waitForElementVisible('.modal .open-floorplan', 100)
            .setFlagOnError()
            .setValue('#importInput', path.join(__dirname, floorplanPath))
            .waitForElementVisible('#grid svg polygon', 100)
            .perform(deleteFloorplan) // delete floorplan so download has correct name
            .pause(100)
            .click('[title="Save Floorplan"]')
            .waitForElementVisible('#download-name', 100)
            .clearValue('#download-name')
            .setValue('#download-name', 'floorplan_nightwatch_exported')
            .click('.download-button')
            .pause(1000)
            .checkForErrors();

          assertValidSchema(browser);
        });
    });
    browser.end();
  },
  'export is importable': (browser) => {
    withScales(browser)
      .click('.modal .new-floorplan svg')
      .getScales()
      .perform(deleteFloorplan) // delete floorplan so download has correct name
      .perform(draw50By50Square)
      .click('[title="Save Floorplan"]')
      .waitForElementVisible('#download-name', 100)
      .clearValue('#download-name')
      .setValue('#download-name', 'floorplan_nightwatch_exported')
      .click('.download-button')
      .pause(1000)
      .checkForErrors();

    browser
      .refresh()
      .waitForElementVisible('.modal .open-floorplan', 100)
      .setFlagOnError()
      .setValue('#importInput', exported)
      .waitForElementVisible('#grid svg polygon', 100)
      .checkForErrors()
      .end();
  },
  'exported floorplan satisfies schema': (browser) => {
    withScales(browser)
      .click('.modal .new-floorplan svg')
      .getScales()
      .perform(deleteFloorplan) // delete floorplan so download has correct name
      .perform(draw50By50Square)
      .click('[title="Save Floorplan"]')
      .waitForElementVisible('#download-name', 100)
      .clearValue('#download-name')
      .setValue('#download-name', 'floorplan_nightwatch_exported')
      .click('.download-button')
      .pause(1000)
      .checkForErrors();

    assertValidSchema(browser);
    browser.end();
  },
  'floorplan can be exported to three.js': (browser) => {
    withScales(browser)
      .click('.modal .new-floorplan svg')
      .getScales()
      .perform(deleteFloorplan) // delete floorplan so download has correct name
      .perform(draw50By50Square)
      .click('[title="Save Floorplan"]')
      .waitForElementVisible('#export-input-threejs', 100)
      .click('#export-input-threejs')
      .clearValue('#download-name')
      .setValue('#download-name', 'floorplan_nightwatch_exported')
      .click('.download-button')
      .pause(1000)
      .checkForErrors();
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
      .perform(deleteFloorplan)
      .checkForErrors()
      .end();
  },
};
