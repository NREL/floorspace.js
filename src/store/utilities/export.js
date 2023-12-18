import _ from "lodash";
import version from "../../version";
import { repeatingWindowCenters } from "../../store/modules/geometry/helpers";

function formatHex(val) {
  if (!val) {
    return null;
  }
  if (val.length === 4) {
    return `#${val[1]}${val[1]}${val[2]}${val[2]}${val[3]}${val[3]}`;
  }
  return val;
}

function formatObject(obj) {
  if (_.isArray(obj)) {
    return obj.map(formatObject);
  } else if (_.isObject(obj)) {
    return _.mapValues(obj, (val, key) => {
      if ((key === "id" || key.indexOf("_id") >= 0) && _.isNumber(val)) {
        return String(val);
      }
      if (key === "color") {
        return formatHex(val);
      }
      return formatObject(val);
    });
  }
  return obj;
}

function mungeWindows(windows, geometry, windowDefs) {
  const repeatingWindowDefs = _.chain(windowDefs)
    .filter({ window_definition_mode: "Repeating Windows" })
    .map((wd) => [wd.id, wd])
    .fromPairs()
    .value();

  return windows.map((w) => {
    const def = repeatingWindowDefs[w.window_definition_id];
    if (def) {
      const edge = _.find(geometry.edges, { id: w.edge_id });
      const centers = repeatingWindowCenters({
        start: _.find(geometry.vertices, { id: edge.vertex_ids[0] }),
        end: _.find(geometry.vertices, { id: edge.vertex_ids[1] }),
        spacing: def.window_spacing,
        width: def.width,
      });
      return {
        ...w,
        alpha: _.map(centers, "alpha"),
      };
    }
    return w;
  });
}

function mungeStories(stories, geometries, windowDefs) {
  return stories.map((story) => {
    const geometry = JSON.parse(
      JSON.stringify(
        _.find(geometries, { id: story.geometry_id }) || {
          edges: [],
          vertices: [],
          faces: [],
        }
      )
    );
    return {
      ...story,
      spaces: story.spaces,
      geometry,
      windows: mungeWindows(story.windows, geometry, windowDefs),
      geometry_id: undefined,
    };
  });
}

export default function exportData(state, getters) {
  const exportObject = {
    application: state.application,
    project: state.project,
    stories: mungeStories(
      state.models.stories,
      getters["geometry/exportData"],
      state.models.library.window_definitions
    ),
    ...state.models.library,
    version,
  };
  return formatObject(exportObject);
}
