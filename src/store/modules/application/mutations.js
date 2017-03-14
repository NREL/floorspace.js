export default {
    // current selections
    setCurrentStory (state, payload) { state.currentSelections.story = payload.story; },
    setCurrentSpace (state, payload) { state.currentSelections.space = payload.space; },
    setCurrentShading (state, payload) { state.currentSelections.shading = payload.shading; },
    setCurrentBuildingUnit (state, payload) { state.currentSelections.building_unit = payload.building_unit; },
    setCurrentThermalZone (state, payload) { state.currentSelections.thermal_zone = payload.thermal_zone; },
    setCurrentSpaceType (state, payload) { state.currentSelections.space_type = payload.space_type; },

    // editor rendering/drawing mode
    setApplicationMode (state, payload) { state.currentSelections.mode = payload.mode; },

    // d3 scaling functions
    setScaleX (state, payload) { state.scale.x = payload.scaleX; },
    setScaleY (state, payload) { state.scale.y = payload.scaleY; }
}
