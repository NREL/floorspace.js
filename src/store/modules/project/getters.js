export default {
    snapToleranceX (state, getters, rootState, rootGetters) {
        return Math.abs(state.view.max_x - state.view.min_x) * 0.05;
    },
    snapToleranceY (state, getters, rootState, rootGetters) {
        return Math.abs(state.view.max_y - state.view.min_y) * 0.05;
    }
}
