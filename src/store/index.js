import Vue from 'vue';
import Vuex from 'vuex';

// modules
import application from './modules/application/index';
import project from './modules/project/index';
import geometry from './modules/geometry/index';
import models from './modules/models/index';

import exportData from './utilities/export';
import importFloorplan from './utilities/importFloorplan';
import importLibrary from './utilities/importLibrary';
import mutations from './mutations';

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    application,
    project,
    geometry,
    models,
  },
  getters: {
    exportData,
  },
  actions: {
    importFloorplan,
    importLibrary,
  },
  mutations,
});

export default store;
