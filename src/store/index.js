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
import applicationMutations from './mutations/application'
import projectMutations from './mutations/project'
import geometryMutations from './mutations/geometry'
import modelsMutations from './mutations/models'

// // getters
// import applicationGetters from './getters/application'
// import projectGetters from './getters/project'
// import geometryGetters from './getters/geometry'
// import modelsGetters from './getters/models'
//
// // actions
// import applicationActions from './actions/application'
// import projectActions from './actions/project'
// import geometryActions from './actions/geometry'
// import modelsActions from './actions/models'

const state = {
    ...application,
    ...project,
    ...geometry,
    ...models
};

import init from './init'
init(state);

const store = new Vuex.Store({
    state: state,
    mutations: {
        ...applicationMutations,
        ...projectMutations,
        ...geometryMutations,
        ...modelsMutations
    }//,
    // getters: {
    //     ...applicationGetters,
    //     ...projectGetters,
    //     ...geometryGetters,
    //     ...modelsGetters
    // },
    // actions: {
    //     ...applicationActions,
    //     ...projectActions,
    //     ...geometryActions,
    //     ...modelsActions
    // }
});
export default store;
