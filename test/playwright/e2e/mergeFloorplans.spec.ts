import { test, expect, type Page } from '@playwright/test';
import * as d3 from 'd3';
import path from 'path';

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

const testFloorplanSidesPath = './fixtures/test-floorplan-sides.json';
const testFloorplanDownPath = './fixtures/test-floorplan-down.json';
const testBunchOfStuffPath = './fixtures/bunch-of-stuff.json';
const testFloorplanStockPath = './fixtures/testing-floorplan-stock-photo.json';

test('merging 2 simple floorplans results in a merged floorplan', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.waitForSelector('.modal .new-floorplan svg', { state: 'visible' });

  await page.setInputFiles('#importInput', path.join(__dirname, testFloorplanSidesPath));

  await page.waitForSelector('#grid svg polygon', { state: 'visible' });

  await page.setInputFiles('#toolbarMergeInput', path.join(__dirname, testFloorplanDownPath));

  await page.waitForSelector('#grid svg polygon', { state: 'visible' });

  const rowsLocator = page.locator('[data-object-type="spaces"] .rows');

  await expect(rowsLocator).toContainText('Space 1 - 1 (Imported)');
  await expect(rowsLocator).toContainText('Space 1 - 2 (Imported)');
  await expect(rowsLocator).toContainText('Space 1 - 1 (Original)');
  await expect(rowsLocator).toContainText('Space 1 - 2 (Original)');
  await expect(rowsLocator).toContainText('Space 1 - 3 (Original)');
});

test('merging 2 complex floorplans results in a merged floorplan', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.waitForSelector('.modal .new-floorplan svg', { state: 'visible' });

  await page.setInputFiles('#importInput', path.join(__dirname, testBunchOfStuffPath));

  await page.waitForSelector('#grid svg polygon', { state: 'visible' });

  await page.setInputFiles('#toolbarMergeInput', path.join(__dirname, testFloorplanStockPath));

  await page.waitForSelector('#grid svg polygon', { state: 'visible' });

  const checkTextContent = async (selector, text) => {
    const content = await page.locator(selector);
    await expect(content).toContainText(text);
  };

  await checkTextContent('[data-object-type="spaces"] .rows', 'Space 1 - 1 (Imported)');
  await checkTextContent('[data-object-type="spaces"] .rows', 'Space 1 - 2 (Imported)');
  await checkTextContent('[data-object-type="spaces"] .rows', 'Space 1 - 3 (Imported)');
  await checkTextContent('[data-object-type="spaces"] .rows', 'Space 1 - 1 (Original)');
  await checkTextContent('[data-object-type="spaces"] .rows', 'Space 1 - 2 (Original)');
  await checkTextContent('[data-object-type="spaces"] .rows', 'Space 1 - 3 (Original)');

  await page.selectOption('#navigation .pretty-select', { value: 'shading' });

  await checkTextContent('[data-object-type="shading"] .rows', 'Shading 1 - 1 (Imported)');
  await checkTextContent('[data-object-type="shading"] .rows', 'Shading 1 - 1 (Original)');
  await checkTextContent('[data-object-type="shading"] .rows', 'Shading 1 - 2 (Original)');

  await page.selectOption('#navigation .pretty-select', { value: 'images' });

  await checkTextContent('[data-object-type="images"] .rows', 'Image 1 - 1 (Imported)');
  await checkTextContent('[data-object-type="images"] .rows', 'Image 1 - 1 (Original)');

  await page.click('[data-modetab="assignments"]');

  await checkTextContent('[data-object-type="thermal_zones"] .rows', 'Thermal Zone 1 (Imported)');
  await checkTextContent('[data-object-type="thermal_zones"] .rows', 'Thermal Zone 1 (Original)');

  await page.selectOption('#navigation .pretty-select', { value: 'building_units' });

  await checkTextContent('[data-object-type="building_units"] .rows', 'Building Unit 1 (Imported)');
  await checkTextContent('[data-object-type="building_units"] .rows', 'Building Unit 1 (Original)');

  await page.selectOption('#navigation .pretty-select', { value: 'space_types' });

  await checkTextContent('[data-object-type="space_types"] .rows', 'Space Type 1 (Imported)');
  await checkTextContent('[data-object-type="space_types"] .rows', 'Space Type 1 (Original)');

  await page.selectOption('#navigation .pretty-select', { value: 'pitched_roofs' });

  await checkTextContent('[data-object-type="pitched_roofs"] .rows', 'Pitched Roof 1 (Imported)');
  await checkTextContent('[data-object-type="pitched_roofs"] .rows', 'Pitched Roof 1 (Original)');

  await page.click('[data-modetab="components"]');

  await checkTextContent('[data-object-type="window_definitions"] .rows', 'Window 1 (Original)');
  await checkTextContent('[data-object-type="window_definitions"] .rows', 'Window 1 (Imported)');
  await checkTextContent('[data-object-type="window_definitions"] .rows', 'Window 2 (Imported)');
  await checkTextContent('[data-object-type="window_definitions"] .rows', 'Window 3 (Imported)');

  await page.selectOption('#navigation .pretty-select', { value: 'daylighting_control_definitions' });

  await checkTextContent('[data-object-type="daylighting_control_definitions"] .rows', 'Daylighting Control 1 (Original)');
  await checkTextContent('[data-object-type="daylighting_control_definitions"] .rows', 'Daylighting Control 2 (Original)');
  await checkTextContent('[data-object-type="daylighting_control_definitions"] .rows', 'Daylighting Control 1 (Imported)');

  await page.selectOption('#navigation .pretty-select', { value: 'door_definitions' });

  await checkTextContent('[data-object-type="door_definitions"] .rows', 'Door 1 (Imported)');
  await checkTextContent('[data-object-type="door_definitions"] .rows', 'Door 1 (Original)');
});
