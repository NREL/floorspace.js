export default {
    setCurrentStory (context, payload) {
        // check that story exists
        if (~context.rootState.models.stories.indexOf(payload.story)) {
            context.commit('setCurrentStory', {
                story: payload.story
            });

            // update project grid background settings based on story configuration
            if (payload.story.imageVisible) {
                context.dispatch('project/setMapVisible', { visible: false }, { root: true });
            }

            // clear the current shading and space
            context.commit('setCurrentShading', {
                shading: payload.shading
            });
            context.commit('setCurrentSpace', {
                space: null
            });
        }
    },

    setCurrentSpace (context, payload) {
        // check that space belongs to the current story
        if (~context.state.currentSelections.story.spaces.indexOf(payload.space) || !payload.space) {
            context.commit('setCurrentSpace', {
                space: payload.space
            });

            // clear the current shading
            context.commit('setCurrentShading', {
                shading: payload.shading
            });
        }
    },

    setCurrentShading (context, payload) {
        // check that shading belongs to the current story
        if (~context.state.currentSelections.story.shading.indexOf(payload.shading) || !payload.shading) {
            context.commit('setCurrentShading', {
                shading: payload.shading
            });

            // clear the currentSpace
            context.commit('setCurrentSpace', {
                space: null
            });
        }
    },

    setApplicationMode (context, payload) {
        // check that the requested rendering mode exists
        if (~context.state.modes.indexOf(payload.mode)) {
            context.commit('setsetApplicationMode', {
                mode: payload.mode
            });
        }
    },

    // update d3's scaling functions
    setScaleX (context, payload) {
        context.commit('setScaleX', {
            scaleX: payload.scaleX
        });
    },
    setScaleY (context, payload) {
        context.commit('setScaleY', {
            scaleY: payload.scaleY
        });
    }
}
