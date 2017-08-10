export default {
  // current selections
  setCurrentStoryId(state, payload) { state.currentSelections.story_id = payload.id; },
  setCurrentSubSelectionId(state, payload) { state.currentSelections.subselection_id = payload.id; },

  setCurrentComponentId(state, payload) { state.currentSelections.component_id = payload.id; },
  setCurrentComponentDefinitionId(state, payload) { state.currentSelections.component_definition_id = payload.id; },

  setCurrentThermalZoneId(state, payload) { state.currentSelections.thermal_zone_id = payload.id; },
  setCurrentSpaceTypeId(state, payload) { state.currentSelections.space_type_id = payload.id; },

  // editor rendering/drawing tool
  setCurrentTool(state, payload) { state.currentSelections.tool = payload.tool; },
  setCurrentMode(state, payload) { state.currentSelections.mode = payload.mode; },

  // d3 scaling functions
  setScaleX(state, payload) { state.scale.x = payload.scaleX; },
  setScaleY(state, payload) { state.scale.y = payload.scaleY; },
};
