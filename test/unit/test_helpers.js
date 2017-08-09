import _ from 'lodash';
import { check, property, gen } from 'testcheck';


export function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

export function refute(condition, ...args) {
  return assert(!condition, ...args);
}

export function nearlyEqual(a, b, epsilon = 0.000001) {
  return Math.abs(a - b) <= epsilon;
}

export function assertProperty(...args) {
  let resp = check(property(...args));
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
