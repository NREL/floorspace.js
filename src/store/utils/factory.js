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
    },
    Story: function() {
        return {
            id: generateId(),
            name: null,
            geometry_id: null, // geometry id
            images: [], // image ids
            spaces: [], // space ids
            windows: [],
            handle: null,
            below_floor_plenum_height: 0,
            floor_to_ceiling_height: 0,
            multiplier: 0
        }
    },
    Space: function() {
        return {
            id: generateId(),
            name: null,
            face_id: null, // face_id
            daylighting_controls: [],
            building_unit: null, // building_unit id
            thermal_zone: null, // thermal_zone id
            space_type: null, // space_type id
            construction_set: null, // construction_set id
            handle: null
        }
    }
}
