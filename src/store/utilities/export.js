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

export default function exportData(state, getters) {
  let exportObject = {
    application: state.application,
    project: state.project,
    stories: state.models.stories,
    ...state.models.library,
    version,
  };
  const geometrySets = getters['geometry/exportData'];
  exportObject = JSON.parse(JSON.stringify(exportObject));
  exportObject.stories.forEach((story) => {
    story.geometry = _.find(geometrySets, { id: story.geometry_id });
    delete story.geometry_id;
  });
  return formatObject(exportObject);
}
