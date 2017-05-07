import { expect } from 'chai'
import Application from 'src/store/modules/application'
import { testAction, Context } from '../helpers'
import modelsFactory from 'src/store/modules/models/factory'

describe('application actions', () => {
    var context, story, space, shading, image;

    beforeEach(() => {
        context = new Context('application');
        story = context.state.currentSelections.story;
        space = story.spaces[0];
        shading = story.shading[0];
        image = story.images[0];
    });

    describe('current selections', () => {
        it('clearSubSelections', (done) => {
            testAction(context, 'application','clearSubSelections', {}, [
                {
                    type: 'setCurrentShading',
                    payload: { 
                        shading: null
                    }
                },
                {
                    type: 'setCurrentSpace',
                    payload: { 
                        space: null
                    }
                },
                {
                    type: 'setCurrentBuildingUnit',
                    payload: { 
                        building_unit: null
                    }
                },
                {
                    type: 'setCurrentThermalZone',
                    payload: { 
                        thermal_zone: null
                    }
                },
                {
                    type: 'setCurrentSpaceType',
                    payload: { 
                        space_type: null
                    }
                }
            ], [], done);
        });

        it('setCurrentStory', (done) => {
            testAction(context, 'application','setCurrentStory', { story }, [
                {
                    type: 'setCurrentStory',
                    payload: {
                        story
                    }
                }
            ],
            [
                {
                    type: 'clearSubSelections'
                }
            ], done);
        });

        it('setCurrentSpace', (done) => {
            testAction(context, 'application','setCurrentSpace', { space }, [
                {
                    type: 'setCurrentSpace',
                    payload: {
                        space
                    }
                }
            ],
            [
                {
                    type: 'clearSubSelections'
                }
            ], done);
        });

        it('setCurrentShading', (done) => {
            testAction(context, 'application','setCurrentShading', { shading }, [
                {
                    type: 'setCurrentShading',
                    payload: {
                        shading
                    }
                }
            ],
            [
                {
                    type: 'clearSubSelections'
                }
            ], done);
        });

        it('setCurrentImage', (done) => {
            testAction(context, 'application','setCurrentImage', { image }, [
                {
                    type: 'setCurrentImage',
                    payload: {
                        image
                    }
                }
            ],
            [
                {
                    type: 'clearSubSelections'
                }
            ], done);
        });

        testObjSet('building_unit');
        testObjSet('thermal_zone');
        testObjSet('space_type');

        function testObjSet(prop) {
            const camelCase = prop.split("_").map(part => (part.charAt(0).toUpperCase() + part.slice(1))).join('');

            describe('setCurrent' + camelCase, (done) => {
                const obj = new modelsFactory[camelCase]();

                it('sets current building unit if it exists in library', () => {
                    context.rootState.models.library[prop + 's'].push(obj);

                    testAction(context, 'application','setCurrent' + camelCase, { [prop]: obj }, [
                        {
                            type: 'setCurrent' + camelCase,
                            payload: {
                                [prop]: obj
                            }
                        }
                    ],
                    [
                        {
                            type: 'clearSubSelections'
                        }
                    ], done);
                });

                it('sets current building unit to undefined if it isn\'t in library', () => {
                    testAction(context, 'application','setCurrent' + camelCase, { [prop]: obj }, [
                        {
                            type: 'setCurrent' + camelCase,
                            payload(actionPayload) {
                                expect(actionPayload[prop]).to.be.undefined;
                            }
                        }
                    ],
                    [
                        {
                            type: 'clearSubSelections'
                        }
                    ], done);
                });

                it('sets curerent building unit to null if none provided', () => {
                    testAction(context, 'application','setCurrent' + camelCase, {}, [
                        {
                            type: 'setCurrent' + camelCase,
                            payload(actionPayload) {
                                expect(actionPayload[prop]).to.be.null;
                            }
                        }
                    ],
                    [
                        {
                            type: 'clearSubSelections'
                        }
                    ], done);
                });
            });
        };
    });

    describe('editor/drawing tool', () => {
        it('setApplicationTool', (done) => {
            const tool = context.state.tools[0];
            expect(tool).to.exist;

            testAction(context, 'application','setApplicationTool', { tool }, [
                {
                    type: 'setApplicationTool',
                    payload: {
                        tool
                    }
                }
            ], []);

            // expect no mutations when invalid payload provided
            testAction(context, 'application','setApplicationTool', { tool: 'invalidTool' }, [], [], done);
        });

        it('setApplicationMode', (done) => {
            const mode = context.state.modes[0];
            expect(mode).to.exist;

            testAction(context, 'application','setApplicationMode', { mode }, [
                {
                    type: 'setApplicationMode',
                    payload: {
                        mode
                    }
                }
            ], []);

            // expect no mutations when invalid payload provided
            testAction(context, 'application','setApplicationMode', { mode: 'invalidMode' }, [], [], done);
        });
    });

    describe('d3 scaling functions', () => {
        it('setScaleX', (done) => {
            const scaleX = 'scaleX';

            testAction(context, 'application','setScaleX', { scaleX }, [
                {
                    type: 'setScaleX',
                    payload: {
                        scaleX
                    }
                }
            ], [], done);
        });

        it('setScaleY', (done) => {
            const scaleY = 'scaleY';

            testAction(context, 'application','setScaleY', { scaleY }, [
                {
                    type: 'setScaleY',
                    payload: {
                        scaleY
                    }
                }
            ], [], done);
        });
    });
});