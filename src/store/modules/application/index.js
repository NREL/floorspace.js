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

      component_id: null,
      component_definition_id: null,
      component_instance_id: null,

      space_property_id: null,

      // current application mode and tool
      tool: 'Rectangle',
      mode: 'spaces',
      snapMode: 'grid-strict',
      modeTab: 'floorplan',
      subselectionType: 'spaces',
    },
    modes: ['spaces', 'shading', 'building_units', 'thermal_zones', 'space_types', 'images'],
    tools: ['Pan', 'Drag', 'Rectangle', 'Polygon', 'Eraser', 'Select', 'Map', 'Fill', 'Place Component', 'Remove Component', 'Image', 'Apply Property'],
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
