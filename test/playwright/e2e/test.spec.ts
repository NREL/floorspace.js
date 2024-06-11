import { test, expect, type Page } from '@playwright/test';
import * as d3 from 'd3';
import _ from 'lodash';

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

  await page.click('.modal .new-floorplan svg');

  const { xScale, yScale } = await getScaleData(page);

  return {
    xScale,
    yScale,
  };
};

// reimplement failOnError
test('failOnError causes failure', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);
});

test('make space and new story', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await draw50By50Square(page, xScale, yScale);

  await page.click('[data-object-type="stories"] .add-new');

  const strokeDashArray = await page.$eval('.previousStory polygon', (el) =>
    getComputedStyle(el).getPropertyValue('stroke-dasharray'),
  );
  expect(strokeDashArray).toContain('1px, 4px');

  const fillOpacity = await page.$eval('.previousStory polygon', (el) =>
    getComputedStyle(el).getPropertyValue('fill-opacity'),
  );
  expect(fillOpacity).toEqual('0.3');
});

test('fill space to next story', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await draw50By50Square(page, xScale, yScale);

  await page.click('[data-object-type="stories"] .add-new');

  await page.click('.tools [data-tool="Fill"]');

  await page.hover('#grid svg');
  await page.mouse.click(xScale(-25), yScale(25));

  // expect failing
  expect(await page.$$('.poly:not(.previousStory)')).toHaveLength(1);
});

test('in-progress spaces should not capture clicks', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  const x0 = -50;
  const y0 = 50;

  await page.hover('#grid svg');
  await page.mouse.click(xScale(x0), yScale(y0));
  await page.mouse.click(xScale(x0 + 50), yScale(y0 - 50));
  await page.mouse.click(xScale(x0 + 48), yScale(y0 - 48));

  await page.keyboard.press('Escape');

  expect(await page.$$('.poly')).toHaveLength(1);
});

test('switch to shading and back, preserve selected space', async ({
  page,
}) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.selectOption('.editable-select-list .controls select', {
    value: 'shading',
  });

  await page.selectOption('.editable-select-list .controls select', {
    value: 'spaces',
  });

  expect(await page.$$('[data-object-type="spaces"] .active')).toHaveLength(1);
});

test('switch between floors, preserve selected space', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.click('[data-object-type="spaces"] .add-new');
  await page.click('[data-object-type="spaces"] .add-new');

  // choose the second one
  await page.click('[data-object-type="spaces"] .rows > div:nth-child(2)');
  await page.click('[data-object-type="stories"] .add-new');

  // back to first story
  await page.click('[data-object-type="stories"] .rows > div:nth-child(1)');

  expect(
    await page.$$(
      '[data-object-type="spaces"] .rows > div:nth-child(2).active',
    ),
  ).toHaveLength(1);
});

test('adding new space selects new space', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.click('[data-object-type="spaces"] .add-new');

  expect(
    await page.$$(
      '[data-object-type="spaces"] .rows > div:nth-child(2).active',
    ),
  ).toHaveLength(1);
});

test('no text for empty polygons', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await draw50By50Square(page, xScale, yScale);

  await page.click('.tools [data-tool="Eraser"]');

  await page.hover('#grid svg');
  await page.mouse.click(xScale(-55), yScale(-5));
  await page.mouse.click(xScale(5), yScale(55));

  expect(await page.$$('.poly')).toHaveLength(0);
});

test('switch to images, add story. should still be on images', async ({
  page,
}) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.selectOption('.editable-select-list .controls select', {
    value: 'images',
  });

  await page.click('[data-object-type="stories"] .add-new');

  await expect(
    page.locator('#navigation .editable-select-list .controls select'),
  ).toHaveValue('images');
});

test('split then cover edge has weird slanty thing', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await draw50By50Square(page, xScale, yScale);

  await page.click('.tools [data-tool="Rectangle"]');
  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: -10, y0: 50, width: 10, height: 10 },
    xScale,
    yScale,
  );

  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: -55, y0: 40, width: 30, height: 20 },
    xScale,
    yScale,
  );

  const value = await page.evaluate(() => {
    return window.application.$store.state.geometry[0];
  });

  const { faces, edges } = value;
  const edgesConnect = (face) => {
    face.edges = face.edgeRefs.map((e) => ({
      ...e,
      ..._.find(edges, { id: e.edge_id }),
    }));
    _.zip(face.edges.slice(0, -1), face.edges.slice(1)).forEach(([e1, e2]) => {
      const e1End = e1.reverse ? e1.v1 : e1.v2,
        e2Start = e2.reverse ? e2.v2 : e2.v1;
      expect(e1End).toBe(e2Start);
    });
  };
  faces.forEach(edgesConnect);
});
