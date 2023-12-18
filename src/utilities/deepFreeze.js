import _ from "lodash";

export default function deepFreeze(obj) {
  _.forOwn(obj, (value) => {
    if (_.isObject(value)) {
      deepFreeze(value);
    }
  });

  if (!Object.isFrozen(obj)) {
    Object.freeze(obj);
  }
  return obj;
}
