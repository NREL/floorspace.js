import _ from 'lodash';
import version from '../../version';

export default function exportData(state, getters) {
    var exportObject = {
      application: state.application,
      project: state.project,
      stories: state.models.stories,
      ...state.models.library,
      version,
    };
    const geometrySets = getters['geometry/exportData']
    exportObject = JSON.parse(JSON.stringify(exportObject));
    exportObject.stories.forEach((story) => {
        story.geometry = geometrySets.find((geometry) => { return geometry.id === story.geometry_id; });
        delete story.geometry_id;
    });
    formatObject(exportObject);
    return exportObject;
}

function formatObject(obj) {
  Object.keys(obj).forEach((key) => {
    // coerce all numeric ids to strings
    if ((key === 'id' || key.indexOf('_id') >= 0) && _.isNumber(obj[key])) {
      obj[key] = String(obj[key]);
    }
    if (key.indexOf('_ids') >= 0 && _.isObject(obj[key])) {
      obj[key] = _.mapKeys(obj[key], id => String(id));
    }
    // recurse
    if (obj[key] !== null && _.isObject(obj[key])) {
      formatObject(obj[key]);
    }
  });
}
