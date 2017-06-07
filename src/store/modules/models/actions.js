import factory from './factory.js'
import Validator from './../../utilities/validator.js'
import helpers from './helpers.js'

export default {
    initStory (context) {
        const [name, storyId] = helpers.generateName(context.state, 'stories'),
            story = new factory.Story({ name, storyId });

        // create story/geometry
        context.commit('initStory', { story });
        context.dispatch('geometry/initGeometry', { story }, { root: true });
        // create space and select
        context.dispatch('initSpace', { story });
        context.dispatch('selectStoryAndSpace', { story });
    },

    initSpace (context, payload) {
        const story = context.state.stories.find(s => s.id === payload.story.id),
            [name] = helpers.generateName(context.state, 'spaces', story),
            space = new factory.Space({ name });

        context.commit('initSpace', { story, space });
    },

    initShading (context, payload) {
        const story = context.state.stories.find(s => s.id === payload.story.id),
            [name] = helpers.generateName(context.state, 'shading', story),
            shading = new factory.Shading({ name });

        context.commit('initShading', { story, shading });
    },

    destroyStory (context, payload) {
        const stories = context.state.stories,
            storyIndex = stories.findIndex(s => s.id === payload.story.id),
            story = stories[storyIndex];

        context.commit('destroyStory', { story });

        if (stories.length === 0) {
            context.dispatch('initStory');
        } else {
            context.dispatch('selectStoryAndSpace',{ story: stories[storyIndex - 1] });
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
                geometry: context.rootGetters['application/currentStoryGeometry']
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

        // TODO: update destroyFaceAndDescendents to work with shading
        const face = context.rootGetters['application/currentStoryGeometry'].faces.find(f => f.id === shading.face_id);
        if (face) {
            // destroy face associated with the space
            context.dispatch('geometry/destroyFaceAndDescendents', {
                face: face,
                geometry: context.rootGetters['application/currentStoryGeometry']
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
            validProperties = Object.keys(story),
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

    createImageForStory (context, payload) {
        const [name] = helpers.generateName(context.state, 'images'),
            img = new Image();

        img.onload = () => {
            const image = new factory.Image({ src: payload.src, name });

            image.height = payload.height;
            image.width = payload.width;

            image.x = payload.x;
            image.y = payload.y;

            context.commit('createImageForStory', {
                story_id: payload.story_id,
                image: image
            });
        };
        img.src = payload.src;
    },

    createObjectWithType (context, payload) {
        const type = payload.type,
            [name] = helpers.generateName(context.state, type),
            object = new helpers.map[type].init({ name });

        context.commit('initObject', { type, object });
    },

    selectStoryAndSpace (context, payload) {
        const story = payload.story,
            // select last space
            space = story.spaces[story.spaces.length - 1];

        context.dispatch('application/setCurrentStory', { story }, { root: true });
        context.dispatch('application/setCurrentSpace', { space }, { root: true });
        context.dispatch('application/setApplicationMode', { mode: 'spaces' }, { root: true });
    }
}
