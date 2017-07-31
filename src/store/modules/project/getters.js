export default {
  snapTolerance(state) {
    const defaultTolerance = Math.abs(state.view.max_x - state.view.min_x) * 0.025;
    return state.grid.visible ? state.grid.spacing * 0.5 : defaultTolerance;
  },
  angleTolerance() {
    return 20;
  },
};
