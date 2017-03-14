export default {
    clearSubSelections (context, payload) {
        // clear the current subselections
        context.commit('setCurrentShading', { shading: null });
        context.commit('setCurrentSpace', { space: null });
        context.commit('setCurrentBuildingUnit', { building_unit: null });
        context.commit('setCurrentThermalZone', { thermal_zone: null });
        context.commit('setCurrentSpaceType', { space_type: null });
    },

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
            context.dispatch('clearSubSelections');
        }
    },

    setCurrentSpace (context, payload) {
        // check that space belongs to the current story
        if (~context.state.currentSelections.story.spaces.indexOf(payload.space) || !payload.space) {
            context.dispatch('clearSubSelections');
            context.commit('setCurrentSpace', {
                space: payload.space
            });
        }
    },

    setCurrentShading (context, payload) {
        // check that shading belongs to the current story
        if (~context.state.currentSelections.story.shading.indexOf(payload.shading) || !payload.shading) {
            context.dispatch('clearSubSelections');
            context.commit('setCurrentShading', {
                shading: payload.shading
            });
        }
    },

    setCurrentBuildingUnit (context, payload) {
        context.dispatch('clearSubSelections');
        context.commit('setCurrentBuildingUnit', {
            building_unit: payload.building_unit
        });
    },

    setCurrentThermalZone (context, payload) {
        context.dispatch('clearSubSelections');
        context.commit('setCurrentThermalZone', {
            thermal_zone: payload.thermal_zone
        });
    },

    setCurrentSpaceType (context, payload) {
        context.dispatch('clearSubSelections');
        context.commit('setCurrentSpaceType', {
            space_type: payload.space_type
        });
    },

    setApplicationMode (context, payload) {
        // check that the requested rendering mode exists
        if (~context.state.modes.indexOf(payload.mode)) {
            context.commit('setApplicationMode', {
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
