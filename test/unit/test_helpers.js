export function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
};

export function nearlyEqual(a, b, epsilon = 0.000001) {
  return Math.abs(a - b) <= epsilon;
}
