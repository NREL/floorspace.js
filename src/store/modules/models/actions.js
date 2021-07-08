import _ from 'lodash';
import libconfig from './libconfig';
import factory, { getDefaults } from './factory';
import idFactory, { genName } from './../../utilities/generateId';
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
      context.dispatch('initShading', { story });
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
      context.dispatch('geometry/destroyGeometry', story.geometry_id, { root: true });
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
        const geom = context.rootGetters['application/currentStoryGeometry'];
        const face = geom.faces.find(f => f.id === space.face_id);
        if (face) {
            // delete all windows associated with an edge on that face
            const edges = geom.edges.filter(edge => face.edgeRefs.map(er => er.edge_id).includes(edge.id));
            edges.forEach(edge => {
              const windows = story.windows.filter(w => w.edge_id === edge.id);
              windows.forEach(window => context.dispatch('destroyWindow', {
                  story_id: story.id,
                  object: window,
                }));
            });
            // destroy face associated with the space
            context.dispatch('geometry/destroyFaceAndDescendents', {
                face: face,
                geometry_id: geom.id
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

  destroyWindowDef(context, payload) {
    context.commit('destroyWindowsByDefinition', payload.object);
    context.commit('destroyObject', payload);
  },

  destroyDaylightingControlDef(context, payload) {
    context.commit('destroyDaylightingControlsByDefinition', payload.object);
    context.commit('destroyObject', payload);
  },

  destroyDoorDef(context, payload) {
    context.commit('destroyDoorsByDefinition', payload.object);
    context.commit('destroyObject', payload);
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
      const
        image = context.getters.allImages.find(i => i.id === payload.image.id),
        validProperties = _.difference(Object.keys(image), ['src', 'naturalWidth', 'naturalHeight']);

      if (payload.scale) {
        payload.height = payload.scale * image.naturalHeight;
        payload.width = payload.scale * image.naturalWidth;
      }
      const cleanedPayload = _.pick(payload, validProperties);
      cleanedPayload.image = image;

      // TODO: validation
      context.commit('updateImageWithData', cleanedPayload);
    },

  updateWindowDefinitionWithData({ state, dispatch }, payload) {
    const { object: { id } } = payload;

    const windowDefnDefaults = _.pick(
      getDefaults('WindowDefinition'),
      ['height', 'width', 'window_spacing', 'wwr']);
    // blank out the keys that don't make sense for that type.
    if (payload.window_definition_mode === 'Window to Wall Ratio') {
      Object.assign(payload, windowDefnDefaults, {
        height: null,
        width: null,
        window_spacing: null,
      });
    } else if (payload.window_definition_mode === 'Repeating Windows') {
      Object.assign(payload, windowDefnDefaults, {
        wwr: null,
      });
    } else if (payload.window_definition_mode === 'Single Window') {
      Object.assign(payload, windowDefnDefaults, {
        wwr: null,
        window_spacing: null,
      });
    } else if (payload.window_definition_mode) {
      throw new Error(`unrecognized window_definition_mode: ${payload.window_definition_mode}`);
    }

    if (_.includes(['Window to Wall Ratio', 'Repeating Windows'], payload.window_definition_mode)) {
      // upon change of window_definition_mode, we need to
      // prevent multiple repeating/wwr from sharing the same edge
      const windowsToDelete = _.flatMap(state.stories, story =>
        _.chain(story.windows)
          .filter({ window_definition_id: id })
          .groupBy('edge_id')
          .values()
          .flatMap(_.tail)
          .map(w => ({ story_id: story.id, object: { id: w.id } }))
          .value());

      windowsToDelete.forEach(pl => dispatch('destroyWindow', pl));
    }

    dispatch('updateObjectWithData', payload);
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
    image.naturalWidth = payload.naturalWidth;
    image.naturalHeight = payload.naturalHeight;

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
      { story_id, edge_id, window_definition_id, alpha } = payload,
      story = _.find(context.state.stories, { id: story_id }),
      windowDefn = _.find(context.state.library.window_definitions, { id: window_definition_id }),
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

    const windowsOnEdge = _.filter(story.windows, { edge_id })
      .map(w => ({
        ...w,
        window_definition_mode: _.find(
          context.state.library.window_definitions,
          { id: w.window_definition_id },
        ).window_definition_mode,
      }));
    let windowsToDelete;
    if (windowDefn.window_definition_mode === 'Single Window') {
      // single windows can coexist with other single windows
      windowsToDelete = _.reject(windowsOnEdge, { window_definition_mode: 'Single Window' });
    } else {
      // Repeating and WWR cannot share with single window, or with one another.
      windowsToDelete = windowsOnEdge;
    }
    windowsToDelete.forEach(
      w => context.commit(
        'destroyWindow',
        { story_id, object: { id: w.id } }));

    context.commit('createWindow', {
      ...payload,
      id: idFactory.generate(),
      name: genName(windowDefn.name),
    });
  },

  /**
   * A batched version of the `createWindow` action
   *
   * @param {*} context 
   * @param {*} payload Array of windows to be created
   */
  createWindows(context, payload) {
    const deletes = [];
    const creates = [];

    payload.forEach((p) => {
      const
        { story_id, edge_id, window_definition_id, alpha } = p,
        story = _.find(context.state.stories, { id: story_id }),
        windowDefn = _.find(context.state.library.window_definitions, { id: window_definition_id }),
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

      const windowsOnEdge = _.filter(story.windows, { edge_id })
        .map(w => ({
          ...w,
          window_definition_mode: _.find(
            context.state.library.window_definitions,
            { id: w.window_definition_id },
          ).window_definition_mode,
        }));
      let windowsToDelete;
      if (windowDefn.window_definition_mode === 'Single Window') {
        // single windows can coexist with other single windows
        windowsToDelete = _.reject(windowsOnEdge, { window_definition_mode: 'Single Window' });
      } else {
        // Repeating and WWR cannot share with single window, or with one another.
        windowsToDelete = windowsOnEdge;
      }
      windowsToDelete.forEach(
        w => deletes.push({ story_id, object: { id: w.id } }));

      creates.push({
        ...p,
        id: idFactory.generate(),
        name: genName(windowDefn.name),
      });
    });

    context.commit('destroyWindows', deletes);
    context.commit('createWindows', creates);
  },

  createDoor(context, payload) {
    const
      { story_id, edge_id, door_definition_id, alpha } = payload,
      story = _.find(context.state.stories, { id: story_id }),
      doorDefn = _.find(context.state.library.door_definitions, { id: door_definition_id }),
      geometry = story && _.find(context.rootState.geometry, { id: story.geometry_id }),
      edge = geometry && _.find(geometry.edges, { id: edge_id });
    if (!story) {
      throw new Error('Story not found');
    } else if (!doorDefn) {
      throw new Error('Door Definition not found');
    } else if (!geometry) {
      throw new Error('Geometry not found');
    } else if (!edge) {
      throw new Error('Edge not found');
    } else if (alpha < 0 || alpha > 1) {
      throw new Error('Alpha must be between 0 and 1');
    }

    context.commit('createDoor', {
      ...payload,
      id: idFactory.generate(),
      name: genName(doorDefn.name),
    });
  },

  /**
   * Batched version of the `createDoor` action
   * @param {*} context 
   * @param {*} payload Array of doors to be created
   */
  createDoors(context, payload) {
    const arr = payload.map((p) => {
      const { story_id, edge_id, door_definition_id, alpha } = p,
      story = _.find(context.state.stories, { id: story_id }),
      doorDefn = _.find(context.state.library.door_definitions, { id: door_definition_id }),
      geometry = story && _.find(context.rootState.geometry, { id: story.geometry_id }),
      edge = geometry && _.find(geometry.edges, { id: edge_id });
      if (!story) {
        throw new Error('Story not found');
      } else if (!doorDefn) {
        throw new Error('Door Definition not found');
      } else if (!geometry) {
        throw new Error('Geometry not found');
      } else if (!edge) {
        throw new Error('Edge not found');
      } else if (alpha < 0 || alpha > 1) {
        throw new Error('Alpha must be between 0 and 1');
      }

      return {
        ...p,
        id: idFactory.generate(),
        name: genName(doorDefn.name),
      };
    });

    context.commit('createDoors', arr);
  },


  createDaylightingControl(context, payload) {
    const
      { story_id, face_id, daylighting_control_definition_id, x, y } = payload,
      story = _.find(context.state.stories, { id: story_id }),
      daylightingDefn = _.find(context.state.library.daylighting_control_definitions, { id: daylighting_control_definition_id }),
      geometry = story && _.find(context.rootState.geometry, { id: story.geometry_id }),
      face = geometry && _.find(geometry.faces, { id: face_id }),
      vertex = geometry && (
        geometryHelpers.vertexForCoordinates({ x, y }, geometry) || geometryFactory.Vertex(x, y));
    if (!story) {
      throw new Error('Story not found');
    } else if (!daylightingDefn) {
      throw new Error('Daylighting Control Definition not found');
    } else if (!geometry) {
      throw new Error('Geometry not found');
    } else if (!face) {
      throw new Error('Face not found');
    } else if (!vertex.id) {
      throw new Error('Unable to find or create vertex');
    }
    context.commit('geometry/ensureVertsExist', { geometry_id: geometry.id, vertices: [vertex] }, { root: true });
    context.commit('createDaylightingControl', {
      ...payload,
      vertex_id: vertex.id,
      id: idFactory.generate(),
      name: genName(daylightingDefn.name),
    });
  },
  destroyDaylightingControl({ commit }, payload) {
    commit('destroyDaylightingControl', payload);
  },
  destroyWindow({ commit }, payload) {
    commit('destroyWindow', payload);
  },

  /**
   * Batched version of the `destroyWindow` commit
   * @param {*} context 
   * @param {*} payload 
   */
  destroyWindows({ commit }, payload) {
    commit('destroyWindows', payload);
  },
  destroyDoor({ commit }, payload) {
    commit('destroyDoor', payload);
  },

  /**
   * Batched version of the `destroyDoor` commit
   * @param {*} context 
   * @param {*} payload 
   */
  destroyDoors({ commit }, payload) {
    commit('destroyDoors', payload);
  },
  modifyDaylightingControl({ commit }, payload) {
    commit('modifyDaylightingControl', payload);
  },
  modifyWindow({ commit }, payload) {
    commit('modifyWindow', payload);
  },
  modifyDoor({ commit }, payload) {
    commit('modifyDoor', payload);
  },
  destroyAllComponents({ commit }, { story_id }) {
    commit('dropDaylightingControls', { story_id });
    commit('dropWindows', { story_id });
    commit('dropDoors', { story_id });
  },
};
