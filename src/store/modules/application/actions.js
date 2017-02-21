export default {
    setCurrentStory (context, payload) {
        // check that story exists
        if (~context.rootState.models.stories.indexOf(payload.story)) {
            context.commit('setCurrentStory', payload);
            if (payload.story.imageVisible) {
                context.dispatch('project/setMapVisible', { visible: false }, { root: true });
            }
        }
    },
    setCurrentSpace (context, payload) {
        // check that space exists on the current story
        if (~context.state.currentSelections.story.spaces.indexOf(payload.space)) {
            context.commit('setCurrentSpace', payload);
        }
    },
    setRenderMode (context, payload) {
        // check that mode exists
        if (~context.state.modes.indexOf(payload.mode)) {
            context.commit('setRenderMode', payload);
        }
    },
    // update d3 scaling functions
    setScaleX (context, payload) { context.commit('setScaleX', payload); },
    setScaleY (context, payload) { context.commit('setScaleY', payload); }
}
