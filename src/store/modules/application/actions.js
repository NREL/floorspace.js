export default {

  setCurrentStoryId(context, payload) {
    const { id } = payload;
    context.commit('setCurrentStoryId', { id });
  },

  setCurrentSubSelectionId(context, payload) {
    const { id } = payload;
    context.commit('setCurrentSubSelectionId', { id });
  },

  setCurrentBuildingUnit(context, payload) {
    const building_unit = payload.building_unit ? context.rootState.models.library.building_units.find(b => b.id === payload.building_unit.id) : null;

    context.dispatch('clearSubSelections');
    context.commit('setCurrentBuildingUnit', {
      building_unit: building_unit
    });
  },

  setCurrentThermalZone(context, payload) {
    const thermal_zone = payload.thermal_zone ? context.rootState.models.library.thermal_zones.find(b => b.id === payload.thermal_zone.id) : null;

    context.dispatch('clearSubSelections');
    context.commit('setCurrentThermalZone', {
      thermal_zone: thermal_zone
    });
  },

  setCurrentSpaceType(context, payload) {
    const space_type = payload.space_type ? context.rootState.models.library.space_types.find(b => b.id === payload.space_type.id) : null;

    context.dispatch('clearSubSelections');
    context.commit('setCurrentSpaceType', {
      space_type: space_type
    });
  },

  setApplicationTool(context, payload) {
    // check that the requested rendering tool exists
    if (~context.state.tools.indexOf(payload.tool)) {
      context.commit('setApplicationTool', {
        tool: payload.tool
      });
    }
  },

  setApplicationMode(context, payload) {
    // check that the requested rendering mode exists
    if (~context.state.modes.indexOf(payload.mode)) {
      context.commit('setApplicationMode', {
        mode: payload.mode
      });
    }
  },

  // update d3's scaling functions
  setScaleX(context, payload) {
    context.commit('setScaleX', {
      scaleX: payload.scaleX
    });
  },
  setScaleY(context, payload) {
    context.commit('setScaleY', {
      scaleY: payload.scaleY
    });
  },
};
