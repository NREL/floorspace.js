import { check, property } from 'testcheck';


export function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

export function nearlyEqual(a, b, epsilon = 0.000001) {
  return Math.abs(a - b) <= epsilon;
}

export function assertProperty(...args) {
  console.log('assertProperty args', args);
  const resp = check(property(...args));
  console.log('resp', resp);
  assert(resp.result, `Property failed to verify! ${JSON.stringify(resp)}`);
}
