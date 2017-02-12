import generateId from './../../utilities/generateId'

export default {
    Story: function () {
        return {
            id: generateId(),
            handle: null,
            name: null,
            geometry_id: null,
            below_floor_plenum_height: 0,
            floor_to_ceiling_height: 0,
            multiplier: 0,
            spaces: [],
            windows: [],
            shading: [],
            image_ids: []
        }
    },
    Space: function () {
        return {
            id: generateId(),
            name: null,
            handle: null,
            face_id: null,
            daylighting_controls: [],
            building_unit_id: null,
            thermal_zone_id: null,
            space_type_id: null,
            construction_set_id: null
        };
    }
}
