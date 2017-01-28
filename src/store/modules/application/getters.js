import helpers from './../geometry/helpers.js'

export default {
    // the geometry on the currentStory
    currentStoryGeometry (state, getters, rootState, rootGetters) {
        return rootState.geometry.find((g) => {
            return g.id === state.currentSelections.story.geometry_id;
        });
    },
    currentSelectionsFace (state, getters, rootState, rootGetters) {
        return helpers.faceForId(state.currentSelections.space.face_id, getters['currentStoryGeometry']);
    }
}
