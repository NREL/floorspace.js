export default {
    // store a new story
    initStory (state, payload) {
        state.stories.push(payload.story);
    },
    // initialize a new space on a story
    initSpace (state, payload) {
        payload.story.spaces.push(payload.space);
    },
    // initialize a new shading on a story
    initShading (state, payload) {
        payload.story.shading.push(payload.shading);
    },
    // store a new image
    initImage (state, payload) {
        state.images.push(payload.image);
    },
    initObject (state, payload) {
        state.library[payload.type].push(payload.object);
    },

    destroySpace (state, payload) {
        payload.story.spaces.splice(payload.story.spaces.findIndex((s) => {
            return s.id === payload.space.id;
        }), 1);
    },
    destroyShading (state, payload) {
        payload.story.shading.splice(payload.story.shading.findIndex((s) => {
            return s.id === payload.shading.id;
        }), 1);
    },
    destroyStory (state, payload) {
        state.stories.splice(state.stories.findIndex((s) => {
            return s.id === payload.story.id;
        }), 1);
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
        if ('image_id' in payload) {
            payload.story.image_id = payload.image_id;
        }
        if ('imageVisible' in payload) {
            payload.story.imageVisible = payload.imageVisible;
        }
    },
    updateSpaceWithData (state, payload) {
        if ('name' in payload) {
            payload.space.name = payload.name;
        }
        if ('face_id' in payload) {
            payload.space.face_id = payload.face_id;
        }
    },
    updateShadingWithData (state, payload) {
        if ('name' in payload) {
            payload.shading.name = payload.name;
        }
        if ('face_id' in payload) {
            payload.shading.face_id = payload.face_id;
        }
    }
}
