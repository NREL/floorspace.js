import helpers from './helpers.js'

export default {
    initStory (state, payload) { state.stories.push(payload.story); },
    initSpace (state, payload) { payload.story.spaces.push(payload.space); },
    initShading (state, payload) { payload.story.shading.push(payload.shading); },

    initImage (state, payload) { state.images.push(payload.image); },

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
    destroyObject (state, payload) {
        // search the library
        for (var type in state.library) {
            if (state.library.hasOwnProperty(type)) {
                state.library[type].splice(state.library[type].findIndex((i) => {
                    return i.id === payload.object.id;
                }), 1)
            }
        }
    },

    updateStoryWithData (state, payload) {
        const story = payload.story;
        delete payload.story;
        Object.assign(story, payload);

        if ('image_id' in payload) {
            // payload.story.image_id = payload.image_id;
            // if the image doesn't already exist on the story, add it to image_ids
            if (!~story.image_ids.indexOf(payload.image_id)) {
                story.image_ids.push(payload.image_id);
            }
        }
    },
    updateSpaceWithData (state, payload) {
        const space = payload.space;
        Object.assign(space, payload);
        delete space.space;
    },

    updateShadingWithData (state, payload) {
        const shading = payload.shading;
        Object.assign(shading, payload);
        delete shading.shading;
    },

    updateObjectWithData (state, payload) {
        const object = payload.object;
        Object.assign(object, payload);
        delete object.object;
    }
}
