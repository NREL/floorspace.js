import helpers from './../geometry/helpers.js'

export default {
    // geometry for the story being edited
    currentStoryGeometry (state, getters, rootState, rootGetters) {
        return rootState.geometry.find((geometry) => {
            return geometry.id === state.currentSelections.story.geometry_id;
        });
    },

    // face for the shading or space being edited
    currentSelectionsFace (state, getters, rootState, rootGetters) {
        if (state.currentSelections.space) {
            return helpers.faceForId(state.currentSelections.space.face_id, getters['currentStoryGeometry']);
        } else if (state.currentSelections.shading) {
            return helpers.faceForId(state.currentSelections.shading.face_id, getters['currentStoryGeometry']);
        }
    }
}
