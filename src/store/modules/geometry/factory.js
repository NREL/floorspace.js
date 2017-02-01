import generateId from './../../utilities/generateId'

export default {
    Vertex (x, y) {
        return {
            id: generateId(),
            x: x,
            y: y,
            get X () { return this.x; },
            get Y () { return this.y; }
        }
    },
    Edge (v1, v2) {
        return {
            id: generateId(),
            v1: v1,
            v2: v2
        }
    },
    Face (edgeRefs) {
        return {
            id: generateId(),
            edgeRefs: edgeRefs
        }
    },
    Geometry () {
        return {
            'id': generateId(),
            'vertices': [],
            'edges': [],
            'faces': []
        }
    }
}
