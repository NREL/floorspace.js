import { test, expect, type Page } from '@playwright/test';
import * as d3 from 'd3';

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

const assertValidGeometry = async (page: Page) => {
  const errors = await page.evaluate(() => {
    return window.application.$store.getters['geometry/errors']
  });

  expect(errors).toHaveLength(0);
}

test('interior wall must remain interior after erasing', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await drawSquare(
    page,
    { x0: 30, y0: 25, width: 50, height: -50 },
    xScale,
    yScale,
  );

  expect(await page.$$('.wall.interior')).toHaveLength(0);

  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: 30, y0: 25, width: 50, height: 50 },
    xScale,
    yScale,
  );

  expect(await page.$$('.wall.interior')).toHaveLength(1);

  await page.click('[data-tool="Eraser"]');

  await drawSquare(
    page,
    { x0: 30, y0: 25, width: 30, height: 10 },
    xScale,
    yScale,
  );

  expect(await page.$$('.wall.interior')).toHaveLength(1);

  await assertValidGeometry(page);
});

test('deformity that scott found (issue #301)', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await draw50By50Square(page, xScale, yScale);

  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: -40, y0: 55, width: 30, height: -30 },
    xScale,
    yScale,
  );
  await drawSquare(
    page,
    { x0: -30, y0: 25, width: 20, height: -10 },
    xScale,
    yScale,
  );
  await drawSquare(
    page,
    { x0: -30, y0: 15, width: -10, height: 10 },
    xScale,
    yScale,
  );

  await assertValidGeometry(page);
});

test('interior walls should be interior', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await drawSquare(
    page,
    { x0: 30, y0: 25, width: 50, height: -50 },
    xScale,
    yScale,
  );

  expect(await page.$$('.wall.interior')).toHaveLength(0);

  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: 30, y0: 25, width: 50, height: 50 },
    xScale,
    yScale,
  );

  expect(await page.$$('.wall.interior')).toHaveLength(1);

  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: 0, y0: 0, width: 30, height: 50 },
    xScale,
    yScale,
  );

  expect(await page.$$('.wall.interior')).toHaveLength(3);

  await assertValidGeometry(page);
});

test('drawing overlapping polygon should not duplicate vertices', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await draw50By50Square(page, xScale, yScale);

  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: 0, y0: 50, width: 20, height: -20 },
    xScale,
    yScale,
  );

  await page.click('[data-object-type="spaces"] .rows > div:nth-child(1)');

  await drawSquare(
    page,
    { x0: 0, y0: 50, width: 10, height: -30 },
    xScale,
    yScale,
  );

  await assertValidGeometry(page);
});

test('duplicate edge case (issue #253)', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await draw50By50Square(page, xScale, yScale);

  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: 0, y0: 65, width: 20, height: -25 },
    xScale,
    yScale,
  );

  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: 20, y0: 20, width: -20, height: -20 },
    xScale,
    yScale,
  );

  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: 0, y0: 20, width: 20, height: -25 },
    xScale,
    yScale,
  );

  await page.click('[data-object-type="spaces"] .rows > div:nth-child(1)');

  await drawSquare(
    page,
    { x0: 0, y0: 50, width: 10, height: -40 },
    xScale,
    yScale,
  );

  await assertValidGeometry(page);
});

test('combine edges when extending an existing space (issue #253)', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await draw50By50Square(page, xScale, yScale);

  await drawSquare(
    page,
    { x0: -50, y0: 50, width: 50, height: 50 },
    xScale,
    yScale,
  );

  expect(await page.$$('.wall.exterior')).toHaveLength(4);
});

test('cloning a space correctly clones all properties(issue #178)', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await draw50By50Square(page, xScale, yScale);

  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(
    page,
    { x0: -50, y0: 50, width: 150, height: 50 },
    xScale,
    yScale,
  );

  await page.click('.duplicate');

  await expect(page.locator('[data-object-type="stories"] .rows div:nth-child(1)')).toHaveText('Story 1');

  await expect(page.locator('[data-object-type="stories"] .rows .active')).toHaveText('Story 2');

  const rowsLocator = page.locator('[data-object-type="spaces"] .rows');

  await expect(rowsLocator).toContainText('Space 2 - 1');
  await expect(rowsLocator).toContainText('Space 2 - 2');


    const polygonsLocator = page.locator('[data-object-type="spaces"] .rows');

  await expect(polygonsLocator).toContainText('Space 2 - 1');
  await expect(polygonsLocator).toContainText('Space 2 - 2');

});
