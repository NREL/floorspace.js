import _ from "lodash";
import project from "./modules/project";
import type { MutationTree } from 'vuex';

type State = {

}

const mutations: MutationTree<State> = {
  importState(state, payload) {
    // replace any keys in both, but keep keys appearing only in project
    // (for backward compatibilty)
    state.project = {
      ...project.state,
      ...payload.project
    };
    state.application = payload.application;
    state.models = payload.models;
    state.geometry = payload.geometry;
  },
  importLibrary(state, payload) {
    state.models.library = payload;
  },
  changeUnits(state, newState) {
    _.keys(state).forEach((k) => {
      state[k] = newState[k];
    });
  },
};

export default mutations;