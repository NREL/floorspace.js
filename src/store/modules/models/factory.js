import idFactory from './../../utilities/generateId'
import generateColor from './../../utilities/generateColor'
import appconfig from './../application/appconfig.js'

export default {
    Story: function () {
        const id = idFactory.generate();
        return {
            id: id,
            handle: null,
            name: "Story " + id,
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
    Space: function () {
        const id = idFactory.generate();
        return {
            id: id,
            color: generateColor('space'),
            name: 'Space ' + id,
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
        const id = idFactory.generate();
        return {
            id: id,
            color: appconfig.palette.shading,
            name: 'Shading ' + id,
            handle: null,
            face_id: null
        };
    },
    Image: function (src) {
        const id = idFactory.generate();
        return {
            id: id,
            src: src,
            name: 'Image ' + id,
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
    BuildingUnit: function () {
        const id = idFactory.generate();
        return {
            id: id,
            color: generateColor('building_unit'),
            name: 'Building Unit ' + id
        };
    },
    ThermalZone: function () {
        const id = idFactory.generate();
        return {
            id: id,
            color: generateColor('thermal_zone'),
            name: 'Thermal Zone ' + id
        };
    },
    SpaceType: function () {
        const id = idFactory.generate();
        return {
            id: id,
            color: generateColor('space_type'),
            name: 'Space Type ' + id
        };
    },
    ConstructionSet: function () {
        const id = idFactory.generate();
        return {
            id: id,
            name: 'Construction Set ' + id
        };
    },
    Window: function () {
        const id = idFactory.generate();
        return {
            id: id,
            name: 'Window ' + id
        };
    },
    DaylightingControl: function () {
        const id = idFactory.generate();
        return {
            id: id,
            name: 'Daylighting Control ' + id
        };
    }
}
