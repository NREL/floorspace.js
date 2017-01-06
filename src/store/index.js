import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);

import factory from './utils/factory'

// state
import application from './state/application'
import project from './state/project'
import geometry from './state/geometry'
import models from './state/models'

// mutations
import projectMutations from './mutations/project'
import geometryMutations from './mutations/geometry'
import modelsMutations from './mutations/models'

// actions
import projectActions from './actions/project'
import geometryActions from './actions/geometry'
import modelsActions from './actions/models'

const state = {
    ...application,
    ...project,
    ...geometry,
    ...models
};

(function initializeDefaultState(state) {
    // initialize app with a story
    const storyId = factory.generateId();
    const geometryId = factory.generateId();

    state.application.currentSelection.story_id = storyId;

    state.geometry.push({
        'id': geometryId,
        'vertices': [],
        'edges': [],
        'faces': []
    });

    state.stories.push({
        'id': storyId,
        'handle': null,
        'name': 'ground level',
        'below_floor_plenum_height': 0,
        'floor_to_ceiling_height': 0,
        'multiplier': 0,
        'images': [],
        'geometry_id': geometryId,
        'spaces': [],
        'windows': []
    });
})(state);

const store = new Vuex.Store({
    state: state,
    mutations: {
        ...projectMutations,
        ...geometryMutations,
        ...modelsMutations
    },
    actions: {
        ...projectActions,
        ...geometryActions,
        ...modelsActions
    }
});
export default store;
