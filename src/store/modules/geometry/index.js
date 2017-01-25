import actions from './actions'
import mutations from './mutations'

export default {
    namespaced: true,
    // each story owns a geometry object with a unique set of vertices, edges, and faces
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
    getters: {}
}
