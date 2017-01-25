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
            x_spacing: 50,
            y_spacing: 50
        },
        view: {
            min_x: 100,
            min_y: 100,
            max_x: 1000,
            max_y: 1000
        },
        map: {
            visible: false,
            latitude: null,
            longitude: null,
            elevation: 0
        }
    },
    actions: actions,
    mutations: mutations,
    getters: getters
}
