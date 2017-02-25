export default {
    // current selections
    setCurrentStory (state, payload) { state.currentSelections.story = payload.story; },
    setCurrentSpace (state, payload) { state.currentSelections.space = payload.space; },
    setCurrentShading (state, payload) { state.currentSelections.shading = payload.shading; },

    // editor rendering/drawing mode
    setsetApplicationMode (state, payload) { state.currentSelections.mode = payload.mode; },

    // d3 scaling functions
    setScaleX (state, payload) { state.scale.x = payload.scaleX; },
    setScaleY (state, payload) { state.scale.y = payload.scaleY; }
}
