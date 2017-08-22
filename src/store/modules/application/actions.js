import _ from 'lodash';

export default {
  setCurrentStoryId(context, payload) {
    // TODO: clear subselections?
    const { id } = payload;
    if (context.rootState.models.stories.map(s => s.id).indexOf(id) !== -1) {
      context.commit('setCurrentStoryId', { id });
    }
  },

  setCurrentSubSelectionId(context, payload) {
    const { id } = payload;
    if (context.getters.currentStory && (
      context.getters.currentStory.spaces.find(i => i.id === id) ||
      context.getters.currentStory.shading.find(i => i.id === id) ||
      context.getters.currentStory.images.find(i => i.id === id)
    )) {
      context.commit('setCurrentSubSelectionId', { id });
    }
  },

  setCurrentSnapMode(context, { snapMode }) {
    if (!_.includes(['grid-strict', 'grid-verts-edges'], snapMode)) {
      throw new Error(`Unknown grid mode ${snapMode}`);
    }
    context.commit('setCurrentSnapMode', { snapMode });
  },

  setCurrentTool(context, payload) {
    const { tool } = payload;
    if (context.state.tools.indexOf(tool) !== -1) {
      context.commit('setCurrentTool', { tool });
    }
  },

  setCurrentMode(context, payload) {
    const { mode } = payload;
    if (context.state.modes.indexOf(mode) !== -1) {
      context.commit('setCurrentMode', { mode });
    }
  },

  setCurrentBuildingUnitId(context, payload) {
    const { id } = payload;
    if (context.rootState.models.library.building_units.map(m => m.id).indexOf(id) !== -1) {
      context.commit('setCurrentBuildingUnitId', { id });
    }
  },

  setCurrentThermalZoneId(context, payload) {
    const { id } = payload;
    if (context.rootState.models.library.thermal_zones.map(m => m.id).indexOf(id) !== -1) {
      context.commit('setCurrentThermalZoneId', { id });
    }
  },

  setCurrentSpaceTypeId(context, payload) {
    const { id } = payload;
    if (context.rootState.models.library.space_types.map(m => m.id).indexOf(id) !== -1) {
      context.commit('setCurrentSpaceTypeId', { id });
    }
  },


  // update d3's scaling functions
  setScaleX(context, payload) {
    const { scaleX } = payload;
    context.commit('setScaleX', { scaleX });
  },
  setScaleY(context, payload) {
    const { scaleY } = payload;
    context.commit('setScaleY', { scaleY });
  },
};
