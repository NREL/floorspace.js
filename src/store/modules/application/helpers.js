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

export function spacePropertyById(library, spacePropId) {
  let type, prop;
  if ((prop = _.find(library.space_types, { id: spacePropId }))) {
    type = 'space_types';
  } else if ((prop = _.find(library.building_units, { id: spacePropId }))) {
    type = 'building_units';
  } else if ((prop = _.find(library.thermal_zones, { id: spacePropId }))) {
    type = 'thermal_zones';
  } else if ((prop = _.find(library.pitched_roofs, { id: spacePropId }))) {
    type = 'pitched_roofs';
  } else {
    return null;
  }
  return { ...prop, type };
}
