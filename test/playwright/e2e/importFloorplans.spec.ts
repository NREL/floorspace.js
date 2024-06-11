import { test, expect, type Page } from '@playwright/test';
import * as d3 from 'd3';
import path from 'path';
import fs from 'fs';
import schema from '../../../schema/geometry_schema.json';
import Ajv from "ajv-draft-04";
import util from 'util';

const readFile = util.promisify(fs.readFile);

const downloads = path.join(require('os').homedir(), 'Downloads');
const exported = path.join(downloads, 'floorplan_nightwatch_exported.json');
const exported_threejs = path.join(downloads, 'floorplan_nightwatch_exported_threejs.json');

const ajv = new Ajv({ allErrors: true, strictSchema: false });

function deleteFloorplan() {
  if (fs.existsSync(exported)) {
    fs.unlinkSync(exported);
  }
}

function deleteThreeJS() {
  if (fs.existsSync(exported_threejs)) {
    fs.unlinkSync(exported_threejs);
  }
}

const assertValidSchema = async () => {
  const data = await readFile(exported, 'utf8');

  console.log({
    data,
  });

  const valid = ajv.validate(schema, JSON.parse(data));

  expect(valid).toBe(true);
}

type DrawSquare = {
  x0: number;
  y0: number;
  width: number;
  height: number;
};
const drawSquare = async (
  page: Page,
  square: DrawSquare,
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>,
) => {
  const { x0, y0, width, height } = square;

  await page.mouse.click(xScale(x0), yScale(y0));
  await page.mouse.click(xScale(x0 + width), yScale(y0 + height));
};

const draw50By50Square = (
  page: Page,
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>,
) => {
  return drawSquare(
    page,
    { x0: -50, y0: 0, width: 50, height: 50 },
    xScale,
    yScale,
  );
};

type ReturnScaleData = {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
};
const getScaleData = async (page: Page): Promise<ReturnScaleData> => {
  const scaleData = await page.evaluate(() => {
    // This code runs in the browser context
    return {
      scale: window.application.$store.state.application.scale,
      xDomain: window.application.$store.state.application.scale.x.rwuRange,
      xPixels: window.application.$store.state.application.scale.x.pixels,
      yDomain: window.application.$store.state.application.scale.y.rwuRange,
      yPixels: window.application.$store.state.application.scale.y.pixels,
    };
  });

  const gridRect = await page.locator('#grid svg').evaluate(element => element.getBoundingClientRect());

  const xScale = d3
    .scaleLinear()
    .domain(scaleData.xDomain)
    .range([gridRect.left, gridRect.right])
    .interpolate(d3.interpolateRound);

  const yScale = d3
    .scaleLinear()
    .domain(scaleData.yDomain)
    .range([gridRect.bottom, gridRect.top])
    .interpolate(d3.interpolateRound);

  return {
    xScale,
    yScale,
  };
};

const beforeEachSetup = async (page: Page) => {
  await page.goto('http://localhost:8080/');

  await page.waitForSelector('.modal .new-floorplan svg', { state: 'visible' });

  const { xScale, yScale } = await getScaleData(page);

  return {
    xScale,
    yScale,
  };
};

const oldFloorplans = [
  './fixtures/floorplan-2017-08-31.json',
  './fixtures/floorplan_two_story_2017_11_28.json',
  './fixtures/floorplan_two_story_2018_01_17.json',
];

test('import succeeds, export is updated to be valid against schema', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  for (const floorplan of oldFloorplans) {
    await page.reload();

    await page.waitForSelector('.modal .new-floorplan svg', { state: 'visible' });

    await page.setInputFiles('#importInput', path.join(__dirname, floorplan));

    await page.waitForSelector('#grid svg polygon', { state: 'visible' });

    deleteFloorplan();

    await page.click('[title="Save Floorplan"]');

    await page.waitForSelector('#download-name', { state: 'visible', timeout: 100 });

    await page.fill('#download-name', '');

    await page.fill('#download-name', 'floorplan_nightwatch_exported');

    const downloadPromise = page.waitForEvent('download');
    await page.click('.download-button');
    const download = await downloadPromise;
    await download.saveAs(exported);

    assertValidSchema();
  }
});

// missing three.js export
test('floorplan can be exported to three.js', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.click('.modal .new-floorplan svg');

  deleteThreeJS();

  await draw50By50Square(page, xScale, yScale);

  await page.click('[title="Save Floorplan"]');

  await page.waitForSelector('#download-name', { state: 'visible', timeout: 100 });

  await page.click('#export-input-threejs');

  await page.fill('#download-name', '');

  await page.fill('#download-name', 'floorplan_nightwatch_exported_threejs.json');

  const downloadPromise = page.waitForEvent('download');
  await page.click('.download-button');
  const download = await downloadPromise;
  await download.saveAs(exported_threejs);
});

test('project.north_axis new location', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.waitForSelector('.modal .new-floorplan svg', { state: 'visible' });

  // floorplan-2017-08-31.json
  await page.setInputFiles('#importInput', path.join(__dirname, oldFloorplans[0]));

  await page.waitForSelector('#grid svg polygon', { state: 'visible' });

  const northAxis = await page.evaluate(() => {
    return window.application.$store.state.project.north_axis;
  });

  expect(northAxis).toBe(12);

  // Evaluate the config.north_axis value
  const configNorthAxis = await page.evaluate(() => {
    return window.application.$store.state.project.config.north_axis;
  });

  expect(configNorthAxis).toBeUndefined();
});
