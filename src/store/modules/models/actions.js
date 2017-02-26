import factory from './factory.js'
import Validator from './../../utilities/validator.js'

export default {
    initStory (context) {
        const story = new factory.Story();
        story.name = 'Story ' + (context.state.stories.length + 1);
        context.commit('initStory', {
            story: story
        });

        // set the new story as the current story
        context.dispatch('application/setCurrentStory', {
            story: story
        }, { root: true });

        // create a geometry object for the story
        context.dispatch('geometry/initGeometry', {
            story: story
        }, { root: true });
    },

    initSpace (context, payload) {
        const space = new factory.Space();
        space.name = 'Space ' + (payload.story.spaces.length + 1);
        context.commit('initSpace', {
            story: payload.story,
            space: space
        });
    },

    initShading (context, payload) {
        const shading = new factory.Shading();
        shading.name = 'Shading ' + (payload.story.shading.length + 1);
        context.commit('initShading', {
            story: payload.story,
            shading: shading
        });
    },

    destroyStory (context, payload) {
        context.commit('destroyStory', {
            story: payload.story
        });
    },

    destroySpace (context, payload) {
        context.commit('destroySpace', {
            space: payload.space,
            story: payload.story
        });

        // destroy geometry associated with the space
        context.dispatch('geometry/destroyFaceAndDescendents', {
            face: context.rootGetters['application/currentStoryGeometry'].faces.find(f => f.id === payload.space.face_id),
            geometry: context.rootGetters['application/currentStoryGeometry']
        }, { root: true });
    },

    destroyShading (context, payload) {
        context.commit('destroySpace', {
            space: payload.space,
            story: payload.story
        });

        // TODO: update destroyFaceAndDescendents to work with shading
        // destroy geometry associated with the shading
        context.dispatch('geometry/destroyFaceAndDescendents', {
            shading: context.rootGetters['application/currentStoryGeometry'].shading.find(f => f.id === payload.shading.face_id),
            geometry: context.rootGetters['application/currentStoryGeometry']
        }, { root: true });
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
        const space = context.rootState.application.currentSelections.story.spaces.find(s => s.id === payload.space.id),
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
        const shading = context.rootState.application.currentSelections.story.shading.find(s => s.id === payload.shading.id),
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

    createImageForStory (context, payload) {
        const image = new factory.Image(payload.src);
        context.commit('initImage', { image: image });
        context.commit('updateStoryWithData', {
            story: payload.story,
            image_id: image.id
        });
    },
    createObjectWithType (context, payload) {
        context.commit('initObject', {
            type: payload.type,
            object: payload.object
        });
    }
}
