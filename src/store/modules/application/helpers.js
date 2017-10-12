import _ from 'lodash';
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

export function componentInstanceById(currStory, compInstId) {
  return (
    _.find(currStory.windows, { id: compInstId }) ||
    _.find(_.flatMap(currStory.spaces, s => s.daylighting_controls), { id: compInstId }) ||
    null);
}
