import _ from "lodash";
import map, { assignableProperties } from "./appconfig";

export function displayNameForMode(mode) {
  return map.modes[mode];
}

const helpers = {
  // TODO: refactor
  // returns the displayName for a given mode
  displayNameForMode,
  config: map,
};
export default helpers;

export function componentInstanceById(currStory, compInstId) {
  const windew = _.find(currStory.windows, { id: compInstId });
  if (windew) {
    return { ...windew, type: "windows" };
  }

  const dc = _.find(
    _.flatMap(currStory.spaces, (s) => s.daylighting_controls),
    { id: compInstId }
  );
  if (dc) {
    return { ...dc, type: "daylighting_controls" };
  }

  const door = _.find(currStory.doors, { id: compInstId });
  if (door) {
    return { ...door, type: "doors" };
  }

  return null;
}

export function spacePropertyById(library, spacePropId) {
  let type, prop;
  assignableProperties.some((ap) => {
    if ((prop = _.find(library[ap], { id: spacePropId }))) {
      type = ap;
    }
    return !!prop;
  });

  return prop ? { ...prop, type } : null;
}
