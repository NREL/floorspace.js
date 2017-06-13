export default {
    snapTolerance (state, getters, rootState, rootGetters) {
        const defaultTolerance = Math.abs(state.view.max_x - state.view.min_x) * 0.025;
		return defaultTolerance < state.grid.spacing ? state.grid.spacing * 0.5 : defaultTolerance;
    }
}
