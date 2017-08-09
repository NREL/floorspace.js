import map from './appconfig';

const helpers = {
  // TODO: refactor
  // returns the displayName for a given mode
  displayNameForMode(mode) {
    return map.modes[mode];
  },
  config: map,
};
export default helpers;
