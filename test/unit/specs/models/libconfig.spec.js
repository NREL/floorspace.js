import { assert, assertEqual } from '../../test_helpers';
import libconfig from 'src/store/modules/models/libconfig';

describe('destroyObject', () => {
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

    assert(!!buildingTypeInstance.id);
    assertEqual(buildingTypeInstance.name, 'test');
    assert(!!buildingTypeInstance.color);
  });
});
