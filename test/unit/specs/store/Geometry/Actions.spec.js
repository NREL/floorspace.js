// import { expect } from 'chai'
// import { geometry as Geometry, helpers } from '../../../../../src/store/modules/geometry/index.js'
// import factory from '../../../../../src/store/factory/index.js'
//
// describe('mutations', () => {
//     it('initGeometry', () => {
//         // mock state
//         const geometryState = [];
//
//         const story = new factory.Story();
//         Geometry.actions.initGeometry(geometryState, {
//             story: story
//         });
//
//         // check that geometry was created and saved
//         expect(geometryState.length).to.equal(1);
//         expect(geometryState[0].vertices.length).to.equal(0);
//         expect(geometryState[0].edges.length).to.equal(0);
//         expect(geometryState[0].faces.length).to.equal(0);
//
//         // check that the story has a reference to the new geometry
//         expect(story.geometry_id).to.be.ok;
//     });
// });
//
// Context(geometryState) {
//     geometryState = geometryState || {};
//     return {
//         commit (type, payload, options) {
//             if (options.root) {
//                 // TODO: mock out root commits somehow
//             } else {
//                 Geometry.mutations[type](geometryState, payload);
//             }
//         },
//         dispatch (type, payload) {
//             debugger
//             Geometry.actions[type](this, payload);
//         },
//         getters: geometry.getters
//         rootGetters: {},
//         rootState: {},
//         state: geometryState
//     };
// }
