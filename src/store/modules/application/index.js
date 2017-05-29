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
            image: null,
            building_unit: null,
            thermal_zone: null,
            space_type: null,

            // current application mode and tool
            tool: 'Polygon',
            mode: 'spaces'
        },
        modes: ['spaces', 'shading', 'building_units', 'thermal_zones', 'space_types', 'images'],
        tools: ['Drag', 'Pan', 'Rectangle', 'Polygon', 'Eraser', 'Select', 'Place Component', 'Apply Property', 'Map'],
        // d3 scale functions px -> rwu
        scale: {
            x: null,
            y: null
        }
    },
    actions: actions,
    mutations: mutations,
    getters: getters
}
