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
        const story = context.rootState.models.stories.find(s => s.id === payload.story.id);
        // check that story exists
        if (~context.rootState.models.stories.map(s => s.id).indexOf(payload.story.id)) {
            context.commit('setCurrentStory', {
                story: story
            });

            // update project grid background settings based on story configuration
            if (payload.story.imageVisible) {
                context.dispatch('project/setMapVisible', { visible: false }, { root: true });
            }
            context.dispatch('clearSubSelections');
        }
    },

    setCurrentSpace (context, payload) {
        const space = context.state.currentSelections.story.spaces.find(s => s.id === payload.space.id);
        // check that space belongs to the current story
        if (!payload.space || ~context.state.currentSelections.story.spaces.map(s => s.id).indexOf(payload.space.id)) {
            context.dispatch('clearSubSelections');
            context.commit('setCurrentSpace', {
                space: space
            });
        }
    },

    setCurrentShading (context, payload) {
        const shading = context.state.currentSelections.story.shading.find(s => s.id === payload.shading.id);

        // check that shading belongs to the current story
        if (!payload.shading || ~context.state.currentSelections.story.shading.map(s => s.id).indexOf(payload.shading.id)) {
            context.dispatch('clearSubSelections');
            context.commit('setCurrentShading', {
                shading: shading
            });
        }
    },

    setCurrentBuildingUnit (context, payload) {
        const building_unit = context.rootState.models.library.building_units.find(b => b.id === payload.building_unit.id);

        context.dispatch('clearSubSelections');
        context.commit('setCurrentBuildingUnit', {
            building_unit: building_unit
        });
    },

    setCurrentThermalZone (context, payload) {
        const thermal_zone = context.rootState.models.library.thermal_zones.find(b => b.id === payload.thermal_zone.id);

        context.dispatch('clearSubSelections');
        context.commit('setCurrentThermalZone', {
            thermal_zone: thermal_zone
        });
    },

    setCurrentSpaceType (context, payload) {
        const space_type = context.rootState.models.library.space_types.find(b => b.id === payload.space_type.id);

        context.dispatch('clearSubSelections');
        context.commit('setCurrentSpaceType', {
            space_type: space_type
        });
    },

    setApplicationTool (context, payload) {
        // check that the requested rendering tool exists
        if (~context.state.tools.indexOf(payload.tool)) {
            context.commit('setApplicationTool', {
                tool: payload.tool
            });
        }
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
