import _ from 'lodash';
import idFactory from './generateId';

export default function importLibrary(context, payload) {
  let count = 0;
  const types = Object.keys(payload.data);
  types.forEach((type) => {
    if (type === 'project' || !context.state.models.library[type]) { return; }
    const existingNames = context.state.models.library[type].map((o) => {
      // /_\d+[\w\s]?$/
      // if object name contains duplicate suffix, remove suffix
      if (/_\d+[\w\s]?$/.test(o.name)) {
        return o.name.split('_').slice(0, -1).join('_');
      }
      return o.name;
    });
    payload.data[type] = payload.data[type].map((obj) => {
      const importObj = obj;
      importObj.id = idFactory.generate();
      // number of existing objects with the same prefix
      const duplicateCount = existingNames.filter(n => n === obj.name).length;
      if (duplicateCount) { importObj.name += `_${duplicateCount}`; }
      count += 1;
      return importObj;
    });
  });


  window.eventBus.$emit('success', `Imported ${count} object${count !== 1 ? 's' : ''}`);
  // merge the import data with the existing library objects
  context.commit(
    'importLibrary',
    _.fromPairs([
      'building_units', 'thermal_zones', 'space_types', 'construction_sets',
      'window_definitions', 'daylighting_control_definitions', 'pitched_roofs',
    ].map(k => (
      [k, context.state.models.library[k].concat(payload.data[k] || [])]
    ))),
  );
}
