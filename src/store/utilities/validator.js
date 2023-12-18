/*
 * The validator builds a validatedPayload object containing all key/vals that have validation run on them
 * which have not been marked invalid
 * To add key value pairs to the validatedPayload without actually calling a validation method on them
 * provide a validatedPayload argument to the Validator constructor
 */
export default function Validator(payload, validatedPayload = {}) {
  // if a key fails validation, it will be blacklisted so that it is not added to the validatedPayload on a later validation call
  const invalidKeys = [];
  return {
    invalidKeys: invalidKeys,
    validatedPayload: validatedPayload,
    validateLength(key, minLength = 0) {
      if (!(key in payload) || invalidKeys.indexOf(key) !== -1) {
        return;
      }
      if (key in payload && payload[key].length >= minLength) {
        validatedPayload[key] = payload[key];
      } else {
        delete validatedPayload[key];
        invalidKeys.push(key);
      }
    },
    // NOT  inclusive
    validateMin(key, min = 0) {
      if (!(key in payload) || invalidKeys.indexOf(key) !== -1) {
        return;
      }
      if (payload[key] > min) {
        validatedPayload[key] = payload[key];
      } else {
        delete validatedPayload[key];
        invalidKeys.push(key);
      }
    },
    // NOT  inclusive
    validateMax(key, max = 0) {
      if (!(key in payload) || invalidKeys.indexOf(key) !== -1) {
        return;
      }
      if (key in payload && payload[key] < max) {
        validatedPayload[key] = payload[key];
      } else {
        delete validatedPayload[key];
        invalidKeys.push(key);
      }
    },
    validateFloat(key) {
      if (!(key in payload) || invalidKeys.indexOf(key) !== -1) {
        return;
      }
      if (key in payload && !isNaN(parseFloat(payload[key]))) {
        validatedPayload[key] = parseFloat(payload[key]);
      } else {
        delete validatedPayload[key];
        invalidKeys.push(key);
      }
    },
    validateInt(key) {
      if (!(key in payload) || invalidKeys.indexOf(key) !== -1) {
        return;
      }
      if (key in payload && !isNaN(parseInt(payload[key]))) {
        validatedPayload[key] = parseInt(payload[key]);
      } else {
        delete validatedPayload[key];
        invalidKeys.push(key);
      }
    },
    validateBoolean(key) {
      if (!(key in payload) || invalidKeys.indexOf(key) !== -1) {
        return;
      }
      if (key in payload) {
        validatedPayload[key] = !!payload[key];
      } else {
        delete validatedPayload[key];
        invalidKeys.push(key);
      }
    },
  };
}
