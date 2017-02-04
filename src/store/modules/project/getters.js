export default {
    snapTolerance (state, getters, rootState, rootGetters) {
        return Math.abs(state.view.max_x - state.view.min_x) * 0.025;
    }
}
