import factory from './factory.js'

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
    // validate and update simple properties on the story, other actions will be used to add images, spaces, and windows to a story
    updateStoryWithData (context, payload) {
        const validatedPayload = { story: payload.story };
        const validator = new factory.Validator(payload, validatedPayload);

        validator.validateLength('name', 1);
        validator.validateFloat('below_floor_plenum_height');
        validator.validateFloat('floor_to_ceiling_height');
        validator.validateInt('multiplier');

        context.commit('updateStoryWithData', validator.validatedPayload);
    },
    // validate and update simple properties on the space
    updateSpaceWithData (context, payload) {
        const validatedPayload = { space: payload.space };
        const validator = new factory.Validator(payload, validatedPayload);

        validator.validateLength('name', 1);
        context.commit('updateSpaceWithData', validator.validatedPayload);
    }
}
