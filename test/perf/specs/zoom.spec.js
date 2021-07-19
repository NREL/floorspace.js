import { create, loadFloorPlan, sleep, tearDown } from './helper';

import * as smallPlan from '../datasets/smallPlan.json';
import * as largePlan from '../datasets/largePlan.json';
import * as largeShatteredPlan from '../datasets/largeShatteredPlan.json';

describe('Zoom performance', () => {
  const zoomOut = new WheelEvent('wheel', { deltaY: 100 });
  const zoomIn = new WheelEvent('wheel', { deltaY: -100 });

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

  beforeEach( async() => {
    create();
    await sleep();
  });

  afterEach(async () => {
    tearDown();
    await sleep();
  });

  it('large plan', async() => {
    await loadFloorPlan(largePlan);

    const svgGrid = document.getElementById('svg-grid');
    const t0 = performance.now();
    for (let event of events) {
      svgGrid.dispatchEvent(event);
      await sleep();
    }
    const t1 = performance.now();

    console.log(JSON.stringify({filter_key: 'performance-test', message: `Zoom performance (large plan): ${t1 - t0}`}));
  }).timeout(99999999);

  it('small plan', async() => {
    await loadFloorPlan(smallPlan);

    const svgGrid = document.getElementById('svg-grid');
    const t0 = performance.now();
    for (let event of events) {
      svgGrid.dispatchEvent(event);
      await sleep();
    }
    const t1 = performance.now();

    console.log(JSON.stringify({filter_key: 'performance-test', message: `Zoom performance (small plan): ${t1 - t0}`}));
  }).timeout(99999999);

  it('large shattered plan', async() => {
    await loadFloorPlan(largeShatteredPlan);

    const svgGrid = document.getElementById('svg-grid');
    const t0 = performance.now();
    for (let event of events) {
      svgGrid.dispatchEvent(event);
      await sleep();
    }
    const t1 = performance.now();

    console.log(JSON.stringify({filter_key: 'performance-test', message: `Zoom performance (large shattered plan): ${t1 - t0}`}));
  }).timeout(99999999);
});
