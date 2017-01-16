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
            // create and save the story, set as current story
            const story = new factory.Story();
            story.name = 'Story ' + (context.state.stories.length + 1);
            context.commit('initStory', {
                story: story
            });
            context.dispatch('application/setCurrentStory', {
                'story': story
            }, { root: true });

            // create and save a default space for the story, set as current space
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
        },
        // initialize a new space on a story
        initSpace (context, payload) {
            const space = new factory.Space();
            space.name = 'Space ' + (payload.story.spaces.length + 1);
            context.commit('initSpace', {
                story: payload.story,
                space: space
            });
        },
        // validate and update simple properties on the story, other actions will be used to add images, spaces, and windows to a story
        updateStoryWithData (context, payload) {
            const validatedPayload = { story: payload.story };
            const validator = new Validator(payload, validatedPayload);

            validator.validateLength('name', 1);
            validator.validateFloat('below_floor_plenum_height');
            validator.validateFloat('floor_to_ceiling_height');
            validator.validateInt('multiplier');

            context.commit('updateStoryWithData', validator.validatedPayload);
        }
    },
    mutations: {
        // store a new story
        initStory (state, payload) {
            state.stories.push(payload.story);
        },
        // initialize a new space on a story
        initSpace (state, payload) {
            payload.story.spaces.push(payload.space);
        },
        updateStoryWithData (state, payload) {
            if ('name' in payload) {
                payload.story.name = payload.name;
            }
            if ('below_floor_plenum_height' in payload) {
                payload.story.below_floor_plenum_height = payload.below_floor_plenum_height;
            }
            if ('floor_to_ceiling_height' in payload) {
                payload.story.floor_to_ceiling_height = payload.floor_to_ceiling_height;
            }
            if ('multiplier' in payload) {
                payload.story.multiplier = payload.multiplier;
            }
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

function Validator (payload, validatedPayload) {
    return {
        validatedPayload: validatedPayload,
        validateLength (key, minLength = 0) {
            if (key in payload && payload[key].length >= minLength) {
                validatedPayload[key] = payload[key];
            }
        },
        validateFloat (key) {
            if (key in payload && !isNaN(parseFloat(payload[key]))) {
                validatedPayload[key] = parseFloat(payload[key]);
            }
        },
        validateInt (key) {
            if (key in payload && !isNaN(parseInt(payload[key]))) {
                validatedPayload[key] = parseInt(payload[key]);
            }
        }
    }
}
