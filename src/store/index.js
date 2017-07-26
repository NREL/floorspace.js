// window.api = {
//   config: {
//     units: 'm',
//     showMapDialogOnStart: false,
//     online: true,
//     onChange: () => { window.versionNumber += 1; },
//   },
// };

import Vue from 'vue';
import Vuex from 'vuex';

// modules
import application from './modules/application/index';
import project from './modules/project/index';
import geometry from './modules/geometry/index';
import models from './modules/models/index';

import exportData from './utilities/export';
import importModel from './utilities/importModel';
import importLibrary from './utilities/importLibrary';
import mutations from './mutations';

import timetravel from './timetravel';

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
    importModel,
    importLibrary,
  },
  mutations,
});

timetravel.init(store);

export default store;
