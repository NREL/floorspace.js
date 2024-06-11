import { test, expect, type Page } from '@playwright/test';
import * as d3 from 'd3';

type DrawSquare = {
  x0: number;
  y0: number;
  width: number;
  height: number;
}
const drawSquare = async (page: Page,  square: DrawSquare, xScale: d3.ScaleLinear<number, number>, yScale: d3.ScaleLinear<number, number>) => {
  const { x0, y0, width, height } = square;

  await page.mouse.click(xScale(x0), yScale(y0));
  await page.mouse.click(xScale(x0 + width), yScale(y0 + height));
}

const draw50By50Square = (page: Page, xScale: d3.ScaleLinear<number, number>, yScale: d3.ScaleLinear<number, number>) => {
  return drawSquare(page, { x0: -50, y0: 0, width: 50, height: 50 }, xScale, yScale);
}

type ReturnScaleData = {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
}
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
  }
}

const beforeEachSetup = async (page: Page) => {
  await page.goto('http://localhost:8080/');

  await page.waitForSelector('.modal .new-floorplan svg', { state: 'visible' });

  await page.click('.modal .new-floorplan svg');

  const { xScale, yScale } = await getScaleData(page);

  await draw50By50Square(page, xScale, yScale);

  await page.click('[data-modetab="components"]');
  await page.click('[data-object-type="window_definitions"] .add-new');

  await page.hover('#grid svg');
  await page.mouse.click(xScale(-40), yScale(50));
  await page.click('[data-modetab="floorplan"]');

  return {
    xScale,
    yScale,
  }
}

test('deleting space should remove windows on its edges', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.click('[data-modetab="components"]');
  await page.click('[data-object-type="window_definitions"] [title="expand"]');

  await page.selectOption('[data-column="window_definition_mode"] .input-select .pretty-select', {
    value: 'Repeating Windows',
  });
  expect(await page.$$('.window')).toHaveLength(1);
  //await page.click('[data-column="window_definition_mode"] option[value="Repeating Windows"]');
  await page.click('[data-modetab="floorplan"]');
  await page.click('[data-column="Space 1 - 1"] .destroy');
  expect(await page.$$('.window')).toHaveLength(0);
});

test('modifying edge preserves windows', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.click('.tools [data-tool="Rectangle"]');

  await drawSquare(
    page,
    { x0: -10, y0: 50, width: 10, height: 10 },
    xScale,
    yScale,
  );

  expect(await page.$$('.window')).toHaveLength(1);
});

test('replacing section of space moves window to new space', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.click('.tools [data-tool="Rectangle"]');
  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: -50, y0: 0, width: 30, height: 50 },
    xScale,
    yScale,
  );

  expect(await page.$$('.window')).toHaveLength(1);
});

test('splitting edge preserves windows', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.click('.tools [data-tool="Rectangle"]');
  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: -10, y0: 50, width: 10, height: 10 },
    xScale,
    yScale,
  );

  expect(await page.$$('.window')).toHaveLength(1);
});

test('covering edge removes windows', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.click('.tools [data-tool="Rectangle"]');
  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: -55, y0: 40, width: 30, height: 20 },
    xScale,
    yScale,
  );

  expect(await page.$$('.window')).toHaveLength(0);
});

test('windows on exterior edges that become interior should be removed', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.click('.tools [data-tool="Rectangle"]');
  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: -50, y0: 50, width: 50, height: 10 },
    xScale,
    yScale,
  );

  expect(await page.$$('.window')).toHaveLength(0);
});

test('windows on exterior edges that become interior should be removed (partial overlap)', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.click('.tools [data-tool="Rectangle"]');
  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: -50, y0: 50, width: 40, height: 10 },
    xScale,
    yScale,
  );

  expect(await page.$$('.window')).toHaveLength(0);
});
