import { assert, assertEqual } from '../../test_helpers';
import libconfig from 'src/store/modules/models/libconfig';
import { state } from './mockData';

describe('libconfig', () => {
  describe('definitions', () => {
    it('should have a definition for building types', () => {
      const buildingType = libconfig.building_types;
  
      assert(!!buildingType, 'Building type not defined in libconfig');
      assertEqual(buildingType.displayName, 'Building Type');
      assertEqual(buildingType.columns.length, 3);
      assertEqual(buildingType.columns[1].displayName, 'Name');
      assertEqual(buildingType.columns[2].displayName, 'Color');
    });
  
    it('should be able to initialize a building type', () => {
      const buildingTypeInstance = libconfig.building_types.init({ name: 'test' });
  
      assert(!!buildingTypeInstance.id, 'No column for id found on building type');
      assertEqual(buildingTypeInstance.name, 'test');
      assert(!!buildingTypeInstance.color, 'No column for color found on building type');
    });
  });

  describe('spaces', () => {
    it('should have a column definition for building type', () => {
      const buildingType = libconfig.spaces.columns.find(c => c.displayName === 'Building Type');
      assert(!!buildingType, 'Could not find column definition for building type');

      const selectData = buildingType.select_data(null, { models: state });
      assertEqual(Object.keys(selectData).length, 3);
      assertEqual(selectData['(none)'], null);
      assertEqual(selectData['Old Building Type'], 'old_building_type');
      assertEqual(selectData['New Building Type'], 'new_building_type');

      const retrieveValue = buildingType.get(state.stories[2].spaces[0], { models: state });
      assertEqual(retrieveValue, 'Old Building Type');
    });
  });
});
