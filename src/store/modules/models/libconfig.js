import _ from 'lodash';
import factory, { allowableTypes, getDefaults } from './factory';
import helpers from './helpers';
import validators from './validators';
import * as converters from './converters';
import { textures } from '../application/appconfig';

/*
* each library object type has
* displayName - for use in the library Type dropdown
* init - method to initialize a new object of the given type
* keymap - contains displayName and accessor for each property on objects of the given type
*/
const map = {
  building_units: {
    displayName: 'Building Unit',
    definitionName: 'BuildingUnit',
    columns: [
      {
        name: 'id',
        displayName: 'ID',
        readonly: true,
        private: true,
      },
      {
        name: 'name',
        displayName: 'Name',
        input_type: 'text',
        validator: validators.name,
      },
      {
        name: 'color',
        displayName: 'Color',
        input_type: 'color',
        validator: validators.color,
      },
    ],
    init: factory.BuildingUnit,
  },
  building_types: {
    displayName: 'Building Type',
    definitionName: 'BuildingType',
    columns: [
      {
        name: 'id',
        displayName: 'ID',
        readonly: true,
        private: true,
      },
      {
        name: 'name',
        displayName: 'Name',
        input_type: 'text',
        validator: validators.name,
      },
      {
        name: 'color',
        displayName: 'Color',
        input_type: 'color',
        validator: validators.color,
      },
    ],
    init: factory.BuildingType,
  },
  thermal_zones: {
    displayName: 'Thermal Zone',
    definitionName: 'ThermalZone',
    columns: [
      {
        name: 'id',
        displayName: 'ID',
        readonly: true,
        private: true,
      },
      {
        name: 'name',
        displayName: 'Name',
        input_type: 'text',
        validator: validators.name,
      },
      {
        name: 'color',
        displayName: 'Color',
        input_type: 'color',
        validator: validators.color,
      },
    ],
    init: factory.ThermalZone,
  },
  door_definitions: {
    displayName: 'Door',
    definitionName: 'DoorDefinition',
    columns: [
      {
        name: 'id',
        displayName: 'ID',
        readonly: true,
        private: true,
      },
      {
        name: 'name',
        displayName: 'Name',
        input_type: 'text',
        validator: validators.name,
      },
      {
        name: 'height',
        displayName: 'Height',
        input_type: 'text',
        validator: validators.gt0,
        converter: converters.number,
        numeric: true,
      },
      {
        name: 'width',
        displayName: 'Width',
        input_type: 'text',
        validator: validators.gt0,
        converter: converters.number,
        numeric: true,
      },
      {
        name: 'door_type',
        displayName: 'Type',
        input_type: 'select',
        select_data() {
          const options = ['Door', 'Glass Door', 'Overhead Door'];
          return _.zipObject(options, options);
        },
        validator: validators.oneOf('Door', 'Glass Door', 'Overhead Door'),
      },
      {
        name: 'texture',
        displayName: 'Texture',
        input_type: 'texture',
        validator: validators.oneOf(...textures),
      },
    ],
    init: factory.DoorDefinition,
  },
  window_definitions: {
    displayName: 'Window',
    definitionName: 'WindowDefinition',
    columns: [
      {
        name: 'id',
        displayName: 'ID',
        readonly: true,
        private: true,
      },
      {
        name: 'name',
        displayName: 'Name',
        input_type: 'text',
        validator: validators.name,
      },
      {
        name: 'window_definition_mode',
        displayName: 'Mode',
        input_type: 'select',
        select_data() {
          const options = ['Single Window', 'Repeating Windows', 'Window to Wall Ratio'];
          return _.zipObject(options, options);
        },
        validator: validators.oneOf('Single Window', 'Repeating Windows', 'Window to Wall Ratio'),
      },
      {
        name: 'wwr',
        displayName: 'Window to Wall ratio',
        input_type: 'text',
        validator: validators.halfOpenInterval(0, 1),
        converter: converters.number,
        numeric: true,
        enabled(row) {
          return row.window_definition_mode === 'Window to Wall Ratio';
        },
      },
      {
        name: 'height',
        displayName: 'Height',
        input_type: 'text',
        validator: validators.gt0,
        converter: converters.number,
        numeric: true,
        enabled(row) {
          return row.window_definition_mode === 'Single Window' ||
                 row.window_definition_mode === 'Repeating Windows';
        },
      },
      {
        name: 'width',
        displayName: 'Width',
        input_type: 'text',
        validator: validators.gt0,
        converter: converters.number,
        numeric: true,
        enabled(row) {
          return row.window_definition_mode === 'Single Window' ||
                 row.window_definition_mode === 'Repeating Windows';
        },
      },
      {
        name: 'sill_height',
        displayName: 'Sill Height',
        input_type: 'text',
        validator: validators.gt0,
        converter: converters.number,
        numeric: true,
      },
      {
        name: 'window_spacing',
        displayName: 'Spacing',
        input_type: 'text',
        validator: validators.gt0,
        converter: converters.number,
        numeric: true,
        enabled(row) {
          return row.window_definition_mode === 'Repeating Windows';
        },
      },
      {
        name: 'window_type',
        displayName: 'Window Type',
        input_type: 'select',
        select_data() {
          const options = ['Fixed', 'Operable'];
          return _.zipObject(options, options);
        },
        validator: validators.oneOf('Fixed', 'Operable'),
      },
      {
        name: 'overhang_projection_factor',
        displayName: 'Overhang Projection Factor',
        input_type: 'text',
        validator: validators.gt0orNull,
        converter: converters.gt0orNull,
        numeric: true,
      },
      {
        name: 'fin_projection_factor',
        displayName: 'Fin Projection Factor',
        input_type: 'text',
        validator: validators.gt0orNull,
        converter: converters.gt0orNull,
        numeric: true,
      },
      {
        name: 'texture',
        displayName: 'Texture',
        input_type: 'texture',
        validator: validators.oneOf(...textures),
        enabled(row) {
          return row.window_definition_mode === 'Window to Wall Ratio';
        },
      },
      {
        name: 'total_count',
        displayName: 'Total Count',
        readonly: true,
        numeric: true,
        get(windowDefn, state) {
          return _.chain(state.models.stories)
            .flatMap('windows')
            .filter({ window_definition_id: windowDefn.id })
            .value()
            .length;
        },
      },
    ],
    init: factory.WindowDefn,
  },
  space_types: {
    displayName: 'Space Type',
    definitionName: 'SpaceType',
    columns: [
      {
        name: 'id',
        displayName: 'ID',
        readonly: true,
        private: true,
      },
      {
        name: 'name',
        displayName: 'Name',
        input_type: 'text',
        validator: validators.name,
      },
      {
        name: 'color',
        displayName: 'Color',
        input_type: 'color',
        validator: validators.color,
      },
    ],
    init: factory.SpaceType,
  },
  construction_sets: {
    displayName: 'Construction Set',
    definitionName: 'ConstructionSet',
    columns: [
      {
        name: 'id',
        displayName: 'ID',
        readonly: true,
        private: true,
      },
      {
        name: 'name',
        displayName: 'Name',
        input_type: 'text',
        validator: validators.name,
      },
      {
        name: 'color',
        displayName: 'Color',
        input_type: 'color',
        validator: validators.color,
      },
    ],
    init: factory.ConstructionSet,
  },
  daylighting_control_definitions: {
    displayName: 'Daylighting Control',
    definitionName: 'DaylightingControlDefinition',
    columns: [
      {
        name: 'id',
        displayName: 'ID',
        readonly: true,
        private: true,
      },
      {
        name: 'name',
        displayName: 'Name',
        input_type: 'text',
        validator: validators.name,
      },
      {
        name: 'height',
        displayName: 'Height',
        input_type: 'text',
        validator: validators.gt0,
        converter: converters.number,
        numeric: true,
      },
      {
        name: 'illuminance_setpoint',
        displayName: 'Illuminance Setpoint (lux)',
        input_type: 'text',
        validator: validators.gt0,
        converter: converters.number,
        numeric: true,
      },
      {
        name: 'total_count',
        displayName: 'Total Count',
        readonly: true,
        numeric: true,
        get(dcDefn, state) {
          return _.chain(state.models.stories)
            .flatMap('spaces')
            .flatMap('daylighting_controls')
            .filter({ daylighting_control_definition_id: dcDefn.id })
            .value()
            .length;
        },
      },
    ],
    init: factory.DaylightingControlDefn,
  },
  stories: {
    displayName: 'Story',
    definitionName: 'Story',
    columns: [
      {
        name: 'id',
        displayName: 'ID',
        readonly: true,
        private: true,
      },
      {
        name: 'name',
        displayName: 'Name',
        input_type: 'text',
        validator: validators.name,
      },
      {
        name: 'handle',
        readonly: true,
        private: true,
      },
      {
        name: 'geometry_id',
        readonly: true,
        private: true,
      },
      {
        name: 'below_floor_plenum_height',
        displayName: 'Below Floor Plenum Height',
        input_type: 'text',
        converter: converters.number,
        numeric: true,
        validator: validators.number,
      },
      {
        name: 'above_ceiling_plenum_height',
        displayName: 'Above Ceiling Plenum Height',
        input_type: 'text',
        converter: converters.number,
        numeric: true,
        validator: validators.number,
      },
      {
        name: 'floor_to_ceiling_height',
        displayName: 'Floor To Ceiling Height',
        input_type: 'text',
        converter: converters.number,
        numeric: true,
        validator: validators.gt0,
      },
      {
        name: 'multiplier',
        displayName: 'Multiplier',
        input_type: 'text',
        converter: converters.number,
        numeric: true,
        validator: validators.gt0,
      },
      {
        name: 'spaces',
        displayName: 'Spaces',
        readonly: true,
        numeric: true,
        get(story, state) {
          return story.spaces.length;
        },
      },
      {
        name: 'shading',
        displayName: 'Shading',
        readonly: true,
        numeric: true,
        get(story, state) {
          return story.shading.length;
        },
      },
      {
        name: 'images',
        readonly: true,
        private: true,
      },
      {
        name: 'color',
        displayName: 'Color',
        input_type: 'color',
        validator: validators.color,
      },
    ],
  },
  spaces: {
    displayName: 'Space',
    definitionName: 'Space',
    columns: [
      {
        name: 'id',
        displayName: 'ID',
        readonly: true,
        private: true,
      },
      {
        name: 'name',
        displayName: 'Name',
        input_type: 'text',
        validator: validators.name,
      },
      {
        name: 'handle',
        readonly: true,
        private: true,
      },
      {
        name: 'face_id',
        readonly: true,
        private: true,
      },
      {
        name: 'daylighting_controls',
        displayName: 'Daylighting Controls',
        readonly: true,
        private: true,
        get(space, state) {
          return space.daylighting_controls.map(d => d.name)
          .join(', ');
        },
      },
      {
        name: 'story',
        displayName: 'Story',
        readonly: true,
        get(space, state) {
          const story = state.models.stories.find((story) => {
            return ~story.spaces.map(s => s.id)
            .indexOf(space.id);
          });
          return story.name;
        },
      },
      {
        name: 'building_unit_id',
        displayName: 'Building Unit',
        input_type: 'select',
        select_data(space, state) {
          const options = { '(none)': null };
          state.models.library.building_units.forEach((b) => { options[b.name] = b.id; });
          return options;
        },
        get(space, state) {
          const buildingUnit = state.models.library.building_units.find(b => b.id === space.building_unit_id);
          return buildingUnit ? buildingUnit.name : null;
        },
      },
      {
        name: 'building_type_id',
        displayName: 'Building Type',
        input_type: 'select',
        select_data(_space, state) {
          const options = { '(none)': null };
          state.models.library.building_types.forEach((b) => { options[b.name] = b.id; });
          return options;
        },
        get(space, state) {
          const buildingType = state.models.library.building_types.find(b => b.id === space.building_type_id);
          return buildingType ? buildingType.name : null;
        },
      },
      {
        name: 'space_type_id',
        displayName: 'Space Type',
        input_type: 'select',
        select_data(space, state) {
          const options = { '(none)': null };
          state.models.library.space_types.forEach((s) => { options[s.name] = s.id; });
          return {
            ...options,
            ...helpers.spaceTypesForBuilding(space.building_type_id, space.template),
          };
        },
        get(space, state) {
          const spaceType = state.models.library.space_types.find(s => s.id === space.space_type_id);
          return spaceType ? spaceType.name : null;
        },
      },
      {
        name: 'template',
        displayName: 'Template',
        input_type: 'text',
      },
      {
        name: 'thermal_zone_id',
        displayName: 'Thermal Zone',
        input_type: 'select',
        select_data(_space, state) {
          const options = { '(none)': null };
          state.models.library.thermal_zones.forEach((t) => { options[t.name] = t.id; });
          return options;
        },
        get(space, state) {
          const thermalZone = state.models.library.thermal_zones.find(b => b.id === space.thermal_zone_id);
          return thermalZone ? thermalZone.name : null;
        },
      },
      {
        name: 'construction_set_id',
        displayName: 'Construction Set',
        input_type: 'select',
        select_data(space, state) {
          const options = { '(none)': null };
          state.models.library.construction_sets.forEach((c) => { options[c.name] = c.id; });
          return options;
        },
        get(space, state) {
          const constructionSet = state.models.library.construction_sets.find(c => c.id === space.construction_set_id);
          return constructionSet ? constructionSet.name : null;
        },
      },
      {
        name: 'pitched_roof_id',
        displayName: 'Pitched Roof',
        input_type: 'select',
        select_data(space, state) {
          return {
            '(none)': null,
            ..._.fromPairs(
              state.models.library.pitched_roofs
              .map(prt => [prt.name, prt.id])),
          };
        },
        get(space, state) {
          const prt = _.find(state.models.library.pitched_roofs, { id: space.pitched_roof_id });
          return prt ? prt.name : null;
        },
      },
      {
        name: 'below_floor_plenum_height',
        displayName: 'Below Floor Plenum Height',
        input_type: 'text',
        numeric: true,
        validator: validators.number,
        converter: converters.number,
      },
      {
        name: 'floor_to_ceiling_height',
        displayName: 'Floor to Ceiling Height',
        input_type: 'text',
        numeric: true,
        validator: validators.number,
        converter: converters.number,
      },
      {
        name: 'above_ceiling_plenum_height',
        displayName: 'Above Ceiling Plenum Height',
        input_type: 'text',
        numeric: true,
        validator: validators.number,
        converter: converters.number,
      },
      {
        name: 'floor_offset',
        displayName: 'Floor Offset',
        input_type: 'text',
        numeric: true,
        validator: validators.number,
        converter: converters.number,
      },
      {
        name: 'open_to_below',
        displayName: 'Open To Below',
        input_type: 'select',
        select_data() {
          return { False: false, True: true };
        },
        converter: converters.bool,
      },
      {
        name: 'color',
        displayName: 'Color',
        input_type: 'color',
        validator: validators.color,
      },
    ],
  },
  shading: {
    displayName: 'Shading',
    definitionName: 'Shading',
    columns: [
      {
        name: 'id',
        displayName: 'ID',
        readonly: true,
        private: true,
      },
      {
        name: 'name',
        displayName: 'Name',
        input_type: 'text',
        validator: validators.name,
      },
      {
        name: 'handle',
        readonly: true,
        private: true,
      },
      {
        name: 'face_id',
        readonly: true,
        private: true,
      },
      {
        name: 'color',
        readonly: true,
        private: true,
      },
    ],
  },
  images: {
    displayName: 'Image',
    columns: [
      {
        name: 'id',
        displayName: 'ID',
        readonly: true,
        private: true,
      },
      {
        name: 'name',
        displayName: 'Name',
        input_type: 'text',
        validator: validators.name,
      },
      {
        name: 'width',
        displayName: 'Width',
        input_type: 'text',
        validator: validators.number,
        converter: converters.number,
        numeric: true,
      },
      {
        name: 'height',
        displayName: 'Height',
        input_type: 'text',
        validator: validators.number,
        converter: converters.number,
        numeric: true,
      },
      {
        name: 'z',
        displayName: 'z',
        input_type: 'text',
        validator: validators.number,
        private: true,
      },
      {
        name: 'scale',
        displayName: 'Scale',
        input_type: 'text',
        validator: validators.number,
        converter: converters.number,
        numeric: true,
        get(img) {
          return img.width / img.naturalWidth;
        },
      },
      {
        name: 'opacity',
        displayName: 'opacity',
        input_type: 'text',
        validator: validators.closedInterval(0, 1),
        converter: converters.number,
        numeric: true,
      },

      {
        name: 'x',
        displayName: 'x',
        input_type: 'text',
        validator: validators.number,
        converter: converters.number,
        numeric: true,
      },

      {
        name: 'y',
        displayName: 'y',
        input_type: 'text',
        validator: validators.number,
        converter: converters.number,
        numeric: true,
      },
      {
        name: 'src',
        readonly: true,
        private: true,
      },
    ],
  },
  windows: {
    displayName: 'Window',
    columns: [
      {
        name: 'id',
        private: true,
      },
      {
        name: 'name',
        displayName: 'Name',
        input_type: 'text',
      },
      {
        name: 'window_definition_id',
        displayName: 'Definition',
        input_type: 'select',
        select_data(space, state) {
          return _.fromPairs(state.models.library.window_definitions.map(b => [b.name, b.id]));
        },
      },
    ],
  },
  daylighting_controls: {
    displayName: 'Daylighting Control',
    columns: [
      {
        name: 'id',
        private: true,
      },
      {
        name: 'name',
        displayName: 'Name',
        input_type: 'text',
      },
      {
        name: 'daylighting_control_definition_id',
        displayName: 'Definition',
        input_type: 'select',
        select_data(space, state) {
          return _.fromPairs(state.models.library.daylighting_control_definitions.map(b => [b.name, b.id]));
        },
      },
    ],
  },
  doors: {
    displayName: 'Door',
    columns: [
      {
        name: 'id',
        private: true,
      },
      {
        name: 'name',
        displayName: 'Name',
        input_type: 'text',
      },
      {
        name: 'door_definition_id',
        displayName: 'Definition',
        input_type: 'select',
        select_data(space, state) {
          return _.fromPairs(state.models.library.door_definitions.map(b => [b.name, b.id]));
        },
      },
    ],
  },
  pitched_roofs: {
    displayName: 'Pitched Roof',
    columns: [
      {
        name: 'id',
        displayName: 'ID',
        private: true,
      },
      {
        name: 'name',
        displayName: 'Name',
        input_type: 'text',
      },
      {
        name: 'pitched_roof_type',
        displayName: 'Type',
        input_type: 'select',
        select_data() {
          const options = ['Gable', 'Hip', 'Shed'];
          return _.zipObject(options, options);
        },
        validator: validators.oneOf('Gable', 'Hip', 'Shed'),
      },
      {
        name: 'pitch',
        displayName: 'Pitch',
        input_type: 'text',
        validator: validators.gt0,
        converter: converters.number,
        numeric: true,
      },
      {
        name: 'shed_direction',
        displayName: 'Shed Direction',
        input_type: 'text',
        validator: validators.number,
        converter: converters.number,
        numeric: true,
      },
      {
        name: 'color',
        displayName: 'Color',
        input_type: 'color',
      },
    ],
    init: factory.PitchedRoof,
  },
};

Object.keys(map).forEach((k) => {
  map[k].keymap = _.zipObject(
    _.map(map[k].columns, 'name'),
    map[k].columns);

  map[k].columns.forEach((col) => {
    if (
      _.has(map[k], 'definitionName') &&
      _.get(allowableTypes, map[k].definitionName) &&
      _.includes(allowableTypes[map[k].definitionName][col.name], 'null')
    ) {
      col.nullable = true;
    }

    if (
      _.has(map[k], 'definitionName') &&
      getDefaults(map[k].definitionName) &&
      _.has(getDefaults(map[k].definitionName), col.name)
    ) {
      col.default = getDefaults(map[k].definitionName)[col.name];
    }
  });
});

export default map;
