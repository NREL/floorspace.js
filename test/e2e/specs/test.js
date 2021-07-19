// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage
const _ = require('lodash');
const { failOnError, withScales, draw50By50Square, drawSquare } = require('../helpers');

module.exports = {
  tags: ['spaces'],
  'failOnError causes failure': (browser) => {
    failOnError(browser)
      .url(browser.globals.devServerURL)
      .resizeWindow(1000, 800)
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .execute(() => {
        console.error(new Error('mock error'));
      })
      .assertErrorOccurred()
      .end();
  },
  'make space and new story': (browser) => {
    withScales(failOnError(browser))
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan svg')
      .getScales() // assigns to client.xScale, client.yScale.
      // unfortunately, it does so asyncronously, so we have to use .perform()
      // if we want to access them.
      .perform(draw50By50Square)
      .click('[data-object-type="stories"] .add-new')
      .perform((client, done) => {
        client.expect.element('.previousStory polygon')
          .to.have.css('stroke-dasharray').which.contains('1px, 4px');
        client.expect.element('.previousStory polygon')
          .to.have.css('fill-opacity').which.equals('0.3');
        done();
      })
      .checkForErrors()
      .end();
  },
  'fill space to next story': (browser) => {
    withScales(failOnError(browser))
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan svg')
      .getScales()
      .perform(draw50By50Square)
      .click('[data-object-type="stories"] .add-new')
      .click('.tools [data-tool="Fill"]')
      .perform((client, done) => {
        client
          .moveToElement('#grid svg', client.xScale(-25), client.yScale(25))
          .pause(10)
          .mouseButtonClick();
        done();
      })
      .assert.elementCount('.poly:not(.previousStory)', 1)
      .checkForErrors()
      .end();
  },
  'in-progress spaces should not capture clicks': (browser) => {
    withScales(failOnError(browser))
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan svg')
      .getScales()
      .perform((client, done) => {
        const x0 = -50, y0 = 50;
        console.log(`moving to ${client.xScale(x0)}, ${client.yScale(y0)}`);
        client
          .waitForElementVisible('#grid svg', 200)
          .pause(10)
          .moveToElement('#grid svg', client.xScale(x0), client.yScale(y0))
          .pause(10)
          .mouseButtonClick()
          .pause(10)
          .moveToElement('#grid svg', client.xScale(x0 + 50), client.yScale(y0 - 50))
          .pause(10)
          .moveToElement('#grid svg', client.xScale(x0 + 48), client.yScale(y0 - 48))
          .mouseButtonClick();

        done();
      })
      .keys([browser.Keys.ESCAPE])
      .assert.elementCount('.poly', 1)
      .checkForErrors()
      .end();
  },
  'switch to shading and back, preserve selected space': (browser) => {
    const devServer = browser.globals.devServerURL;

    failOnError(browser)
      .url(devServer)
      .resizeWindow(1000, 800)
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan svg')
      .click('.editable-select-list .controls select option[value="shading"]')
      .click('.editable-select-list .controls select option[value="spaces"]')
      .assert.elementCount('[data-object-type="spaces"] .active', 1)
      .checkForErrors()
      .end();
  },
  'switch between floors, preserve selected space': (browser) => {
    const devServer = browser.globals.devServerURL;

    failOnError(browser)
      .url(devServer)
      .resizeWindow(1000, 800)
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan svg')
      .click('[data-object-type="spaces"] .add-new')
      .click('[data-object-type="spaces"] .add-new')
       // choose the second one
      .click('[data-object-type="spaces"] .rows > div:nth-child(2)')
      .click('[data-object-type="stories"] .add-new')
      // back to first story
      .click('[data-object-type="stories"] .rows > div:nth-child(1)')
      // the second one should still be selected.
      .assert.elementCount('[data-object-type="spaces"] .rows > div:nth-child(2).active', 1)
      .checkForErrors()
      .end();
  },
  'adding new space selects new space': (browser) => {
    const devServer = browser.globals.devServerURL;

    failOnError(browser)
      .url(devServer)
      .resizeWindow(1000, 800)
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan svg')
      .click('[data-object-type="spaces"] .add-new')
      .assert.elementCount('[data-object-type="spaces"] .rows > div:nth-child(2).active', 1)
      .checkForErrors()
      .end();
  },
  'no text for empty polygons': (browser) => {
    withScales(failOnError(browser))
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan svg')
      .getScales() // assigns to client.xScale, client.yScale.
      // unfortunately, it does so asyncronously, so we have to use .perform()
      // if we want to access them.
      .perform(draw50By50Square)
      .click('.tools [data-tool="Eraser"]')
      .perform((client, done) => {
        client
        .moveToElement('#grid svg', client.xScale(-55), client.yScale(-5))
        .pause(10)
        .mouseButtonClick()
        .pause(10)
        .moveToElement('#grid svg', client.xScale(5), client.yScale(55))
        .pause(10)
        .mouseButtonClick()
        .pause(10)
        .assert.elementCount('.poly', 0);
        done();
      })
      .checkForErrors()
      .end();
  },
  'switch to images, add story. should still be on images': (browser) => {
    const devServer = browser.globals.devServerURL;

    failOnError(browser)
      .url(devServer)
      .resizeWindow(1000, 800)
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan svg')
      .click('.editable-select-list .controls select option[value="images"]')
      .click('[data-object-type="stories"] .add-new')
      .assert.value('#navigation .editable-select-list .controls select', 'images')
      .checkForErrors()
      .end();
  },
  'split then cover edge has weird slanty thing': (browser) => {
    withScales(failOnError(browser))
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan svg')
      .getScales()
      .perform(draw50By50Square)
      .click('.tools [data-tool="Rectangle"]')
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(-10, 50, 10, 10))
      .click('[data-object-type="spaces"] .add-new')
      .perform(drawSquare(-55, 40, 30, 20))
      .execute(() => window.application.$store.state.geometry[0], [], ({ value }) => {
        const { faces, edges } = value,
          edgesConnect = (face) => {
            face.edges = face.edgeRefs.map(e => ({ ...e, ..._.find(edges, { id: e.edge_id }) }));
            _.zip(face.edges.slice(0, -1), face.edges.slice(1))
              .forEach(([e1, e2]) => {
                const
                  e1End = e1.reverse ? e1.v1 : e1.v2,
                  e2Start = e2.reverse ? e2.v2 : e2.v1;
                browser.assert.equal(e1End, e2Start);
              });
          };
        faces.forEach(edgesConnect);
      })
      .checkForErrors()
      .end();
  },
};
