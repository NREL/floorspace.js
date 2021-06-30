import { create, loadFloorPlan, sleep, tearDown } from './helper';

import * as smallPlan from '../datasets/smallPlan.json';
import * as largePlan from '../datasets/largePlan.json';
import * as largeShatteredPlan from '../datasets/largeShatteredPlan.json';

describe('Adding new space performance', () => {

  const largePlanPoints1 = [
    {
      "x": -169,
      "y": 337,
      "type": "grid",
      "dist": 0.491238708842906,
      "dx": 0.40091413646999285,
      "dy": -0.2838720208899872
    },
    {
      "x": -32,
      "y": 337
    },
    {
      "x": -32,
      "y": 147,
      "type": "grid",
      "dist": 0.40612114085573714,
      "dx": -0.3111328762700012,
      "dy": -0.261018609209998
    },
    {
      "x": -169,
      "y": 147
    }
  ], largePlanPoints2 = [
    {
      "id": "64845567",
      "x": 230,
      "y": -28,
      "edge_ids": [
        "64845570",
        "64845571"
      ],
      "type": "vertex",
      "dist": 0.5116068462426753,
      "dx": 0.3529219719200114,
      "dy": -0.37038850800000134
    },
    {
      "x": 107,
      "y": -28
    },
    {
      "x": 107,
      "y": -87,
      "type": "grid",
      "dist": 0.28119842453159277,
      "dx": 0.28077048644999536,
      "dy": -0.015507672219996493
    },
    {
      "x": 230,
      "y": -87
    }
  ];

  const smallPlanPoints1 = [
    {
      "x": -140,
      "y": 145,
      "type": "grid",
      "dist": 1.2770727576517884,
      "dx": -1.1279791054500095,
      "dy": 0.5988137991099904
    },
    {
      "x": -65,
      "y": 145
    },
    {
      "x": -65,
      "y": 100,
      "type": "grid",
      "dist": 1.6528012335113755,
      "dx": -1.3102622701100017,
      "dy": 1.0074545652399962
    },
    {
      "x": -140,
      "y": 100
    }
  ], smallPlanPoints2 = [
    {
      "x": -130,
      "y": 10,
      "type": "grid",
      "dist": 0.36424671653788915,
      "dx": 0.2443138535199978,
      "dy": -0.27015997388000024
    },
    {
      "x": 20,
      "y": 10
    },
    {
      "x": 20,
      "y": -25,
      "type": "grid",
      "dist": 0.478506567033525,
      "dx": 0.4782892588999985,
      "dy": 0.014419414519998952
    },
    {
      "x": -130,
      "y": -25
    }
  ];

  beforeEach(async () => {
    create();
    await sleep();
  });

  afterEach(async () => {
    tearDown();
    await sleep();
  });

  // Cannot create new spaces on this floorplan
  // it('large plan', async() => {
  //   await loadFloorPlan(largePlan);

  //   const libraries = document.getElementsByClassName('editable-select-list');
  //   const spaceLibrary = libraries[1].__vue__.$parent;
  //   spaceLibrary.createObject();
  //   let modelId = spaceLibrary.currentStory.spaces[spaceLibrary.currentStory.spaces.length - 1].id;
  //   let t0 = performance.now();
  //   application.$store.dispatch('geometry/createFaceFromPoints', { points: largePlanPoints1, model_id: modelId });
  //   await sleep();

  //   spaceLibrary.createObject();
  //   modelId = spaceLibrary.currentStory.spaces[spaceLibrary.currentStory.spaces.length - 1].id;
  //   t0 = performance.now();
  //   application.$store.dispatch('geometry/createFaceFromPoints', { points: largePlanPoints2, model_id: modelId });
  //   await sleep();

  //   const t1 = performance.now();

  //   console.log(JSON.stringify({ filter_key: 'performance-test', message: `Space addition performance (large plan): ${t1 - t0}` }));
  // }).timeout(99999999);

  it('small plan', async() => {
    await loadFloorPlan(smallPlan);

    const libraries = document.getElementsByClassName('editable-select-list');
    const spaceLibrary = libraries[1].__vue__.$parent;
    spaceLibrary.createObject();
    let modelId = spaceLibrary.currentStory.spaces[spaceLibrary.currentStory.spaces.length - 1].id;
    let t0 = performance.now();
    application.$store.dispatch('geometry/createFaceFromPoints', { points: smallPlanPoints1, model_id: modelId });
    await sleep();

    spaceLibrary.createObject();
    modelId = spaceLibrary.currentStory.spaces[spaceLibrary.currentStory.spaces.length - 1].id;
    t0 = performance.now();
    application.$store.dispatch('geometry/createFaceFromPoints', { points: smallPlanPoints2, model_id: modelId });
    await sleep();

    const t1 = performance.now();

    console.log(JSON.stringify({ filter_key: 'performance-test', message: `Space addition performance (small plan): ${t1 - t0}` }));
  }).timeout(99999999);

  it('large shattered plan', async () => {
    await loadFloorPlan(largeShatteredPlan);

    const libraries = document.getElementsByClassName('editable-select-list');
    const spaceLibrary = libraries[1].__vue__.$parent;
    spaceLibrary.createObject();
    let modelId = spaceLibrary.currentStory.spaces[spaceLibrary.currentStory.spaces.length - 1].id;
    let t0 = performance.now();
    application.$store.dispatch('geometry/createFaceFromPoints', { points: largePlanPoints1, model_id: modelId });
    await sleep();

    spaceLibrary.createObject();
    modelId = spaceLibrary.currentStory.spaces[spaceLibrary.currentStory.spaces.length - 1].id;
    t0 = performance.now();
    application.$store.dispatch('geometry/createFaceFromPoints', { points: largePlanPoints2, model_id: modelId });
    await sleep();

    const t1 = performance.now();

    console.log(JSON.stringify({ filter_key: 'performance-test', message: `Space addition performance (large shattered plan): ${t1 - t0}` }));
  }).timeout(99999999);
});
