import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);

// modules
import application from './modules/application/index.js'
import project from './modules/project/index.js'
import geometry from './modules/geometry/index.js'
import models from './modules/models/index.js'

import exportData from './utilities/export.js'
import importData from './utilities/import.js'

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    modules: {
        application: application,
        project: project,
        geometry: geometry,
        models: models
    },
    getters: {
        exportData: exportData
    },
    actions: {
        importData: importData
    },
    mutations: {
        importState (state, payload) {
           // state =  Object.assign(state, payload);
            state.project = payload.project;
            state.application = payload.application;
            state.models = payload.models;
            state.geometry = payload.geometry;
        }
    }
});


export default store;
