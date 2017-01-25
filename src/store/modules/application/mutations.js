export default {
    // CURRENTSELECTIONS
    // set current story selection, clear current space selection
    setCurrentStory (state, payload) {
        state.currentSelections.story = payload.story;
        state.currentSelections.space = payload.story.spaces[0];
    },
    // set current space selection
    setCurrentSpace (state, payload) {
        state.currentSelections.space = payload.space;
    },
    // set current canvas rendering mode
    setRenderMode (state, payload) {
        state.currentSelections.mode = payload.mode;
    },
    // SCALE
    setScaleX (state, payload) {
        state.scale.x = payload.scaleX;
    },
    setScaleY (state, payload) {
        state.scale.y = payload.scaleY;
    }
}
