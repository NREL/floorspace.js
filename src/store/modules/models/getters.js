export default {
    // all spaces across all stories
    allSpaces (state, getters, rootState, rootGetters) {
        return rootState.models.stories.reduce((spaces, story) => {
            return spaces.concat(story.spaces)
        }, []);
    },
    // all shading across all stories
    allShading (state, getters, rootState, rootGetters) {
        return rootState.models.stories.reduce((shading, story) => {
            return shading.concat(story.shading)
        }, []);
    },
    // all spaces across all stories
    allImages (state, getters, rootState, rootGetters) {
        return rootState.models.stories.reduce((images, story) => {
            return images.concat(story.images)
        }, []);
    }
}
