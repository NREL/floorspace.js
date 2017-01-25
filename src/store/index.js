import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);

// modules
import application from './modules/application/index.js'
import project from './modules/project/index.js'
import geometry from './modules/geometry/index.js'
import models from './modules/models/index.js'

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    modules: {
        application: application,
        project: project,
        geometry: geometry,
        models: models
    }
});

export default store;
