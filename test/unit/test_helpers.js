import _ from 'lodash';
import { check, property, gen } from 'testcheck';
import helpers from '../../src/store/modules/geometry/helpers';


export function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

export function assertEqual(a, b) {
  assert(
    _.isEqual(a, b),
    `expected ${JSON.stringify(a)} to equal ${JSON.stringify(b)}`);
}

export function refute(condition, ...args) {
  return assert(!condition, ...args);
}

export function nearlyEqual(a, b, epsilon = 0.000001) {
  return Math.abs(a - b) <= epsilon;
}

export function assertProperty(...args) {
  // if last parameter is not a function, assume it's config for call to check()
  const checkConfig = _.isFunction(args[args.length - 1]) ? {} : args.pop();

  let resp = check(property(...args), checkConfig);
  if (resp.result instanceof Error) {
    resp = resp.shrunk || resp;
    console.error(`${resp.result}`);
    console.error(
      `Property failed to verify on input: ${JSON.stringify(resp.smallest || resp.fail)}`);
    throw resp.result;
  }
  assert(resp.result, `Property failed to verify! ${JSON.stringify(resp)}`);
}

export function isNearlyEqual(obj, oth) {
  return _.isEqualWith(obj, oth, (val, othVal) => {
    if (_.isNumber(val) && _.isNumber(othVal)) {
      return nearlyEqual(val, othVal);
    }
    return undefined;
  });
}

export const genPoint = gen.object({ x: gen.int, y: gen.int });

export const
  genPointLeftOfOrigin = gen.object({ x: gen.sNegInt, y: gen.int }),
  genTriangleLeftOfOrigin = gen.array(genPointLeftOfOrigin, { size: 3 })
    .suchThat(pts => !helpers.ptsAreCollinear(...pts)),
  genPointRightOfOrigin = gen.object({ x: gen.sPosInt, y: gen.int }),
  genTriangleRightOfOrigin = gen.array(genPointRightOfOrigin, { size: 3 })
    .suchThat(pts => !helpers.ptsAreCollinear(...pts)),
  genTriangle = gen.array(genPoint, { size: 3 })
    .suchThat(pts => !helpers.ptsAreCollinear(...pts));


export const genRectilinearRectangle = gen.array(genPoint, { size: 2 })
  .suchThat(([v1, v2]) => (v1.x !== v2.x && v1.y !== v2.y))
  .then(([v1, v2]) => (
    [
      v1,
      { x: v1.x, y: v2.y },
      v2,
      { x: v2.x, y: v1.y },
    ]
  ));

export const createIrregularPolygon = ({ center, radii }) => {
  const angleStep = (2 * Math.PI) / radii.length;

  return radii
    .map((radius, n) => ({
      x: center.x + (radius * Math.sin(n * angleStep)),
      y: center.y + (radius * Math.cos(n * angleStep)),
    }));
};

export const genRectangle = gen.oneOf([
  // boring old rectangles aligned with coordinate axes
  genRectilinearRectangle,
  // and square diamonds!
  gen.object({
    center: genPoint,
    radii: gen.intWithin(5, 100)
      .then(radius => _.range(4).map(_.constant(radius))),
  })
  .then(createIrregularPolygon),
]);

export const genIrregularPolygonPieces = gen.object({
  center: genPoint,
  radii: gen.array(gen.intWithin(5, 100), { minSize: 3, maxSize: 20 }),
});

export const genIrregularPolygon = genIrregularPolygonPieces
.then(createIrregularPolygon);

export const genRegularPolygon = gen.object({
  center: genPoint,
  radius: gen.intWithin(5, 100),
  numEdges: gen.intWithin(3, 20),
})
.then(({ center, radius, numEdges }) => createIrregularPolygon({
  radii: _.range(numEdges).map(_.constant(radius)),
  center,
}));
