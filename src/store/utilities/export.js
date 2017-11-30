
import _ from 'lodash';
import version from '../../version';

function formatObject(obj) {
  if (_.isArray(obj)) {
    return obj.map(formatObject);
  } else if (_.isObject(obj)) {
    return _.mapValues(obj, (val, key) => {
      if ((key === 'id' || key.indexOf('_id') >= 0) && _.isNumber(val)) {
        return String(val);
      }
      return formatObject(val);
    });
  }
  return obj;
}


function mungeStories(stories, geometries) {
  return stories.map((story) => {
    const geometry = JSON.parse(JSON.stringify(
      _.find(geometries, { id: story.geometry_id }),
    ));
    return {
      ...story,
      spaces: story.spaces,
      geometry,
      geometry_id: undefined,
    };
  });
}

export default function exportData(state, getters) {
  const exportObject = {
    application: state.application,
    project: state.project,
    stories: mungeStories(state.models.stories, getters['geometry/exportData']),
    ...state.models.library,
    version,
  };
  return formatObject(exportObject);
}
