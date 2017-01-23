import helpers from './helpers'

export default {
    Vertex: function(x, y) {
        return {
            id: helpers.generateId(),
            x: x,
            y: y
        }
    },
    Edge: function(v1, v2) {
        return {
            id: helpers.generateId(),
            v1: v1,
            v2: v2
        }
    },
    Face: function(edgeRefs) {
        return {
            id: helpers.generateId(),
            edgeRefs: edgeRefs
        }
    },
    Geometry: function() {
        return {
            'id': helpers.generateId(),
            'vertices': [],
            'edges': [],
            'faces': []
        }
    }
}
