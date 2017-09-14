import _ from 'lodash';
import libconfig from './libconfig';
import factory from './factory';
import geometryFactory from '../geometry/factory';
import helpers from './helpers';
import geometryHelpers from '../geometry/helpers';

export default {
  initStory(context) {
      const name = helpers.generateName(context.state, 'stories');
      const story = new factory.Story(name);

      // create story
      context.commit('initStory', { story });
      // create geometry
      context.dispatch('geometry/initGeometry', { story_id: story.id }, { root: true });
      // create space and select
      context.dispatch('initSpace', { story });
      context.dispatch('selectStory', { story });
    },

    initSpace (context, payload) {
        const story = context.state.stories.find(s => s.id === payload.story.id),
            name = helpers.generateName(context.state, 'spaces', story),
            space = new factory.Space(name);

        context.commit('initSpace', { story, space });
    },

    initShading (context, payload) {
        const story = context.state.stories.find(s => s.id === payload.story.id),
            name = helpers.generateName(context.state, 'shading', story),
            shading = new factory.Shading(name);

        context.commit('initShading', { story, shading });
    },

    destroyStory(context, payload) {
      const stories = context.state.stories;
      const storyIndex = stories.findIndex(s => s.id === payload.story.id);
      const story = stories[storyIndex];

      context.commit('destroyStory', { story });

      if (stories.length === 0) {
        context.dispatch('initStory');
      } else {
        context.dispatch('selectStory', { story: stories[storyIndex - 1] });
      }
    },

    destroySpace (context, payload) {
        const story = context.state.stories.find(s => s.id === payload.story.id),
            space = story.spaces.find(s => s.id === payload.space.id);

        context.commit('destroySpace', {
            space: space,
            story: story
        });
        const face = context.rootGetters['application/currentStoryGeometry'].faces.find(f => f.id === space.face_id);
        if (face) {
            // destroy face associated with the space
            context.dispatch('geometry/destroyFaceAndDescendents', {
                face: face,
                geometry_id: context.rootGetters['application/currentStoryGeometry'].id
            }, { root: true });
        }
    },

    destroyShading (context, payload) {
        const story = context.state.stories.find(s => s.id === payload.story.id),
            shading = story.shading.find(s => s.id === payload.shading.id);

        context.commit('destroyShading', {
            shading: shading,
            story: story
        });

        const face = context.rootGetters['application/currentStoryGeometry'].faces.find(f => f.id === shading.face_id);
        if (face) {
            // destroy face associated with the space
            context.dispatch('geometry/destroyFaceAndDescendents', {
                face: face,
                geometry_id: context.rootGetters['application/currentStoryGeometry'].id
            }, { root: true });
        }
    },

    destroyImage (context, payload) {
        const story = context.state.stories.find(s => s.id === payload.story.id),
            image = story.images.find(i => i.id === payload.image.id);

        context.commit('destroyImage', {
            image: image,
            story: story
        });
    },

    // this is ONLY for library objects and does not include shading, spaces, or stories
    destroyObject (context, payload) {
        context.commit('destroyObject', {
            object: payload.object
        });
    },

    updateStoryWithData (context, payload) {
        const story = context.state.stories.find(s => s.id === payload.story.id),
            validProperties = Object.keys(libconfig.stories.keymap),
            cleanedPayload = {};

        // remove extra properties from the payload
        for (var key in payload) {
            if (payload.hasOwnProperty(key) && ~validProperties.indexOf(key)) {
                cleanedPayload[key] = payload[key];
            }
        }
        cleanedPayload.story = story;

        // TODO: validation
        context.commit('updateStoryWithData', cleanedPayload);
    },

    updateSpaceWithData (context, payload) {
        const space = context.getters.allSpaces.find(s => s.id === payload.space.id),
            validProperties = Object.keys(space),
            cleanedPayload = {};

        // remove extra properties from the payload
        for (var key in payload) {
            if (payload.hasOwnProperty(key) && ~validProperties.indexOf(key)) {
                cleanedPayload[key] = payload[key];
            }
        }
        cleanedPayload.space = space;

        // TODO: validation
        context.commit('updateSpaceWithData', cleanedPayload);
    },

    updateShadingWithData (context, payload) {
        const shading = context.getters.allShading.find(s => s.id === payload.shading.id),
            validProperties = Object.keys(shading),
            cleanedPayload = {};

        // remove extra properties from the payload
        for (var key in payload) {
            if (payload.hasOwnProperty(key) && ~validProperties.indexOf(key)) {
                cleanedPayload[key] = payload[key];
            }
        }
        cleanedPayload.shading = shading;

        // TODO: validation
        context.commit('updateShadingWithData', cleanedPayload);
    },

    updateImageWithData (context, payload) {
        const image = context.getters.allImages.find(i => i.id === payload.image.id),
            validProperties = Object.keys(image),
            cleanedPayload = {};

        // remove extra properties from the payload
        for (var key in payload) {
            if (payload.hasOwnProperty(key) && ~validProperties.indexOf(key)) {
                cleanedPayload[key] = payload[key];
            }
        }
        cleanedPayload.image = image;

        // TODO: validation
        context.commit('updateImageWithData', cleanedPayload);
    },

    updateObjectWithData (context, payload) {
        const object = helpers.libraryObjectWithId(context.state, payload.object.id);
        payload.object = object;
        // TODO: validation
        context.commit('updateObjectWithData', payload);
    },

  createImageForStory(context, payload) {
    const story = context.state.stories.find(s => s.id === payload.story_id);
    const name = helpers.generateName(context.state, 'images', story);
    const image = new factory.Image(name, payload.src);

    image.height = payload.height;
    image.width = payload.width;
    image.x = payload.x;
    image.y = payload.y;

    context.commit('createImageForStory', {
      story_id: story.id,
      image,
    });
  },

    createObjectWithType (context, payload) {
        const type = payload.type,
            name = helpers.generateName(context.state, type),
            object = new helpers.map[type].init({ name });

        context.commit('initObject', { type, object });
    },

  selectStory(context, payload) {
    const story = payload.story;
    context.dispatch('application/setCurrentStoryId', { id: story.id }, { root: true });
  },

  createWindow(context, payload) {
    const
      { story_id, edge_id, window_defn_id, alpha } = payload,
      story = _.find(context.state.stories, { id: story_id }),
      windowDefn = _.find(context.state.library.window_definitions, { id: window_defn_id }),
      geometry = story && _.find(context.rootState.geometry, { id: story.geometry_id }),
      edge = geometry && _.find(geometry.edges, { id: edge_id });
    if (!story) {
      throw new Error('Story not found');
    } else if (!windowDefn) {
      throw new Error('Window Definition not found');
    } else if (!geometry) {
      throw new Error('Geometry not found');
    } else if (!edge) {
      throw new Error('Edge not found');
    } else if (alpha < 0 || alpha > 1) {
      throw new Error('Alpha must be between 0 and 1');
    }
    context.commit('createWindow', payload);
  },

  createDaylightingControl(context, payload) {
    const
      { story_id, daylighting_control_defn_id, x, y } = payload,
      story = _.find(context.state.stories, { id: story_id }),
      daylightingDefn = _.find(context.state.library.daylighting_control_definitions, { id: daylighting_control_defn_id }),
      geometry = story && _.find(context.rootState.geometry, { id: story.geometry_id }),
      vertex = geometry && (
        geometryHelpers.vertexForCoordinates({ x, y }, geometry) || geometryFactory.Vertex(x, y));
    if (!story) {
      throw new Error('Story not found');
    } else if (!daylightingDefn) {
      throw new Error('Window Definition not found');
    } else if (!geometry) {
      throw new Error('Geometry not found');
    } else if (!vertex.id) {
      throw new Error('Unable to find or create vertex');
    }
    context.commit('geometry/ensureVertsExist', { geometry_id: geometry.id, vertices: [vertex] });
    context.commit('createDaylightingControl', { ...payload, vertex_id: vertex.id });
  },
};
