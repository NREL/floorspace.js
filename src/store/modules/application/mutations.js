export default {
  // current selections
  setCurrentStoryId(state, payload) { state.currentSelections.story_id = payload.id; },
  setCurrentSubSelectionId(state, payload) { state.currentSelections.subselection_id = payload.id; },
  
  setCurrentBuildingUnit(state, payload) { state.currentSelections.building_unit = payload.building_unit; },
  setCurrentThermalZone(state, payload) { state.currentSelections.thermal_zone = payload.thermal_zone; },
  setCurrentSpaceType(state, payload) { state.currentSelections.space_type = payload.space_type; },

  // editor rendering/drawing tool
  setApplicationTool(state, payload) { state.currentSelections.tool = payload.tool; },
  setApplicationMode(state, payload) { state.currentSelections.mode = payload.mode; },

  // d3 scaling functions
  setScaleX(state, payload) { state.scale.x = payload.scaleX; },
  setScaleY(state, payload) { state.scale.y = payload.scaleY; },
};
