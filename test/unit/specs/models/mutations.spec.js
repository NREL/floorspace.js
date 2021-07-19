import _ from 'lodash';
import { refute, assert, assertEqual } from '../../test_helpers';
import mutations from '../../../../src/store/modules/models/mutations';
import { goodState } from './mockData';

describe('destroyObject', () => {
  it("doesn't delete extra stuff (issue #131)", () => {
    const spaceTypeIds = _.map(goodState.library.space_types, 'id');
    refute(_.includes(spaceTypeIds, '23')); // the thing we're deleting is *not* a space type.

    const thermalZoneIds = _.map(goodState.library.thermal_zones, 'id');
    assert(_.includes(thermalZoneIds, '23'));
    mutations.destroyObject(goodState, { object: { color: '#000000', id: '23', name: 'Thermal Zone 2' } });

    // deleting an unrelated object shouldn't have caused a change in spaceTypes.
    assertEqual(
      spaceTypeIds,
      _.map(goodState.library.space_types, 'id'));

    // but it should have deleted the one we wanted.
    refute(_.includes(_.map(goodState.library.thermal_zones, 'id'), '23'));
  });

  it('should update all spaces within the same building unit when the building type changes', () => {
    mutations.updateSpaceWithData(goodState, { space: goodState.stories[0].spaces[0], building_type_id: 'new_building_type' });
    assertEqual(goodState.stories[0].spaces[0].building_type_id, 'new_building_type');
    assertEqual(goodState.stories[0].spaces[1].building_type_id, 'new_building_type');
    assertEqual(goodState.stories[1].spaces[0].building_type_id, 'new_building_type');

    // Make sure no other spaces got changed in the process
    let count = 0;
    for (let story of goodState.stories) {
      for (let state of story.spaces) {
        if (state.building_type_id === 'new_building_type') {
          count++;
        }
      }
    }

    assertEqual(count, 3);
  });

  it('should update a space with the new building type when changing building unit', () => {
    assertEqual(goodState.stories[2].spaces[0].building_type_id, 'old_building_type');
    mutations.updateSpaceWithData(goodState, { space: goodState.stories[2].spaces[0], building_unit_id: 500 });
    assertEqual(goodState.stories[2].spaces[0].building_type_id, 'new_building_type');

    // Make sure the count of the new building type is now 4
    let count = 0;
    for (let story of goodState.stories) {
      for (let state of story.spaces) {
        if (state.building_type_id === 'new_building_type') {
          count++;
        }
      }
    }

    assertEqual(count, 4);
  });
});
