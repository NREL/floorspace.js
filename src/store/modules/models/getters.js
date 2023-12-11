export default {
  // all spaces across all stories
  allSpaces(state, getters, rootState, rootGetters) {
    return rootState.models.stories.reduce((spaces, story) => {
      return spaces.concat(story.spaces);
    }, []);
  },
  // all shading across all stories
  allShading(state, getters, rootState, rootGetters) {
    return rootState.models.stories.reduce((shading, story) => {
      return shading.concat(story.shading);
    }, []);
  },
  // all spaces across all stories
  allImages(state, getters, rootState, rootGetters) {
    return rootState.models.stories.reduce((images, story) => {
      return images.concat(story.images);
    }, []);
  },
  all(state, getters, rootState, rootGetters) {
    let objs = {
      ...rootState.models.library,
      stories: rootState.models.stories,
      spaces: getters.allSpaces,
      shading: getters.allShading,
      images: getters.allImages,
    };

    return Object.keys(objs).reduce((out, key) => {
      out.push(...objs[key]);
      return out;
    }, []);
  },
};
