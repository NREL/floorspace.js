import { test, expect, type Page } from '@playwright/test';
import * as d3 from 'd3';

async function setFlagOnError(page) {
  await page.evaluate(() => {
    window.errorOccurred = false;
    window.addEventListener('error', () => {
      window.errorOccurred = true;
    });
  });
}

async function checkForErrors(page) {
  const errorOccurred = await page.evaluate(() => window.errorOccurred);

  console.log({
    errorOccurred
  });

  expect(errorOccurred).toBe(false);
}

async function assertErrorOccurred(page) {
  const logs = await page.context().pages()[0].evaluate(() => window.console.log());
  const errors = logs.filter(log => log.type === 'error');

  console.assert(errors.length > 0, 'No errors were found in the logs');
}

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

  return {
    xScale,
    yScale,
  }
}

// 50, 40 causes timeout
test('lotsa floors', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await setFlagOnError(page);

  await drawSquare(
    page,
    { x0: 0, y0: 0, width: 50, height: 50 },
    xScale,
    yScale,
  );

  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: 0, y0: 0, width: -50, height: 50 },
    xScale,
    yScale,
  );

  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: 0, y0: 0, width: -50, height: -50 },
    xScale,
    yScale,
  );

  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: 0, y0: 0, width: 50, height: -50 },
    xScale,
    yScale,
  );

  await page.click('[data-tool="Fill"]');

  // const n = 50;
  // const n = 40;
  const n = 30;

  for (const i of Array.from({ length: n }, (_, index) => index)) {
    console.log('iteration', i);
    await page.click('[data-object-type="stories"] .add-new');

    expect(await page.$$('.poly.previousStory')).toHaveLength(4);

    await page.hover('#grid svg');
    await page.mouse.click(xScale(25), yScale(25));

    await page.click('[data-object-type="spaces"] .add-new');
    await page.hover('#grid svg');
    await page.mouse.click(xScale(-25), yScale(25));

    await page.click('[data-object-type="spaces"] .add-new');
    await page.hover('#grid svg');
    await page.mouse.click(xScale(-25), yScale(-25));

    await page.click('[data-object-type="spaces"] .add-new');
    await page.hover('#grid svg');
    await page.mouse.click(xScale(25), yScale(-25));
  }

  await checkForErrors(page);
});
