export default {
  // full story object for the currentSelections story_id
  currentStory(state, getters, rootState) { return rootState.models.stories.find(s => s.id === state.currentSelections.story_id); },

  // full space, shading, or image object for the currentSelections subselection_id
  currentSubSelection(state, getters) {
    const currentStory = getters['currentStory'];
    const subSelectionId = state.currentSelections.subselection_id;
    return currentStory.spaces.find(i => i.id === subSelectionId) ||
      currentStory.shading.find(i => i.id === subSelectionId) ||
      currentStory.images.find(i => i.id === subSelectionId);
  },

  currentSubSelectionType(state, getters) {
    const currentStory = getters['currentStory'];
    const subSelectionId = state.currentSelections.subselection_id;
    if (currentStory.spaces.find(i => i.id === subSelectionId)) {
      return 'spaces';
    } else if (currentStory.shading.find(i => i.id === subSelectionId)) {
      return 'shading';
    } else if (currentStory.images.find(i => i.id === subSelectionId)) {
      return 'images';
    }
    return null;
  },

  // access subSelection by type
  currentSpace(state, getters) { return getters.currentSubSelectionType === 'spaces' ? getters.currentSubSelection : null; },
  currentShading(state, getters) { return getters.currentSubSelectionType === 'shading' ? getters.currentSubSelection : null; },
  currentImage(state, getters) { return getters.currentSubSelectionType === 'images' ? getters.currentSubSelection : null; },

  // the type of the component definition being instantiated
  currentComponentType(state, getters, rootState) {
    const componentDefinitionId = state.currentSelections.component_definition_id;
    if (rootState.models.library.window_definitions.find(i => i.id === componentDefinitionId)) { return 'window_definitions'; }
    if (rootState.models.library.daylighting_control_definitions.find(i => i.id === componentDefinitionId)) { return 'daylighting_control_definitions'; }
    return null;
  },

  // full component (window or daylighting_control) instance for the component_id, this will be stored on the currentStory
  currentComponent(state, getters) {
    const currentStory = getters['currentStory'];
    const componentId = state.currentSelections.component_id;
    return currentStory.windows.find(i => i.id === componentId) ||
      currentStory.daylighting_controls.find(i => i.id === componentId);
  },
  // full component definition (window_definition or daylighting_control_definition) instance for the component_definition_id
  // this will be stored in the top level library
  currentComponentDefinition(state, getters, rootState) {
    const componentDefinitionId = state.currentSelections.component_definition_id;
    return rootState.models.library.window_definitions.find(i => i.id === componentDefinitionId) ||
      rootState.models.library.daylighting_control_definitions.find(i => i.id === componentDefinitionId);
  },

  currentBuildingUnit(state, getters, rootState) { return rootState.models.library.building_units.find(i => i.id === state.currentSelections.building_unit_id); },
  currentThermalZone(state, getters, rootState) { return rootState.models.library.thermal_zones.find(i => i.id === state.currentSelections.thermal_zone_id); },
  currentSpaceType(state, getters, rootState) { return rootState.models.library.space_types.find(i => i.id === state.currentSelections.space_type_id); },

  // geometry for the story being edited
  currentStoryGeometry(state, getters, rootState) {
    return rootState.geometry.find(g => g.id === getters['currentStory'].geometry_id);
  },

  // face for the shading or space being edited
  currentSubSelectionFace(state, getters) {
    // if the subselection is an image, there will not be an associated face
    if (getters['currentSubSelection'] && getters['currentSubSelection'].face_id) {
      return getters['currentStoryGeometry'].faces.find(f => f.id === getters['currentSubSelection'].face_id);
    }
    return null;
  },
};
