export default {
    // the geometry on the currentStory
    currentStoryGeometry (state, getters, rootState, rootGetters) {
        return rootState.geometry.find((g) => {
            return g.id === state.currentSelections.story.geometry_id;
        });
    }
}
