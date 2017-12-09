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
import { convertState } from './utilities/unitConversion';
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
    changeUnits(context, { newUnits }) {
      console.log(`moving from ${context.state.project.config.units} to ${newUnits}`);
      context.commit(
        'changeUnits',
        convertState(
          context.state,
          context.state.project.config.units === 'm' ? 'si_units' : 'ip_units',
          newUnits === 'm' ? 'si_units' : 'ip_units'));
    },
  },
  mutations,
});

export default store;
