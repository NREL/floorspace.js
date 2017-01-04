import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);

import state from './state'
import actions from './actions'
import mutations from './mutations'

export default new Vuex.Store({
    state: state,
    mutations: mutations,
    actions: actions
})
