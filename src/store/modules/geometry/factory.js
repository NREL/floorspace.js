import idFactory from './../../utilities/generateId'
import helpers from './helpers'

export default {
    Vertex (x, y) {
        return {
            id: idFactory.generate(),
            x: x,
            y: y
        }
    },
    Edge (v1, v2) {
        return {
            id: idFactory.generate(),
            v1: v1,
            v2: v2
        }
    },
    Face (edgeRefs) {
        return {
            id: idFactory.generate(),
            edgeRefs: edgeRefs
        }
    },
    Geometry () {
        return {
            id: idFactory.generate(),
            vertices: [],
            edges: [],
            faces: [],
            edgesMap: {},
        }
    }
}
