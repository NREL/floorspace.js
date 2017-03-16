import actions from './actions'
import mutations from './mutations'
import getters from './getters'

export default {
    namespaced: true,
    state: {
        currentSelections: {
            // models currently being edited
            story: null,
            space: null,
            shading: null,
            building_unit: null,
            thermal_zone: null,
            space_type: null,

            // current application mode and tool
            tool: 'Rectangle',
            mode: 'stories'
        },
        modes: ['stories', 'spaces', 'shading', 'building_units', 'thermal_zones', 'space_types'],
        tools: ['None', 'Rectangle', 'Polygon', 'Place Component', 'Apply Property', '3d'],
        // d3 scale functions translate screen pixel coordinates into RWU values to use within the SVG's grid system
        scale: {
            x: null,
            y: null
        }
    },
    actions: actions,
    mutations: mutations,
    getters: getters
}
