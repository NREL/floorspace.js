import actions from './actions'
import mutations from './mutations'
import getters from './getters'

// the application state
export default {
    namespaced: true,
    state: {
        currentSelections: {
            // models currently being edited
            story: null,
            space: null,

            // active tools
            mode: 'Polygon',
            tool: null
        },
        // TODO: drawing modes may need to be moved into the component as local state
        modes: ['Rectangle', 'Polygon', 'Place Component', 'Apply Property', '3d'],
        // d3 scale functions translate the pixel coordinates of a location on the screen into RWU coordinates to use within the SVG's grid system
        scale: {
            x: null,
            y: null
        }
    },
    actions: actions,
    mutations: mutations,
    getters: getters
}
