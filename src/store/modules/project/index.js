import actions from './actions';
import mutations from './mutations';
import getters from './getters';

export default {
  namespaced: true,
  state: {
    // project
    config: {
      units: 'ft',
      unitsEditable: true,
      language: 'EN-US',
    },
    north_axis: 0,
    ground: {
      floor_offset: 0,
      azimuth_angle: 0,
      tilt_slope: 0,
    },
    grid: {
      visible: true,
      spacing: 5,
    },
    view: {
      // grid boundaties in rwu
      min_x: -250,
      min_y: -150,
      max_x: 250,
      max_y: 150,
    },
    map: {
      initialized: false,
      enabled: true,
      visible: true,
      latitude: 39.7653,
      longitude: -104.9863,
      zoom: 4.5,
      rotation: 0,
      elevation: 0,
    },
    previous_story: {
      visible: true,
    },
    show_import_export: true,
    default_wwr: {
      apply_default_wwr_to: null,
      north_wwr: null,
      east_wwr: null,
      south_wwr: null,
      west_wwr: null,
    },
  },
  actions,
  mutations,
  getters,
};
