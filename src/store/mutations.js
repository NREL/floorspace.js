export default {
    importState (state, payload) {
        // state =  Object.assign(state, payload);
        state.project = payload.project;
        state.application = payload.application;
        state.models = payload.models;
        state.geometry = payload.geometry;
    },
    importLibrary (state, payload) {
        state.models.library = payload;
    }
};
