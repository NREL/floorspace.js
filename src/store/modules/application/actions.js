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

            context.dispatch('clearSubSelections');
        }
    },

    setCurrentSpace (context, payload) {
        const space = payload.space ? context.rootGetters['models/allSpaces'].find(s => s.id === payload.space.id) : null;
        context.dispatch('clearSubSelections');
        context.commit('setCurrentSpace', {
            space: space
        });
    },

    setCurrentShading (context, payload) {
        const shading = payload.shading ? context.state.currentSelections.story.shading.find(s => s.id === payload.shading.id) : null;

        context.dispatch('clearSubSelections');
        context.commit('setCurrentShading', {
            shading: shading
        });
    },

    setCurrentImage (context, payload) {
        const image = payload.image ? context.state.currentSelections.story.images.find(i => i.id === payload.image.id) : null;

        context.dispatch('clearSubSelections');
        context.commit('setCurrentImage', {
            image: image
        });
    },

    setCurrentBuildingUnit (context, payload) {
        const building_unit = payload.building_unit ? context.rootState.models.library.building_units.find(b => b.id === payload.building_unit.id) : null;

        context.dispatch('clearSubSelections');
        context.commit('setCurrentBuildingUnit', {
            building_unit: building_unit
        });
    },

    setCurrentThermalZone (context, payload) {
        const thermal_zone = payload.thermal_zone ? context.rootState.models.library.thermal_zones.find(b => b.id === payload.thermal_zone.id) : null;

        context.dispatch('clearSubSelections');
        context.commit('setCurrentThermalZone', {
            thermal_zone: thermal_zone
        });
    },

    setCurrentSpaceType (context, payload) {
        const space_type = payload.space_type ? context.rootState.models.library.space_types.find(b => b.id === payload.space_type.id) : null;

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
