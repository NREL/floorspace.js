import _ from 'lodash';
import helpers from './helpers.js'

export default {
    initStory (state, payload) { state.stories.push(payload.story); },
    initSpace (state, payload) { payload.story.spaces.push(payload.space); },
    initShading (state, payload) { payload.story.shading.push(payload.shading); },

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
    destroyImage (state, payload) {
        payload.story.images.splice(payload.story.images.findIndex((i) => {
            return i.id === payload.image.id;
        }), 1);
    },
    destroyStory (state, payload) {
        state.stories.splice(state.stories.findIndex((s) => {
            return s.id === payload.story.id;
        }), 1);
    },
  destroyObject(state, { object: { id } }) {
    // search the library
    state.library = _.mapValues(
      state.library,
      lst => _.reject(lst, { id }),
    );
  },

    updateStoryWithData (state, payload) {
        const story = payload.story;
        delete payload.story;
        Object.assign(story, payload);
    },
    createImageForStory (state, payload) {
        const story = state.stories.find(s => s.id === payload.story_id);
        story.images.push(payload.image);
    },

    updateSpaceWithData (state, payload) {
        var space = payload.space;
        Object.assign(space, payload);
        delete space.space;
    },

    updateShadingWithData (state, payload) {
        const shading = payload.shading;
        Object.assign(shading, payload);
        delete shading.shading;
    },
    updateImageWithData (state, payload) {
        const image = payload.image;
        Object.assign(image, payload);
        delete image.image;
    },
    updateObjectWithData (state, payload) {
        const object = payload.object;
        Object.assign(object, payload);
        delete object.object;
    },
  createWindow(state, { story_id, edge_id, window_defn_id, alpha }) {
    const story = _.find(state.stories, { id: story_id });
    story.windows.push({
      window_defn_id,
      edge_id,
      alpha,
    });
  },
}
