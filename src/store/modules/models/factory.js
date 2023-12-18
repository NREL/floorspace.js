import _ from "lodash";
import idFactory from "./../../utilities/generateId";
import generateColor from "./../../utilities/generateColor";
import generateTexture from "./../../utilities/generateTexture";
import appconfig from "./../application/appconfig";
import schema from "../../../../schema/geometry_schema.json";
import { getConverter } from "../../utilities/unitConversion";

const makeReadPropertyAttr = (attribute) => {
  const readPropertyAttr = (definition) => {
    if (_.has(definition, "default")) return definition[attribute];
    if (definition.type === "null") return null;
    if (definition.type === "array") return [];
    if (definition.type === "object") {
      return _.mapValues(definition.properties, readPropertyAttr);
    }
    if (_.has(definition, attribute)) return definition[attribute];
    return null;
  };
  return readPropertyAttr;
};

const readPropertyAttrs = (attr) =>
  _.mapValues(schema.definitions, makeReadPropertyAttr(attr));

const ip_defaults = readPropertyAttrs("default");
if (ip_defaults.Project.config.units !== "ip") {
  // We're assuming the defaults in the schema are all in ip units.
  // if that is not the case, we need to swap around which of
  // `ip_defaults` and `si_defaults` is read directly from the schema and
  // which is converted using getConverter
  throw new Error(
    "Expected default units to be ip. Code changes are required to change the default units"
  );
}
const si_defaults = _.mapValues(ip_defaults, (value, key) =>
  getConverter(key, "ip", "si")(value)
);

export const getDefaults = (key) =>
  _.cloneDeep(
    _.get(window, "application.$store.state.project.config.units", "ip") ===
      "ip"
      ? ip_defaults[key]
      : si_defaults[key]
  );

export const allowableTypes = readPropertyAttrs("type");

export default {
  Story(name) {
    return {
      ...getDefaults("Story"),
      id: idFactory.generate(),
      name,
      color: generateColor("story"),
    };
  },
  Space(name) {
    return {
      ...getDefaults("Space"),
      id: idFactory.generate(),
      name,
      color: generateColor("space"),
      type: "space",
    };
  },
  Shading(name) {
    return {
      ...getDefaults("Shading"),
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
      naturalWidth: 0,
      naturalHeight: 0,
    };
  },
  BuildingUnit(opts = {}) {
    return {
      id: idFactory.generate(),
      color: generateColor("building_unit"),
      name: opts.name,
      handle: opts.handle || null,
    };
  },
  ThermalZone(opts = {}) {
    return {
      ...getDefaults("ThermalZone"),
      id: idFactory.generate(),
      color: generateColor("thermal_zone"),
      name: opts.name,
    };
  },
  SpaceType(opts = {}) {
    return {
      ...getDefaults("SpaceType"),
      id: idFactory.generate(),
      color: generateColor("space_type"),
      name: opts.name,
    };
  },
  ConstructionSet(opts = {}) {
    return {
      ...getDefaults("ConstructionSet"),
      id: idFactory.generate(),
      name: opts.name,
      color: generateColor("construction_set"),
    };
  },
  WindowDefn(opts = {}) {
    return {
      ...getDefaults("WindowDefinition"),
      id: idFactory.generate(),
      name: opts.name,
      wwr: null,
      window_spacing: null,
      texture: generateTexture("window_definition"),
    };
  },
  DaylightingControlDefn(opts = {}) {
    return {
      ...getDefaults("DaylightingControlDefinition"),
      id: idFactory.generate(),
      name: opts.name,
    };
  },
  DoorDefinition(opts = {}) {
    return {
      ...getDefaults("DoorDefinition"),
      id: idFactory.generate(),
      name: opts.name,
      texture: generateTexture("door_definition"),
    };
  },
  PitchedRoof(opts = {}) {
    return {
      ...getDefaults("PitchedRoof"),
      id: idFactory.generate(),
      name: opts.name,
      color: generateColor("pitched_roof"),
    };
  },
  BuildingType({ name } = {}) {
    return {
      ...getDefaults("BuildingType"),
      id: idFactory.generate(),
      name,
      color: generateColor("building_type"),
    };
  },
};
