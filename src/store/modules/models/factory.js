import generateId from './../../utilities/generateId'
import generateColor from './../../utilities/generateColor'

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
            imageVisible: false,
            spaces: [],
            windows: [],
            shading: [],
            image_ids: [],
            image_id: null
        }
    },
    Space: function () {
        return {
            id: generateId(),
            color: generateColor('shadingOrSpace'),
            name: null,
            handle: null,
            face_id: null,
            daylighting_controls: [],
            building_unit_id: null,
            thermal_zone_id: null,
            space_type_id: null,
            construction_set_id: null
        };
    },
    Shading: function () {
        return {
            id: generateId(),
            color: generateColor('shadingOrSpace'),
            name: null,
            handle: null,
            face_id: null
        };
    },
    Image: function (src) {
        return {
            id: generateId(),
            src: src
        };
    },
    BuildingUnit: function (name) {
        return {
            id: generateId(),
            color: generateColor('building_unit'),
            name: name
        };
    },
    ThermalZone: function (name) {
        return {
            id: generateId(),
            color: generateColor('thermal_zone'),
            name: name
        };
    },
    SpaceType: function (name) {
        return {
            id: generateId(),
            color: generateColor('space_type'),
            name: name
        };
    },
    Construction: function (name) {
        return {
            id: generateId(),
            name: name
        };
    },
    ConstructionSet: function (name) {
        return {
            id: generateId(),
            name: name
        };
    },
    Window: function (name) {
        return {
            id: generateId(),
            name: name
        };
    },
    DaylightingControl: function (name) {
        return {
            id: generateId(),
            name: name
        };
    }
}
