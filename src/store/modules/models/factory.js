import idFactory from './../../utilities/generateId';
import generateColor from './../../utilities/generateColor';
import appconfig from './../application/appconfig';

export default {
  Story(name) {
    return {
      id: idFactory.generate(),
      name,
      handle: null,
      geometry_id: null,
      below_floor_plenum_height: 0,
      floor_to_ceiling_height: 0,
      above_floor_plenum_height: 0,
      multiplier: 0,
      spaces: [],
      windows: [],
      shading: [],
      images: [],
    };
  },
  Space(name) {
    return {
      id: idFactory.generate(),
      name,
      color: generateColor('space'),
      handle: null,
      face_id: null,
      daylighting_controls: [],
      building_unit_id: null,
      thermal_zone_id: null,
      space_type_id: null,
      construction_set_id: null,
    };
  },
  Shading(name) {
    return {
      id: idFactory.generate(),
      name,
      color: appconfig.palette.shading,
      handle: null,
      face_id: null,
    };
  },
  Image(name, src) {
    return {
      id: idFactory.generate(),
      src,
      name,
      visible: true,
      height: 0,
      width: 0,
      x: 0,
      y: 0,
      z: 0,
      r: 0,
      opacity: 1,
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
