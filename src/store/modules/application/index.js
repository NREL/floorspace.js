import factory from './../../factory/index.js'
// the application state
export default {
    namespaced: true,
    state: {
        // models currently being edited and active tools
        currentSelections: {
            story_id: null,
            space_id: null,
            mode: 'Space',
            tool: null,
            face: null
        },
        // TODO: drawing modes may need to be moved into the component as local state
        modes: ['Space', 'Select', 'Rectangle', 'Polygon', 'Place Component', 'Apply Property', 'Scale'],
        // d3 scale functions translate the pixel coordinates of a location on the screen into RWU coordinates to use within the SVG's grid system
        scale: {
            x: null,
            y: null
        }
    },
    mutations: {
        // CURRENTSELECTIONS
        // state.currentSelections.story_id
        setCurrentSelectionsStoryId: function(state, payload) {
            state.currentSelections.story_id = payload.story_id;
            state.currentSelections.space_id = null;
        },
        // state.currentSelections.space_id
        setCurrentSelectionsSpaceId: function(state, payload) {
            state.currentSelections.space_id = payload.space_id
        },
        setCurrentSelectionsMode: function(state, payload) {
            const mode = state.modes.find((m) => {
                return m === payload.mode;
            });
            state.currentSelections.mode = mode || state.currentSelections.mode;
        },
        // SCALE
        //state.scale.x
        setScaleX: function(state, payload) {
            state.scale.x = payload.scaleX;
        },
        //state.scale.y
        setScaleY: function(state, payload) {
            state.scale.y = payload.scaleY;
        }
    },
    getters: {
        // the story with the currentSelections.story_id
        currentStory: (state, getters, rootState) => {
            return rootState.models.stories.find((s) => {
                return s.id === state.currentSelections.story_id;
            })
        },
        // the space on the currentStory with the currentSelections.space_id
        currentSpace: (state, getters, rootState) => {
            return getters.currentStory.spaces.find((s) => {
                return s.id === state.currentSelections.space_id;
            })
        },
        // the geometry on the currentStory
        currentStoryGeometry: (state, getters, rootState) => {
            return rootState.geometry.find((g) => {
                return g.id === getters.currentStory.geometry_id;
            })
        }
    }
}
