const path = require('path');
const _ = require('lodash');
const { ringEquals } = require('../../../src/store/modules/geometry/helpers');
const { drawSquare, start, finish, failOnError, withScales } = require('../helpers');


module.exports = {
  '@disabled': true, // TODO: enable these tests, once they wont fail.
  tags: ['canonicalized-geometry', 'geometry'],
  'deformity that scott found (issue #301)': (browser) => {
    failOnError(withScales(browser))
      .url(browser.globals.devServerURL)
      .resizeWindow(1000, 800)
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .setValue('#importInput', path.join(__dirname, '../fixtures/deformity.json'))
      .waitForElementVisible('#grid svg polygon', 100)
      .getScales()
      .click('[data-object-type="spaces"] .rows > div:nth-child(2)')
      .perform(drawSquare(70, 60, 30, -15))
      .execute(
        "return _.map(application.$store.getters['geometry/denormalized'][0].faces, 'vertices')",
        [],
        ({ value }) => {
          const [verts1, verts2] = value;
          browser.assert.ok(_.find(verts1, { x: 15, y: 45 }) && _.find(verts2, { x: 15, y: 45 }));
        },
      );
    finish(browser);
  },
  'stairs shape drawn in different ways should have same vertices': (browser) => {
    start(browser)
      .perform(drawSquare(0, 0, 100, 30))
      .perform(drawSquare(0, 30, 70, 30))
      .perform(drawSquare(0, 60, 50, 30))
      .click('[data-object-type="stories"] .add-new')
      .perform(drawSquare(0, 0, 50, 90))
      .perform(drawSquare(50, 0, 20, 60))
      .perform(drawSquare(70, 0, 30, 30))
      .execute(
          'return _.map(window.application.$store.getters["geometry/denormalized"], "faces.0.vertices");',
          [],
          ({ value }) => {
            const [verts1, verts2] = value;
            browser.assert.ok(ringEquals(verts1, verts2));
          },
      );

    finish(browser);
  },
};
