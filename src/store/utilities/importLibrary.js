import idFactory from './generateId'

export default function importLibrary(context, payload) {
  // generate ids for imported objects
  let count = 0;
  (function setIds (obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === 'id') {
          obj[key] = idFactory.generate();
          count += 1;
          console.log(obj[key]);
        } else if (obj[key] !== null && typeof obj[key] === 'object') {
          setIds(obj[key]);
        }
      }
    }
  })(payload.data);

  window.eventBus.$emit('success', `Imported ${count} object${count !== 1 ? 's' : ''}`);
  // merge the import data with the existing library objects
  context.commit('importLibrary', {
    building_units: context.state.models.library.building_units.concat(payload.data.building_units || []),
    thermal_zones: context.state.models.library.thermal_zones.concat(payload.data.thermal_zones || []),
    space_types: context.state.models.library.space_types.concat(payload.data.space_types || []),
    construction_sets: context.state.models.library.construction_sets.concat(payload.data.construction_sets || []),
    windows: context.state.models.library.windows.concat(payload.data.windows || []),
    daylighting_controls: context.state.models.library.daylighting_controls.concat(payload.data.daylighting_controls || []),
  });
}
