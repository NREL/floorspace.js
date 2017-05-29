import idFactory from './../../utilities/generateId'
import generateColor from './../../utilities/generateColor'
import appconfig from './../application/appconfig.js'

export default {
    Story: function (opts = {}) {
        return {
            id: idFactory.generate(),
            handle: null,
            name: opts.name,
            geometry_id: null,
            below_floor_plenum_height: 0,
            floor_to_ceiling_height: 0,
            multiplier: 0,
            spaces: [],
            windows: [],
            shading: [],
            images: []
        }
    },
    Space: function (opts = {}) {
        return {
            id: idFactory.generate(),
            color: generateColor('space'),
            name: opts.name,
            handle: null,
            face_id: null,
            daylighting_controls: [],
            building_unit_id: null,
            thermal_zone_id: null,
            space_type_id: null,
            construction_set_id: null
        };
    },
    Shading: function (opts = {}) {
        return {
            id: idFactory.generate(),
            color: appconfig.palette.shading,
            name: opts.name,
            handle: null,
            face_id: null
        };
    },
    Image: function (opts = {}) {
        return {
            id: idFactory.generate(),
            src: opts.src,
            name: opts.name,
            visible: true,
            height: 100,
            width: 100,
            x: 0,
            y: 0,
            z: 0,
            r: 0,
            opacity: 1
        };
    },
    BuildingUnit: function (opts = {}) {
        return {
            id: idFactory.generate(),
            color: generateColor('building_unit'),
            name: opts.name
        };
    },
    ThermalZone: function (opts = {}) {
        return {
            id: idFactory.generate(),
            color: generateColor('thermal_zone'),
            name: opts.name
        };
    },
    SpaceType: function (opts = {}) {
        return {
            id: idFactory.generate(),
            color: generateColor('space_type'),
            name: opts.name
        };
    },
    ConstructionSet: function (opts = {}) {
        return {
            id: idFactory.generate(),
            name: opts.name
        };
    },
    Window: function (opts = {}) {
        return {
            id: idFactory.generate(),
            name: opts.name
        };
    },
    DaylightingControl: function (opts = {}) {
        return {
            id: idFactory.generate(),
            name: opts.name
        };
    }
}
