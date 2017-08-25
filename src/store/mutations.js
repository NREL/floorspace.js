import project from './modules/project';

export default {
  importState(state, payload) {
    // replace any keys in both, but keep keys appearing only in project
    // (for backward compatibilty)
    state.project = Object.assign(project.state, payload.project);
    state.application = payload.application;
    state.models = payload.models;
    state.geometry = payload.geometry;
  },
  importLibrary(state, payload) {
    state.models.library = payload;
  },
};
