import { expect } from 'chai'
import Models from 'src/store/modules/models'
import modelFactory from 'src/store/modules/models/factory'

describe('models mutations', () => {
    var state, story;

    beforeEach(() => {
        state = JSON.parse(JSON.stringify(Models.state));
        story = new modelFactory.Story();
    });

    describe('story', () => {
        beforeEach(() => {
            Models.mutations.initStory(state, {
                story
            });
        });

        it('initStory', () => {
            expect(state.stories).to.have.lengthOf(1);
            expect(state.stories[0]).to.equal(story);
        });


        it('destroyStory', () => {
            Models.mutations.destroyStory(state, {
                story
            });

            expect(state.stories).to.have.lengthOf(0);
        });

        it('updateStoryWithData', () => {
            const storyIn = story;
            const payload = {
                story: storyIn
            };

            Models.mutations.updateStoryWithData(state, payload);

            expect(story.id).to.equal(storyIn.id);
        });
    });

    describe('space', () => {
        var space;

        beforeEach(() => {
            space = new modelFactory.Space();
        
            Models.mutations.initSpace(state, {
                story,
                space
            });
        });

        it('initSpace', () => {
            expect(story.spaces).to.have.lengthOf(1);
            expect(story.spaces[0]).to.equal(space);
        });

        it('destroySpace', () => {
            Models.mutations.destroySpace(state, {
                story,
                space
            });

            expect(story.spaces).to.have.lengthOf(0);
        });

        it('updateSpaceWithData', () => {
            const spaceIn = space;
            const payload = {
                space: spaceIn
            };

            Models.mutations.updateSpaceWithData(state, payload);

            expect(space.id).to.equal(spaceIn.id);
        });
    });

    describe('shading', () => {
        var shading;

        beforeEach(() => {
            shading = new modelFactory.Shading();

            Models.mutations.initShading(state, {
                story,
                shading
            });
        });

        it('initShading', () => {
            expect(story.shading).to.have.lengthOf(1);
            expect(story.shading[0]).to.equal(shading);
        });

        it('destroyShading', () => {
            Models.mutations.destroyShading(state, {
                story,
                shading
            });

            expect(story.shading).to.have.lengthOf(0);
        });

        it('updateShadingWithData', () => {
            const shadingIn = shading;
            const payload = {
                shading: shadingIn
            };

            Models.mutations.updateShadingWithData(state, payload);

            expect(shading.id).to.equal(shadingIn.id);
        });
    });

    describe('object', () => {
        var object;

        beforeEach(() => {
            object = new modelFactory.BuildingUnit();
    
            Models.mutations.initObject(state, {
                type:   'building_units',
                object: object
            });
        });

        it('initObject', () => {
            expect(state.library.building_units).to.include(object);
        });

        it('destroyObject', () => {
            Models.mutations.destroyObject(state, {
                object
            });

            expect(state.library.building_units).to.not.include(object);
        });

        it('updateObjectWithData', () => {
            const objectIn = object;
            const payload = {
                object: objectIn
            };

            Models.mutations.updateObjectWithData(state, payload);

            expect(object.id).to.equal(objectIn.id);
        });
    });

    describe('image', () => {
        var image;

        beforeEach(() => {
            image = new modelFactory.Image();

            Models.mutations.initStory(state, {
                story
            });
            Models.mutations.createImageForStory(state, {
                image,
                story_id: story.id
            });
        });

        it('createImageForStory', () => {
            expect(story.images).to.include(image);
        });


        it('destroyImage', () => {
            Models.mutations.destroyImage(state, {
                story,
                image
            });

            expect(story.images).to.have.lengthOf(0);
        });

        it('updateImageWithData', () => {
            const imageIn = image;
            const payload = {
                image: imageIn
            };

            Models.mutations.updateImageWithData(state, payload);

            expect(image.id).to.equal(imageIn.id);
        });
    });
});