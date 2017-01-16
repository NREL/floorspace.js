import factory from './../../factory/index.js'
// the application state
export default {
    namespaced: true,
    state: {
        currentSelections: {
            // models currently being edited
            story: null,
            space: null,
            // active tools
            mode: 'Space',
            tool: null
        },
        // TODO: drawing modes may need to be moved into the component as local state
        modes: ['Space', 'Select', 'Rectangle', 'Polygon', 'Place Component', 'Apply Property', 'Scale'],
        // d3 scale functions translate the pixel coordinates of a location on the screen into RWU coordinates to use within the SVG's grid system
        scale: {
            x: null,
            y: null
        }
    },
    actions: {
        setCurrentStory (context, payload) {
            // check that story exists
            if (~context.rootState.models.stories.indexOf(payload.story)) {
                context.commit('setCurrentSelectionsStoryId', payload);
            }
        },
        setCurrentSpace (context, payload) {
            // check that space exists on the current story
            if (~context.state.currentSelections.story.spaces.indexOf(payload.space)) {
                context.commit('setCurrentSelectionsSpaceId', payload);
            }
        },
        setRenderMode (context, payload) {
            // check that mode exists
            if (~context.state.modes.indexOf(payload.mode)) {
                context.commit('setCurrentSelectionsMode', payload);
            }
        },
        // update d3 scaling functions
        setScaleX (context, payload) { context.commit('setScaleX', payload); },
        setScaleY (context, payload) { context.commit('setScaleY', payload); }
    },
    mutations: {
        // CURRENTSELECTIONS
        // set current story selection, clear current space selection
        setCurrentSelectionsStoryId (state, payload) {
            state.currentSelections.story = payload.story;
            state.currentSelections.space = null;
        },
        // set current space selection
        setCurrentSelectionsSpaceId (state, payload) {
            state.currentSelections.space = payload.space
        },
        setCurrentSelectionsMode (state, payload) {
           state.currentSelections.mode = payload.mode;
        },
        // SCALE
        setScaleX (state, payload) {
            state.scale.x = payload.scaleX;
        },
        setScaleY (state, payload) {
            state.scale.y = payload.scaleY;
        }
    },
    getters: {
        // the story with the currentSelections.story_id
        currentStory: (state, getters, rootState) => {
            // return rootState.models.stories.find((s) => {
            //     return s.id === state.currentSelections.story_id;
            // })
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
                return g.id === state.currentSelections.story.geometry_id;
            });
        }
    }
}
