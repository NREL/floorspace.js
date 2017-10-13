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
  const windew = _.find(currStory.windows, { id: compInstId });
  if (windew) { return { ...windew, type: 'window' }; }

  const dc = _.find(_.flatMap(currStory.spaces, s => s.daylighting_controls), { id: compInstId });
  if (dc) { return { ...dc, type: 'daylighting_control' }; }

  return null;
}
