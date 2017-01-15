import factory from './../../factory/index.js'

export default {
    namespaced: true,
    state: {
        'stories': [/*{
            'id': null,
            'handle': null,
            'name': null,
            'below_floor_plenum_height': 0,
            'floor_to_ceiling_height': 0,
            'multiplier': 0,
            'images': [], // image ids
            'geometry_id': null, // geometry id
            'spaces': [{
                'id': null,
                'handle': null,
                'name': null,
                'face_id': null, // face_id
                'building_unit': null, // building_unit id
                'thermal_zone': null, // thermal_zone id
                'space_type': null, // space_type id
                'construction_set': null, // construction_set id
                'daylighting_controls': [{
                    'daylighting_control': null,
                    'vertex': null
                }]
            }],
            'windows': [{
                'window': null,
                'vertex': null
            }]
        }*/],
        // lib
        'building_units': [],
        'thermal_zones': [],
        'space_types': [],
        'construction_sets': [],
        'constructions': [],
        'windows': [],
        'daylighting_controls': []
    },
    actions: {
        initStory(context) {
            const story = new factory.Story();
            story.name = 'Story ' + (context.state.stories.length + 1);
            context.state.stories.push(story);

            context.commit('initStory', {'story_id': story});
            context.dispatch('initGeometry', {'story_id': story});
        },
        // initialize a new space
        // must update the associated story to reference the new space
        initSpace: function(context, payload) {
            const story = context.state.stories.find((s) => {
                return s.id === payload.story_id;
            });
            context.commit('initSpace', {
                story: story
            })
        }
    },
    mutations: {
        // initialize a new story
        // must initialize an associated geometry object - possibly in component logic
        initStory: function(state, payload) {
            const story = new factory.Story();
            story.name = 'Story ' + (state.stories.length + 1);
            state.stories.push(story);
        },
        // initialize a new space
        // must update the associated story to reference the new space
        initSpace: function(state, payload) {debugger;
            const space = new factory.Space();
            space.name = 'Space ' + (payload.story.spaces.length + 1);
            payload.story.spaces.push(space);
        },

        //TODO: validate
        updateStoryWithData: function(state, payload) {
            const story = state.stories.find((s) => {
                return s.id === payload.id;
            });
            story.name = payload.name || story.name;
            story.geometry_id = 'geometry_id' in payload && !isNaN(parseFloat(payload.geometry_id)) ? parseFloat(payload.geometry_id) : story.geometry_id;
            story.below_floor_plenum_height = 'below_floor_plenum_height' in payload && !isNaN(parseFloat(payload.below_floor_plenum_height)) ? parseFloat(payload.below_floor_plenum_height) : story.below_floor_plenum_height;
            story.floor_to_ceiling_height = 'floor_to_ceiling_height' in payload && !isNaN(parseFloat(payload.floor_to_ceiling_height)) ? parseFloat(payload.floor_to_ceiling_height) : story.floor_to_ceiling_height;
            story.multiplier = 'multiplier' in payload && !isNaN(parseInt(payload.multiplier)) ? parseInt(payload.multiplier) : story.multiplier;

        },
        updateSpaceWithData: function(state, payload) {
            const story = state.stories.find((s) => {
                return s.id === state.application.currentSelections.story_id;
            });
            const space = story.spaces.find((s) => {
                return s.id === payload.id;
            });
            space.name = payload.name || space.name;
        }
    },
    getters: {
        //TODO: validate
        updateStoryWithData: function(state, payload) {
            const story = state.stories.find((s) => {
                return s.id === payload.id;
            });
            story.name = payload.name || story.name;
            story.below_floor_plenum_height = 'below_floor_plenum_height' in payload && !isNaN(parseFloat(payload.below_floor_plenum_height)) ? parseFloat(payload.below_floor_plenum_height) : story.below_floor_plenum_height;
            story.floor_to_ceiling_height = 'floor_to_ceiling_height' in payload && !isNaN(parseFloat(payload.floor_to_ceiling_height)) ? parseFloat(payload.floor_to_ceiling_height) : story.floor_to_ceiling_height;
            story.multiplier = 'multiplier' in payload && !isNaN(parseInt(payload.multiplier)) ? parseInt(payload.multiplier) : story.multiplier;

        },
        updateSpaceWithData: function(state, payload) {
            const story = state.stories.find((s) => {
                return s.id === state.application.currentSelections.story_id;
            });
            const space = story.spaces.find((s) => {
                return s.id === payload.id;
            });
            space.name = payload.name || space.name;
        }
    }
}
