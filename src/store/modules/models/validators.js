import _ from 'lodash';

export default {
  name(object, store, value, type) {
    let objs = store.getters['models/all'];

    switch (type) {
      case 'stories':
        objs = store.state.models.stories;
        break;
      case 'spaces':
        objs = store.getters['models/allSpaces'];
        break;
      case 'shading':
        objs = store.getters['models/allShading'];
        break;
      case 'images':
        objs = store.getters['models/allImages'];
        break;
      default:
        objs = store.state.models.library[type];
        break;
    }
    let error = '';
    if (objs.filter(s => (s.name === value) && (s.id !== object.id)).length) {
      error = 'Names must be unique.';
    } else if (value === '') {
      error = 'Names must be at least 1 characters long.';
    }

    return error ? { success: false, error } : { success: true };
  },
  number(object, store, value, type) {
    let error = '';
    if (isNaN(value)) {
      error = 'Value must be numeric.';
    }

    return error ? { success: false, error } : { success: true };
  },
  oneOf(...args) {
    return (object, store, value, type) => {
      if (!_.includes(args, value)) {
        return { success: false, error: `Expected one of ${args}, got ${value}` };
      }
      return { success: true };
    };
  },
  gt0(object, story, value, type) {
    return value > 0 ? { success: true } : { success: false, error: 'Expected value to be greater than zero' };
  },
  closedInterval(start, end) {
    return (object, store, value, type) => {
      if (value < start || value > end) {
        return { success: false, error: `Must be between ${start} and ${end}` };
      }
      return { success: true };
    };
  },
};
