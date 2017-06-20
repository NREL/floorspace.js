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
            visible: false,
            spacing: 50
        },
        view: {
            // grid boundaties in rwu
            min_x: 0,
            min_y: 0,
            max_x: 1000,
            max_y: 1000
        },
        map: {
            initialized: false,
            enabled: true,
            visible: true,
            latitude: 39.7653,
            longitude: -104.9863,
            zoom: 4.5, // 18,
            rotation: 0, //.791,
            elevation: 0
        },
        previous_story: {
            visible: true
        }
    },
    actions: actions,
    mutations: mutations,
    getters: getters
}
