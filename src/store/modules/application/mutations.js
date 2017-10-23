export default {
  // current selections
  setCurrentStoryId(state, payload) { state.currentSelections.story_id = payload.id; },
  setCurrentSubSelectionId(state, payload) { state.currentSelections.subselection_id = payload.id; },

  setCurrentComponentId(state, payload) { state.currentSelections.component_id = payload.id; },
  setCurrentComponentDefinitionId(state, payload) { state.currentSelections.component_definition_id = payload.id; },
  setCurrentComponentInstanceId(state, payload) { state.currentSelections.component_instance_id = payload.id; },

  setCurrentSpacePropertyId(state, payload) { state.currentSelections.space_property_id = payload.id; },

  setCurrentSnapMode(state, payload) { state.currentSelections.snapMode = payload.snapMode; },
  setCurrentModeTab(state, payload) { state.currentSelections.modeTab = payload.modeTab; },
  setCurrentSubselectionType(state, payload) { state.currentSelections.subselectionType = payload.subselectionType; },

  // editor rendering/drawing tool
  setCurrentTool(state, payload) { state.currentSelections.tool = payload.tool; },
  setCurrentMode(state, payload) { state.currentSelections.mode = payload.mode; },

  // d3 scaling functions
  setScaleX(state, payload) { state.scale.x = payload.scaleX; },
  setScaleY(state, payload) { state.scale.y = payload.scaleY; },
};
