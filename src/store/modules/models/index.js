import factory from './../../factory/index.js'

export default {
    namespaced: true,
    state: {
        stories: [/*{
            id: null,
            name: null,
            geometry_id: null,
            images: [],
            handle: null,
            below_floor_plenum_height: 0,
            floor_to_ceiling_height: 0,
            multiplier: 0,
            spaces: [{
                id: null,
                name: null,
                handle: null
                face_id: null,
                daylighting_control_refs: [{
                    daylighting_control_id: null,
                    vertex_id: null
                }],
                building_unit_id: null,
                thermal_zone_id: null,
                space_type_id: null,
                construction_set_id: null
            }],
            windows: [{
                window_id: null,
                vertex_id: null
            }]
        }*/],
        // lib
        building_units: [],
        thermal_zones: [],
        space_types: [],
        construction_sets: [],
        constructions: [],
        windows: [],
        daylighting_controls: []
    },
    actions: {
        initStory (context) {
            // create and save the story
            const story = new factory.Story();
            story.name = 'Story ' + (context.state.stories.length + 1);
            context.commit('initStory', {
                story: story
            });
            context.dispatch('application/setCurrentStory', {
                'story': story
            }, { root: true });
            // create and save a default space for the story
            const space = new factory.Space();
            space.name = 'Space 1';
            context.commit('initSpace', {
                story: story,
                space: space
            });
            context.dispatch('application/setCurrentSpace', {
                'space': space
            }, { root: true });

            // create a geometry object for the story
            context.dispatch('geometry/initGeometry', {
                story: story
            }, { root: true });

            return story;
        },
        // initialize a new space
        // must update the associated story to reference the new space
        initSpace (context, payload) {
            const space = new factory.Space();
            space.name = 'Space ' + (payload.story.spaces.length + 1);
            context.commit('initSpace', {
                story: payload.story,
                space: space
            });
        }
    },
    mutations: {
        // store a new story
        initStory (state, payload) {
            state.stories.push(payload.story);
        },
        // initialize a new space
        // must update the associated story to reference the new space
        initSpace (state, payload) {
            payload.story.spaces.push(payload.space);
        },

        //TODO: validate
        updateStoryWithData (state, payload) {
            payload.story.name = payload.name || payload.story.name;
            payload.story.geometry_id = 'geometry_id' in payload && !isNaN(parseFloat(payload.geometry_id)) ? parseFloat(payload.geometry_id) : payload.story.geometry_id;
            payload.story.below_floor_plenum_height = 'below_floor_plenum_height' in payload && !isNaN(parseFloat(payload.below_floor_plenum_height)) ? parseFloat(payload.below_floor_plenum_height) : payload.story.below_floor_plenum_height;
            payload.story.floor_to_ceiling_height = 'floor_to_ceiling_height' in payload && !isNaN(parseFloat(payload.floor_to_ceiling_height)) ? parseFloat(payload.floor_to_ceiling_height) : payload.story.floor_to_ceiling_height;
            payload.story.multiplier = 'multiplier' in payload && !isNaN(parseInt(payload.multiplier)) ? parseInt(payload.multiplier) : payload.story.multiplier;
        },
        updateSpaceWithData (state, payload) {
            const story = state.stories.find((s) => {
                return s.id === state.application.currentSelections.story_id;
            });
            const space = story.spaces.find((s) => {
                return s.id === payload.id;
            });
            space.name = payload.name || space.name;
        }
    },
    getters: {}
}
