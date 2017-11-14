import _ from 'lodash';
import { assignableProperties } from './appconfig';
import { componentInstanceById, spacePropertyById } from './helpers';

export default {
  setCurrentStoryId(context, payload) {
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

  setCurrentComponentId(context, payload) {
    const { id } = payload;
    if (context.getters.currentStory && (
      context.getters.currentStory.windows.find(i => i.id === id) ||
      context.getters.currentStory.daylighting_controls.find(i => i.id === id)
    )) {
      context.commit('setCurrentComponentId', { id });
    }
  },

  setCurrentComponentDefinitionId(context, payload) {
    const { id } = payload;
    if (context.rootState.models.library.daylighting_control_definitions.find(i => i.id === id) ||
      context.rootState.models.library.window_definitions.find(i => i.id === id)) {
      context.commit('setCurrentComponentDefinitionId', { id });
    }
  },

  setCurrentComponentInstanceId(context, payload) {
    const { id } = payload;
    if (!componentInstanceById(context.getters.currentStory, id)) {
      console.error('unable to find an instance with that id on the current story');
    } else {
      context.commit('setCurrentComponentInstanceId', payload);
    }
  },

  setCurrentSnapMode(context, { snapMode }) {
    if (!_.includes(['grid-strict', 'grid-verts-edges'], snapMode)) {
      throw new Error(`Unknown grid mode ${snapMode}`);
    }
    context.commit('setCurrentSnapMode', { snapMode });
  },
  setCurrentModeTab(context, { modeTab }) {
    context.commit('setCurrentModeTab', { modeTab });
  },
  setCurrentSubselectionType(context, { subselectionType }) {
    context.commit('setCurrentSubselectionType', { subselectionType });
  },
  setCurrentTool(context, payload) {
    const { tool } = payload;
    if (context.state.tools.indexOf(tool) !== -1) {
      context.commit('setCurrentTool', { tool });
    }
  },

  setCurrentMode(context, payload) {
    const { mode } = payload;
    if (mode === 'spaces' || _.includes(assignableProperties, mode)) {
      context.commit('setCurrentMode', { mode });
    } else {
      console.error(`unrecognized view-by option: ${mode}`);
    }
  },

  setCurrentSpacePropertyId(context, payload) {
    const { id } = payload;
    if (!id || spacePropertyById(context.rootState.models.library, id)) {
      context.commit('setCurrentSpacePropertyId', { id });
    } else {
      console.error(`unable to find space property with id: ${id}`);
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
