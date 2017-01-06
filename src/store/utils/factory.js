const generateId = (function idFactory() {
    var id = 0;
    return () => id++
})();

export default {
    generateId: generateId,
    Vertex: function(x, y) {
        return {
            id: generateId(),
            x: x,
            y: y
        }
    },
    Edge: function(p1, p2) {
        return {
            id: generateId(),
            p1: p1,
            p2: p2
        }
    },
    Face: function(edges) {
        return {
            id: generateId(),
            edges: edges
        }
    }
}
