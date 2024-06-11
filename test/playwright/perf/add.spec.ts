import { test, expect, type Page } from '@playwright/test';
import * as d3 from 'd3';
import path from 'path';

const smallPlan = './datasets/smallPlan.json';
const largePlan = './datasets/largePlan.json';
const largeShatteredPlan = './datasets/largeShatteredPlan.json';

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

  const xScale = d3
    .scaleLinear()
    .domain(scaleData.xDomain)
    .range([0, scaleData.xPixels])
    .interpolate(d3.interpolateRound);

  const yScale = d3
    .scaleLinear()
    .domain(scaleData.yDomain)
    .range([0, scaleData.yPixels])
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

const largePlanPoints1 = [
  {
    x: -169,
    y: 337,
    type: 'grid',
    dist: 0.491238708842906,
    dx: 0.40091413646999285,
    dy: -0.2838720208899872,
  },
  {
    x: -32,
    y: 337,
  },
  {
    x: -32,
    y: 147,
    type: 'grid',
    dist: 0.40612114085573714,
    dx: -0.3111328762700012,
    dy: -0.261018609209998,
  },
  {
    x: -169,
    y: 147,
  },
];

const largePlanPoints2 = [
  {
    id: '64845567',
    x: 230,
    y: -28,
    edge_ids: ['64845570', '64845571'],
    type: 'vertex',
    dist: 0.5116068462426753,
    dx: 0.3529219719200114,
    dy: -0.37038850800000134,
  },
  {
    x: 107,
    y: -28,
  },
  {
    x: 107,
    y: -87,
    type: 'grid',
    dist: 0.28119842453159277,
    dx: 0.28077048644999536,
    dy: -0.015507672219996493,
  },
  {
    x: 230,
    y: -87,
  },
];

const smallPlanPoints1 = [
  {
    x: -140,
    y: 145,
    type: 'grid',
    dist: 1.2770727576517884,
    dx: -1.1279791054500095,
    dy: 0.5988137991099904,
  },
  {
    x: -65,
    y: 145,
  },
  {
    x: -65,
    y: 100,
    type: 'grid',
    dist: 1.6528012335113755,
    dx: -1.3102622701100017,
    dy: 1.0074545652399962,
  },
  {
    x: -140,
    y: 100,
  },
];
const smallPlanPoints2 = [
  {
    x: -130,
    y: 10,
    type: 'grid',
    dist: 0.36424671653788915,
    dx: 0.2443138535199978,
    dy: -0.27015997388000024,
  },
  {
    x: 20,
    y: 10,
  },
  {
    x: 20,
    y: -25,
    type: 'grid',
    dist: 0.478506567033525,
    dx: 0.4782892588999985,
    dy: 0.014419414519998952,
  },
  {
    x: -130,
    y: -25,
  },
];

test('small plan', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.setInputFiles('#importInput', path.join(__dirname, smallPlan));

  // prefer interact with the UI instead of testing implementation
  await page.evaluate(({ smallPlanPoints1 }) => {
    const spaceLibrary = window.spaceLibrary;

    spaceLibrary.createObject();

    let modelId =
      spaceLibrary.currentStory.spaces[
      spaceLibrary.currentStory.spaces.length - 1
        ].id;

    window.application.$store.dispatch('geometry/createFaceFromPoints', {
      points: smallPlanPoints1,
      model_id: modelId,
    });

    return {};
  }, { smallPlanPoints1 });

  await page.waitForTimeout(100);

  const result = await page.evaluate(() => {
    const spaceLibrary = window.spaceLibrary;

    spaceLibrary.createObject();
    let modelId =
      spaceLibrary.currentStory.spaces[
      spaceLibrary.currentStory.spaces.length - 1
        ].id;

    return {
      modelId,
    };
  });

  const t0 = performance.now();

  await page.evaluate(({ smallPlanPoints2, modelId }) => {
    window.application.$store.dispatch('geometry/createFaceFromPoints', {
      points: smallPlanPoints2,
      model_id: modelId,
    });
  }, { smallPlanPoints2, modelId: result.modelId });

  const t1 = performance.now();

  console.log(
    JSON.stringify({
      filter_key: 'performance-test',
      message: `Space addition performance (small plan): ${t1 - t0}`,
    }),
  );
});

test('large shattered plan', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  await page.setInputFiles('#importInput', path.join(__dirname, largeShatteredPlan));

  // prefer interact with the UI instead of testing implementation
  await page.evaluate(({ largePlanPoints1 }) => {
    const spaceLibrary = window.spaceLibrary;

    spaceLibrary.createObject();

    let modelId =
      spaceLibrary.currentStory.spaces[
      spaceLibrary.currentStory.spaces.length - 1
        ].id;

    window.application.$store.dispatch('geometry/createFaceFromPoints', {
      points: largePlanPoints1,
      model_id: modelId,
    });

    return {};
  }, { largePlanPoints1 });

  await page.waitForTimeout(100);

  const result = await page.evaluate(() => {
    const spaceLibrary = window.spaceLibrary;

    spaceLibrary.createObject();
    let modelId =
      spaceLibrary.currentStory.spaces[
      spaceLibrary.currentStory.spaces.length - 1
        ].id;

    return {
      modelId,
    };
  });

  const t0 = performance.now();

  await page.evaluate(({ largePlanPoints2, modelId }) => {
    window.application.$store.dispatch('geometry/createFaceFromPoints', {
      points: largePlanPoints2,
      model_id: modelId,
    });
  }, { largePlanPoints2, modelId: result.modelId });

  const t1 = performance.now();

  console.log(
    JSON.stringify({
      filter_key: 'performance-test',
      message: `Space addition performance (large shattered plan): ${t1 - t0}`,
    }),
  );
});
