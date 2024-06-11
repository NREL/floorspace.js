import { test, expect, type Page } from '@playwright/test';
import * as d3 from 'd3';
import path from 'path';

const smallPlan = './datasets/smallPlan.json';
const largePlan = './datasets/largePlan.json';
const largeShatteredPlan = './datasets/largeShatteredPlan.json';

const zoomOut = 'zoomOut'
const zoomIn = 'zoomIn';

const events = [
  zoomIn,
  zoomIn,
  zoomIn,
  zoomIn,
  zoomOut,
  zoomOut,
  zoomIn,
  zoomOut,
  zoomIn,
  zoomOut,
  zoomIn,
  zoomOut,
  zoomOut,
  zoomOut,
];

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

test('large plan', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.setInputFiles('#importInput', path.join(__dirname, largePlan));

  const sleep = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

  const t0 = performance.now();
  for (let event of events) {
    await page.evaluate(({ event }) => {
      const svgGrid = document.getElementById('svg-grid');

      const getWheelEvent = () => {
        if (event === 'zoomIn') {
          return new WheelEvent('wheel', { deltaY: -100 });
        }

        return new WheelEvent('wheel', { deltaY: 100 });
      }

      svgGrid.dispatchEvent(getWheelEvent());
    }, { event });

    await sleep();
  }

  const t1 = performance.now();

  console.log(
    JSON.stringify({
      filter_key: 'performance-test',
      message: `Zoom performance (large plan): ${t1 - t0}`,
    }),
  );
});

test('small plan', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.setInputFiles('#importInput', path.join(__dirname, smallPlan));

  const sleep = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

  const t0 = performance.now();
  for (let event of events) {
    await page.evaluate(({ event }) => {
      const svgGrid = document.getElementById('svg-grid');

      const getWheelEvent = () => {
        if (event === 'zoomIn') {
          return new WheelEvent('wheel', { deltaY: -100 });
        }

        return new WheelEvent('wheel', { deltaY: 100 });
      }

      svgGrid.dispatchEvent(getWheelEvent());
    }, { event });

    await sleep();
  }

  const t1 = performance.now();

  console.log(
    JSON.stringify({
      filter_key: 'performance-test',
      message: `Zoom performance (large plan): ${t1 - t0}`,
    }),
  );
});

test('large shattered plan', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.setInputFiles('#importInput', path.join(__dirname, largeShatteredPlan));

  const sleep = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

  const t0 = performance.now();
  for (let event of events) {
    await page.evaluate(({ event }) => {
      const svgGrid = document.getElementById('svg-grid');

      const getWheelEvent = () => {
        if (event === 'zoomIn') {
          return new WheelEvent('wheel', { deltaY: -100 });
        }

        return new WheelEvent('wheel', { deltaY: 100 });
      }

      svgGrid.dispatchEvent(getWheelEvent());
    }, { event });

    await sleep();
  }

  const t1 = performance.now();

  console.log(
    JSON.stringify({
      filter_key: 'performance-test',
      message: `Zoom performance (large plan): ${t1 - t0}`,
    }),
  );
});
