import actions from './actions'
import mutations from './mutations'
import getters from './getters'

export default {
    namespaced: true,
    state: {
        // project
        config: {
            units: 'ft',
            language: 'EN-US',
            north_axis: 0
        },
        grid: {
            visible: true,
            x_spacing: 1,
            y_spacing: 1
        },
        view: {
            // drawing canvas
            min_x: 0,
            min_y: 0,
            max_x: 100,
            max_y: 100
        },
        map: {
            visible: false,
            latitude: 39.7653,
            longitude: -104.9863,
            zoom: 18,
            rotation: 0.791,
            elevation: 0
        }
    },
    actions: actions,
    mutations: mutations,
    getters: getters
}
