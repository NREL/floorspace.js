import actions from './actions';
import mutations from './mutations';
import getters from './getters';

const d3 = require('d3');

export default {
  namespaced: true,
  state: {
    currentSelections: {
      // models currently being edited
      story: null,
      story_id: null,
      subselection_id: null, // space, shading, image

      building_unit_id: null,
      thermal_zone_id: null,
      space_type_id: null,

      // current application mode and tool
      tool: 'Rectangle',
      mode: 'spaces',
    },
    modes: ['spaces', 'shading', 'building_units', 'thermal_zones', 'space_types', 'images'],
    tools: ['Pan', 'Drag', 'Rectangle', 'Polygon', 'Eraser', 'Select', 'Map', 'Fill', 'Place Component'], // 'Apply Property'
    // d3 scale functions px -> rwu
    scale: {
      x: d3.scaleLinear().range([0, 0]).domain([0, 0]),
      y: d3.scaleLinear().range([0, 0]).domain([0, 0]),
    },
  },
  actions,
  mutations,
  getters,
};
