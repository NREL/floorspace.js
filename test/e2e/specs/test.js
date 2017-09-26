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
        window.application.$store.state.geometry[0].vertices.splice(1);
      })
      .assertErrorOccurred()
      .end();
  },
  'make space and new story': (browser) => {
    withScales(failOnError(browser))
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan')
      .getScales() // assigns to client.xScale, client.yScale.
      // unfortunately, it does so asyncronously, so we have to use .perform()
      // if we want to access them.
      .perform(draw50By50Square)
      .perform((client, done) => {
        client.click('.create-story')
        .pause(10);

        done();
      })
      .perform((client, done) => {
        client.expect.element('.previousStory polygon')
          .to.have.css('stroke-dasharray').which.contains('10');
        client.expect.element('.previousStory polygon')
          .to.have.css('fill-opacity').which.equals('0.3');
        done();
      })
      .checkForErrors()
      .end();
  },
  'switch to spacing and back, preserve selected space': (browser) => {
    const devServer = browser.globals.devServerURL;

    failOnError(browser)
      .url(devServer)
      .resizeWindow(1000, 800)
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan')
      .click('#navigation #selections select option[value="shading"]')
      .click('.add-sub-selection')
      .click('#navigation #selections select option[value="spaces"]')
      .assert.elementCount('#subselection-list .active', 1)
      .checkForErrors()
      .end();
  },
  'no text for empty polygons': (browser) => {
    withScales(failOnError(browser))
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan')
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
      .click('.modal .new-floorplan')
      .click('#navigation #selections select option[value="images"]')
      .click('.create-story')
      .assert.value('#navigation #selections select', 'images')
      .checkForErrors()
      .end();
  },
  'split then cover edge has weird slanty thing': (browser) => {
    withScales(failOnError(browser))
      .waitForElementVisible('.modal .new-floorplan', 5000)
      .setFlagOnError()
      .click('.modal .new-floorplan')
      .getScales()
      .perform(draw50By50Square)
      .click('.tools [data-tool="Rectangle"]')
      .click('#selections .add-sub-selection')
      .perform(drawSquare(-10, 50, 10, 10))
      .click('#selections .add-sub-selection')
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
