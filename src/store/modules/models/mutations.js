export default {
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
        if ('name' in payload) {
            payload.space.name = payload.name;
        }
    }
}
