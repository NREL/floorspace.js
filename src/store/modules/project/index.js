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
            min_x: 0,
            min_y: 0,
            max_x: 10,
            max_y: 10
        },
        map: {
            visible: false,
            latitude: null,
            longitude: null,
            zoom: null,
            elevation: 0
        }
    },
    actions: actions,
    mutations: mutations,
    getters: getters
}
