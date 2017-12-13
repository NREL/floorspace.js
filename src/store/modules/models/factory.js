import _ from 'lodash';
import idFactory from './../../utilities/generateId';
import generateColor from './../../utilities/generateColor';
import appconfig from './../application/appconfig';
import schema from '../../../../schema/geometry_schema.json';

const readDefaults = (definition) => {
  if (_.has(definition, 'default')) return definition.default;
  if (definition.type === 'null') return null;
  if (definition.type === 'array') return [];
  if (definition.type === 'object') {
    return _.mapValues(definition.properties, readDefaults);
  }
  return null;
};

const rawDefaults = _.mapValues(schema.definitions, readDefaults);
// We don't want the defaults to ever change, and we want to make sure
// that different uses of defaults produce different objects.
export const defaults = new Proxy(rawDefaults, {
  get(target, key) {
    return _.cloneDeep(target[key]);
  },
  set() {
    throw new Error('Please do not change the defaults.');
  },
});

export default {
  Story(name) {
    return {
      ...defaults.Story,
      id: idFactory.generate(),
      name,
      color: generateColor('story'),
    };
  },
  Space(name) {
    return {
      ...defaults.Space,
      id: idFactory.generate(),
      name,
      color: generateColor('space'),
      type: 'space',
    };
  },
  Shading(name) {
    return {
      ...defaults.Shading,
      id: idFactory.generate(),
      name,
      color: appconfig.palette.shading,
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
      opacity: 0.6,
    };
  },
  BuildingUnit(opts = {}) {
    return {
      id: idFactory.generate(),
      color: generateColor('building_unit'),
      name: opts.name,
      handle: opts.handle || null,
    };
  },
  ThermalZone(opts = {}) {
    return {
      ...defaults.ThermalZone,
      id: idFactory.generate(),
      color: generateColor('thermal_zone'),
      name: opts.name,
    };
  },
  SpaceType(opts = {}) {
    return {
      ...defaults.SpaceType,
      id: idFactory.generate(),
      color: generateColor('space_type'),
      name: opts.name,
    };
  },
  ConstructionSet(opts = {}) {
    return {
      ...defaults.ConstructionSet,
      id: idFactory.generate(),
      name: opts.name,
      color: generateColor('construction_set'),
    };
  },
  WindowDefn(opts = {}) {
    return {
      ...defaults.WindowDefinition,
      id: idFactory.generate(),
      name: opts.name,
      wwr: null,
      window_spacing: null,
    };
  },
  DaylightingControlDefn(opts = {}) {
    return {
      ...defaults.DaylightingControlDefinition,
      id: idFactory.generate(),
      name: opts.name,
    };
  },
  PitchedRoof(opts = {}) {
    return {
      ...defaults.PitchedRoof,
      id: idFactory.generate(),
      name: opts.name,
      color: generateColor('pitched_roof'),
    };
  },
};
