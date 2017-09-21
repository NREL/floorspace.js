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
      spacing: 5,
    },
    view: {
      // grid boundaties in rwu
      min_x: -250,
      min_y: -150,
      max_x: 250,
      max_y: 150,
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
    },
    showImportExport: true,
    transform: {
      k: 1, x: 0, y: 0,
    },
  },
  actions: actions,
  mutations: mutations,
  getters: getters
}
