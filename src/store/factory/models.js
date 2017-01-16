import helpers from './helpers'

export default {
    Story: function() {
        return {
            id: helpers.generateId(),
            name: null,
            handle: null,
            geometry_id: null,
            images: [],
            spaces: [],
            window_refs: [], // { window_id: null, vertex_id: null }
            below_floor_plenum_height: 0,
            floor_to_ceiling_height: 0,
            multiplier: 0
        }
    },
    Space: function() {
        return {
            id: helpers.generateId(),
            name: null,
            handle: null,
            face_id: null,
            daylighting_control_refs: [], // { daylighting_control_id: null, vertex_id: null }
            building_unit_id: null,
            thermal_zone_id: null,
            space_type_id: null,
            construction_set_id: null
        }
    }
}
