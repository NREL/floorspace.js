import { expect } from 'chai'
import Models from 'src/store/modules/models'
import modelsFactory from 'src/store/modules/models/factory'
import geometryFactory from 'src/store/modules/geometry/factory'
import { testAction, Context } from '../helpers'

describe('models actions', () => {
    var context, story;

    beforeEach(() => {
        context = new Context('models');
        story = context._getCurrentStory();
    });

    describe('story', () => {
        it('initStory', (done) => {
            testAction(context, 'models', 'initStory', undefined, [
                {
                    type: 'initStory',
                    payload (mutationPayload) {
                        expect(mutationPayload).to.have.property('story');
                        expect(mutationPayload.story.id).to.not.equal(story.id);
                    }
                }
            ],
            [
                {
                    type: 'application/setCurrentStory',
                    payload (mutationPayload) {
                        expect(mutationPayload).to.have.property('story');
                        expect(mutationPayload.story.id).to.not.equal(story.id);
                    }
                },
                {
                    type: 'geometry/initGeometry',
                    payload (mutationPayload) {
                        expect(mutationPayload).to.have.property('story');
                        expect(mutationPayload.story.id).to.not.equal(story.id);
                    }
                }
            ], done);
        });

        it('destroyStory', (done) => {
            testAction(context, 'models', 'destroyStory', { story }, [
                {
                    type: 'destroyStory',
                    payload: {
                        story
                    }
                }
            ], [], done);
        });

        it('updateStoryWithData', (done) => {
            testAction(context, 'models', 'updateStoryWithData', { story, invalidParam: true }, [
                {
                    type: 'updateStoryWithData',
                    payload: {
                        // invalid param should have been removed
                        story
                    }
                }
            ], [], done);
        });
    });

    describe('space', () => {
        var space;

        beforeEach(() => {
            space = new modelsFactory.Space();
            Models.mutations.initSpace(context.state, { story, space });
        });

        it('initSpace', (done) => {
            testAction(context, 'models', 'initSpace', { story }, [
                {
                    type: 'initSpace',
                    payload (mutationPayload) {
                        expect(mutationPayload).to.have.property('space');
                        expect(mutationPayload.space).to.not.be.empty;
                        expect(mutationPayload.story).to.equal(story);
                    }
                }
            ], [], done);
        });

        describe ('destroySpace', () => {
            it('no face', (done) => {
                testAction(context, 'models', 'destroySpace', { story, space }, [
                    {
                        type: 'destroySpace',
                        payload: {
                            story,
                            space
                        }
                    }
                ], [], done);
            });

            it('with face', (done) => {
                const geometry = context.rootState.geometry[0];
                const face = new geometryFactory.Face([]);

                space.face_id = face.id;
                geometry.faces.push(face);

                testAction(context, 'models', 'destroySpace', { story, space }, [
                    {
                        type: 'destroySpace',
                        payload: {
                            story,
                            space
                        }
                    }
                ],
                [
                    {
                        type: 'geometry/destroyFaceAndDescendents',
                        payload: {
                            face,
                            geometry
                        }
                    }
                ], done);
            });
        });


        it('updateSpaceWithData', (done) => {
            context.rootState.application.currentSelections.story.spaces.push(space);

            testAction(context, 'models', 'updateSpaceWithData', { space, invalidParam: true }, [
                {
                    type: 'updateSpaceWithData',
                    payload: {
                        // invalid param should have been removed
                        space
                    }
                }
            ], [], done);
        });
    });

    describe('shading', () => {
        var shading;

        beforeEach(() => {
            shading = new modelsFactory.Shading();
            Models.mutations.initShading(context.state, { story, shading });
        });

        it('initShading', (done) => {
            testAction(context, 'models', 'initShading', { story }, [
                {
                    type: 'initShading',
                    payload (mutationPayload) {
                        expect(mutationPayload).to.have.property('shading');
                        expect(mutationPayload.shading).to.not.be.empty;
                        expect(mutationPayload.story).to.equal(story);
                    }
                }
            ], [], done);
        });

        describe ('destroyShading', () => {
            it('no face', (done) => {
                testAction(context, 'models', 'destroyShading', { story, shading }, [
                    {
                        type: 'destroyShading',
                        payload: {
                            story,
                            shading
                        }
                    }
                ], [], done);
            });

            it('with face', (done) => {
                const geometry = context.rootState.geometry[0];
                const face = new geometryFactory.Face([]);

                shading.face_id = face.id;
                geometry.faces.push(face);

                testAction(context, 'models', 'destroyShading', { story, shading }, [
                    {
                        type: 'destroyShading',
                        payload: {
                            story,
                            shading
                        }
                    }
                ],
                [
                    {
                        type: 'geometry/destroyFaceAndDescendents',
                        payload: {
                            face,
                            geometry
                        }
                    }
                ], done);
            });
        });

        it('updateShadingWithData', (done) => {
            story.shading.push(shading);

            testAction(context, 'models', 'updateShadingWithData', { shading, invalidParam: true }, [
                {
                    type: 'updateShadingWithData',
                    payload: {
                        // invalid param should have been removed
                        shading
                    }
                }
            ], [], done);
        });
    });

    describe('object', () => {
        var object, type;

        beforeEach(() => {
            object = new modelsFactory.BuildingUnit();
            type = "building_units";
        });

        it('createObjectWithType', (done) => {
            testAction(context, 'models', 'createObjectWithType', { type, object }, [
                {
                    type: 'initObject',
                    payload: {
                        type,
                        object
                    }
                }
            ], [], done);
        });

        it('destroyObject', (done) => {
            testAction(context, 'models', 'destroyObject', { object }, [
                {
                    type: 'destroyObject',
                    payload: {
                        object
                    }
                }
            ], [], done);
        });

        it('updateObjectWithData', (done) => {
            context.state.library[type].push(object);

            testAction(context, 'models', 'updateObjectWithData', { object }, [
                {
                    type: 'updateObjectWithData',
                    // TODO: add payload test
                }
            ], [], done);
        })
    });
    
    describe('image', () => {
        var image;

        beforeEach(() => {
            image = new modelsFactory.Image();
            Models.mutations.createImageForStory(context.state, {
                image,
                story_id: story.id
            });
        });

        it('createImageForStory', (done) => {
            testAction(context, 'models', 'createImageForStory', {}, [], [], done); // TODO: call onload event to trigger mutation

            // createImageForStory (context, payload) {
            //     const img = new Image();
            //     img.onload = () => {
            //         const image = new factory.Image(payload.src);

            //         image.name = payload.name;
            //         image.height = context.rootState.application.scale.y(img.height);
            //         image.width = context.rootState.application.scale.x(img.width);

            //         image.y = (context.rootState.project.view.max_y - context.rootState.project.view.min_y - image.height) * Math.random();
            //         image.x = (context.rootState.project.view.max_x - context.rootState.project.view.min_x - image.width) * Math.random();

            //         context.commit('createImageForStory', {
            //             story_id: payload.story_id,
            //             image: image
            //         });
            //     };
            //     img.src = payload.src;
            // },
        });

        it('destroyImage', (done) => {
            testAction(context, 'models', 'destroyImage', { story, image }, [
                {
                    type: 'destroyImage',
                    payload: {
                        story,
                        image
                    }
                }
            ], [], done);
        });

        it('updateImageWithData', (done) => {
            context.rootState.application.currentSelections.story.images.push(image);

            testAction(context, 'models', 'updateImageWithData', { image, invalidParam: true }, [
                {
                    type: 'updateImageWithData',
                    payload: {
                        // invalid param should have been removed
                        image
                    }
                }
            ], [], done);
        });
    });
});