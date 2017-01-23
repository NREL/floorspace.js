import helpers from './helpers'

export default {
    Vertex: function(x, y) {
        return {
            id: helpers.generateId(),
            x: x,
            y: y
        }
    },
    Edge: function(p1, p2) {
        return {
            id: helpers.generateId(),
            p1: p1,
            p2: p2
        }
    },
    Face: function(edgeRefs) {
        return {
            id: helpers.generateId(),
            edges: edgeRefs
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
