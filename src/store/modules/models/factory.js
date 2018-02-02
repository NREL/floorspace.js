import _ from 'lodash';
import 'proxy-polyfill/proxy.min';
import idFactory from './../../utilities/generateId';
import generateColor from './../../utilities/generateColor';
import generateTexture from './../../utilities/generateTexture';
import appconfig from './../application/appconfig';
import schema from '../../../../schema/geometry_schema.json';
import { getConverter } from '../../utilities/unitConversion';

const makeReadPropertyAttr = (attribute) => {
  const readPropertyAttr = (definition) => {
    if (_.has(definition, 'default')) return definition[attribute];
    if (definition.type === 'null') return null;
    if (definition.type === 'array') return [];
    if (definition.type === 'object') {
      return _.mapValues(definition.properties, readPropertyAttr);
    }
    if (_.has(definition, attribute)) return definition[attribute];
    return null;
  };
  return readPropertyAttr;
};

const readPropertyAttrs = (attr) => {
  const rawValues = _.mapValues(schema.definitions, makeReadPropertyAttr(attr));
  // We don't want the defaults to ever change, and we want to make sure
  // that different uses of defaults produce different objects.
  return new Proxy(rawValues, {
    get(target, key) {
      return _.cloneDeep(target[key]);
    },
    set() {
      throw new Error('Please do not change the defaults.');
    },
  });
};

export const ip_defaults = readPropertyAttrs('default');
if (ip_defaults.Project.config.units !== 'ip') {
  throw new Error(
      'Expected default units to be ip. Code changes are required to change the default units');
}
export const si_defaults = _.mapValues(
  ip_defaults,
  (value, key) => getConverter(key, 'ip_units', 'si_units')(value));

export const defaults = new Proxy(
  { ip_defaults, si_defaults },
  {
    get(target, key) {
      return _.cloneDeep(_.get(window, 'application.$store.state.project.config.units', 'ip') === 'ip' ?
        ip_defaults[key] :
        si_defaults[key]);
    },
  },
);

export const allowableTypes = readPropertyAttrs('type');

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
      texture: generateTexture('window_definition'),
    };
  },
  DaylightingControlDefn(opts = {}) {
    return {
      ...defaults.DaylightingControlDefinition,
      id: idFactory.generate(),
      name: opts.name,
    };
  },
  DoorDefinition(opts = {}) {
    return {
      ...defaults.DoorDefinition,
      id: idFactory.generate(),
      name: opts.name,
      texture: generateTexture('door_definition'),
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
