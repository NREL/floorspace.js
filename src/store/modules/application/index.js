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

            // current application mode
            mode: 'Rectangle'
        },
        modes: ['Rectangle', 'Polygon', 'Place Component', 'Apply Property', '3d'],
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
