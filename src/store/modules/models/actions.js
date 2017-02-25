import factory from './factory.js'
import Validator from './../../utilities/validator.js'

export default {
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
    initShading (context, payload) {
        const shading = new factory.Shading();
        shading.name = 'Shading ' + (payload.story.shading.length + 1);
        context.commit('initShading', {
            story: payload.story,
            shading: shading
        });
    },

    destroySpace (context, payload) {
        context.commit('destroySpace', {
            space: payload.space,
            story: payload.story
        });
        // when a space is destroyed, destroy its associated geometry on the story
        context.dispatch('geometry/destroyFaceAndDescendents', {
            face: context.rootGetters['application/currentStoryGeometry'].faces.find(f => f.id === payload.space.face_id),
            geometry: context.rootGetters['application/currentStoryGeometry']
        }, { root: true });
    },

    destroyStory (context, payload) {
        context.commit('destroyStory', {
            story: payload.story
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
        validator.validateBoolean('imageVisible');

        context.commit('updateStoryWithData', validator.validatedPayload);
    },
    // validate and update simple properties on the space
    updateSpaceWithData (context, payload) {
        const validatedPayload = { space: payload.space };
        const validator = new Validator(payload, validatedPayload);

        validator.validateLength('name', 1);
        context.commit('updateSpaceWithData', validator.validatedPayload);
    },
    // validate and update simple properties on the space
    updateShadingWithData (context, payload) {
        const validatedPayload = { space: payload.shading };
        const validator = new Validator(payload, validatedPayload);

        validator.validateLength('name', 1);
        context.commit('updateShadingWithData', validator.validatedPayload);
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
