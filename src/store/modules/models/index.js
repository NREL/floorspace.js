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
        initStory (context) {
            context.commit('initStory');
            // TODO: return id in promise
            context.dispatch('geometry/initGeometry', {}, {root: true});

            context.commit('updateStoryWithData', {
                story: context.state.stories[context.state.stories.length - 1],
                geometry_id: context.rootState.geometry[context.rootState.geometry.length - 1].id
            });
        },
        // initialize a new space
        // must update the associated story to reference the new space
        initSpace: function(context, payload) {
            // const story = context.state.stories.find((s) => {
            //     return s.id === payload.story_id;
            // });
            // context.commit('initSpace', {
            //     story: story
            // });
        }
    },
    mutations: {
        // initialize a new story
        // must initialize an associated geometry object - possibly in component logic
        initStory (state, payload) {
            const story = new factory.Story();
            story.name = 'Story ' + (state.stories.length + 1);
            state.stories.push(story);
        },
        // initialize a new space
        // must update the associated story to reference the new space
        initSpace (state, payload) {
            // const space = new factory.Space();
            // space.name = 'Space ' + (payload.story.spaces.length + 1);
            // payload.story.spaces.push(space);
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
