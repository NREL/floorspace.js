import actions from './actions/actions'
import mutations from './mutations'
import getters from './getters'

export default {
    namespaced: true,
    // each story references a geometry object in this state array
    state: [/*{
        id: null,
        vertices: [{
            id: null,
            x: null,
            y: null
        }],
        edges: [{
            id: null,
            v1: null,
            v2: null
        }],
        faces: [{
            id: null,
            edgeRefs: [{
                edge_id: null,
                reverse: false
            }]
        }]
    }*/],
    actions: actions,
    mutations: mutations,
    getters: getters
}
