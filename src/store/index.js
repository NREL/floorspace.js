import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);

// state
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

export default new Vuex.Store({
    state: {
        ...project,
        ...geometry,
        ...models
    },
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
})
