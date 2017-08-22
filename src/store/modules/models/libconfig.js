import _ from 'lodash';
import factory from './factory';
import validators from './validators';
import * as converters from './converters';

/*
* each library object type has
* displayName - for use in the library Type dropdown
* init - method to initialize a new object of the given type
* keymap - contains displayName and accessor for each property on objects of the given type
*/
const map = {
  building_units: {
    displayName: 'Building Unit',
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
  thermal_zones: {
    displayName: 'Thermal Zone',
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
  space_types: {
    displayName: 'Space Type',
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
    ],
    init: factory.ConstructionSet,
  },
  windows: {
    displayName: 'Window',
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
        name: 'story',
        displayName: 'Story',
        readonly: true,
        get(windowObj, state) {
          // look up story with a reference to the window
          const windowStory = state.models.stories.find(s => s.windows.map(w => w.id).indexOf(windowObj.id) !== -1);
          return windowStory.name;
        },
      },
    ],
    init: factory.Window,
  },
  daylighting_controls: {
    displayName: 'Daylighting Control',
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
    ],
    init: factory.DaylightingControl,
  },
  stories: {
    displayName: 'Story',
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
        validator: validators.number,
      },
      {
        name: 'floor_to_ceiling_height',
        displayName: 'Floor To Ceiling Height',
        input_type: 'text',
        converter: converters.number,
        validator: validators.number,
      },
      {
        name: 'above_ceiling_plenum_height',
        displayName: 'Above Ceiling Plenum Height',
        input_type: 'text',
        converter: converters.number,
        validator: validators.number,
      },
      {
        name: 'multiplier',
        displayName: 'Multiplier',
        input_type: 'text',
        validator: validators.number,
      },
      {
        name: 'spaces',
        displayName: 'Spaces',
        readonly: true,
        get(story, state) {
          return story.spaces.map(s => s.name).join(', ');
        },
      },
      {
        name: 'windows',
        displayName: 'Windows',
        readonly: true,
        private: true,
        get(story, state) {
          return story.windows.map(w => w.name).join(', ');
        },
      },
      {
        name: 'shading',
        displayName: 'Shading',
        readonly: true,
        get(story, state) {
          return story.shading.map(s => s.name).join(', ');
        },
      },
      {
        name: 'images',
        readonly: true,
        private: true,
      },
    ],
  },
  spaces: {
    displayName: 'Space',
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
          const options = {};
          state.models.library.building_units.forEach((b) => { options[b.name] = b.id; });
          return options;
        },
        get(space, state) {
          const buildingUnit = state.models.library.building_units.find(b => b.id === space.building_unit_id);
          return buildingUnit ? buildingUnit.name : null;
        },
      },
      {
        name: 'thermal_zone_id',
        displayName: 'Thermal Zone',
        input_type: 'select',
        select_data(space, state) {
          const options = {};
          state.models.library.thermal_zones.forEach((t) => { options[t.name] = t.id; });
          return options;
        },
        get(space, state) {
          const thermalZone = state.models.library.thermal_zones.find(b => b.id === space.thermal_zone_id);
          return thermalZone ? thermalZone.name : null;
        },
      },
      {
        name: 'space_type_id',
        displayName: 'Space Type',
        input_type: 'select',
        select_data(space, state) {
          const options = {};
          state.models.library.space_types.forEach((s) => { options[s.name] = s.id; });
          return options;
        },
        get(space, state) {
          const spaceType = state.models.library.space_types.find(s => s.id === space.space_type_id);
          return spaceType ? spaceType.name : null;
        },
      },
      {
        name: 'construction_set_id',
        displayName: 'Construction Set',
        input_type: 'select',
        select_data(space, state) {
          const options = {};
          state.models.library.construction_sets.forEach((c) => { options[c.name] = c.id; });
          return options;
        },
        get(space, state) {
          const constructionSet = state.models.library.construction_sets.find(c => c.id === space.construction_set_id);
          return constructionSet ? constructionSet.name : null;
        },
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
        name: 'height',
        displayName: 'Height',
        input_type: 'text',
        validator: validators.number,
      },
      {
        name: 'z',
        displayName: 'z',
        input_type: 'text',
        validator: validators.number,
      },
      {
        name: 'opacity',
        displayName: 'opacity',
        input_type: 'text',
        validator: validators.number,
      },

      {
        name: 'x',
        displayName: 'x',
        input_type: 'text',
        validator: validators.number,
      },

      {
        name: 'y',
        displayName: 'y',
        input_type: 'text',
        validator: validators.number,
      },
      {
        name: 'src',
        readonly: true,
        private: true,
      },
    ],
  },
};

Object.keys(map).forEach((k) => {
  map[k].keymap = _.zipObject(
    _.map(map[k].columns, 'name'),
    map[k].columns);
});

export default map;
