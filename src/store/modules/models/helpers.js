import map from './libconfig';

const helpers = {

  /*
  * each library object type has
  * displayName - for use in the type dropdown
  * init - method to initialize a new object of the parent type (story and space do not have init functions and will be omitted from the CreateO)
  * keymap - contains displayName and accessor for each property on objects of parent type
  */
  map: map,

  /*
  * returns the displayName for a given key on an object type
  * return null if the key is private
  * return the unchanged keyname for custom user defined keys
  */
  displayNameForKey(type, key) {
    if (this.map[type].keymap[key]) {
      return this.map[type].keymap[key].private ? null : this.map[type].keymap[key].displayName;
    }
    return key;
  },

  /*
  * returns the value for a given key on an object type
  * if the keymap includes a get() method for the key, its return value will be used
  */
  valueForKey(object, state, type, key) {
    if (this.map[type].keymap[key] && this.map[type].keymap[key].get) {
      return this.map[type].keymap[key].get(object, state);
    }
    return object[key];
  },

  /*
  * dispatches an action to set the value for a key on an object
  * if a validator is defined for the object type + key being changed, call the validator before dispatching the action
  * if validation fails, return { success: false, error: 'validator error message' }
  * if validation passes or no validator exists (custom user defined keys), return { success: true }
  */
  setValueForKey(object, store, type, key, value) {
    const result = { success: true };

    if (this.map[type].keymap[key] && this.map[type].keymap[key].converter) {
      value = this.map[type].keymap[key].converter(value, this.map[type].keymap[key]);
    }

    // if a validator is defined for the key, run it and store the result
    if (this.map[type].keymap[key] && this.map[type].keymap[key].validator) {
      const validationResult = this.map[type].keymap[key].validator(object, store, value, type);
      result.success = validationResult.success;
      if (!validationResult.success) {
        result.error = validationResult.error;
        return result;
      }
    }
    // dispatch the correct action to update the specified type
    if (type === 'stories') {
      store.dispatch('models/updateStoryWithData', {
        story: object,
        [key]: value,
      });
    } else if (type === 'spaces') {
      store.dispatch('models/updateSpaceWithData', {
        space: object,
        [key]: value,
      });
    } else if (type === 'shading') {
      store.dispatch('models/updateShadingWithData', {
        shading: object,
        [key]: value,
      });
    } else if (type === 'images') {
      store.dispatch('models/updateImageWithData', {
        image: object,
        [key]: value,
      });
    } else if (type === 'window_definitions') {
      store.dispatch('models/updateWindowDefinitionWithData', {
        object,
        [key]: value,
      });
    } else {
      store.dispatch('models/updateObjectWithData', {
        object,
        [key]: value,
      });
    }

    return result;
  },

  inputTypeForKey(type, key) {
    return this.map[type].keymap[key] && !this.map[type].keymap[key].readonly ? this.map[type].keymap[key].input_type : null;
  },

  selectOptionsForKey(object, state, type, key) {
    return this.map[type].keymap[key] && !this.map[type].keymap[key].readonly && this.map[type].keymap[key].input_type === 'select' ? this.map[type].keymap[key].select_data(object, state) : [];
  },


  /*
  * searches local state's library, stories, spaces, and shading for an object with a given id
  */
  libraryObjectWithId(state, id) {
    var result;
    // search the library
    for (var type in state.library) {
      if (state.library.hasOwnProperty(type) && !result && state.library[type].find(i => i.id === id)) {
        result = state.library[type].find(i => i.id === id);
        result.type = type;
      }
    }
    // search stories
    if (!result && state.stories.find(s => s.id === id)) {
      result = state.stories.find(s => s.id === id);
      result.type = 'story';
    }
    // search spaces, shading, and images
    if (!result) {
      for (var i = 0; i < state.stories.length; i++) {
        const story = state.stories[i];
        if (!result && story.spaces.find(s => s.id === id)) {
          result = story.spaces.find(s => s.id === id);
          result.type = 'space';
        }
        if (!result && story.shading.find(s => s.id === id)) {
          result = story.shading.find(s => s.id === id);
          result.type = 'shading';
        }
        if (!result && story.images.find(i => i.id === id)) {
          result = story.images.find(i => i.id === id);
          result.type = 'image';
        }
      }
    }
    return result;
  },

  /*
  * searches local state's stories, shading, and spaces for an object with a given face id
  */
  modelForFace(state, face_id) {
    for (var i = 0; i < state.stories.length; i++) {
      const story = state.stories[i],
        shading = story.shading.find(s => s.face_id === face_id),
        space = story.spaces.find(s => s.face_id === face_id);
      if (shading) {
        shading.type = 'shading';
        return shading;
      } else if (space) {
        space.type = 'space';
        return space;
      }
    }
  },

  /*
  * Generate new unique name
  */
  generateName(state, type, story) {
    const models = this.modelsForType(state, type);
    let prefix = `${map[type].displayName} `;
    if (story) {
      const level = state.stories.findIndex(s => s.id === story.id) + 1;
      prefix = prefix.concat(`${level} - `);
    }

    let name = '';
    let i = 1;
    while (!name) {
      name = prefix + i;
      if (models.find(m => { return m.name === name; })) { name = ''; }
      i += 1;
    }
    return name;
  },

  /*
  * return all models in the library for a given type
  * if type is shading, spaces, or images
  */
  modelsForType(state, type) {
    switch (type) {
      case 'stories':
        return state.stories;
      // accumulate from all stories
      case 'shading':
      case 'spaces':
      case 'images':
        return state.stories.reduce((accum, s) => accum.concat(s[type]), []);
      // 'building_units', 'thermal_zones', 'space_types', 'construction_sets', 'window_definitions', 'daylighting_control_definitions':
      default:
        return state.library[type];
    }
  },

  /**
   * Generates a hash containing all the space types for the given building type
   *
   * @param {string} building_type Type of building to generate space types for
   * @param {string} template Template that the space is following
   * @param {boolean} wholeBuilding Whether or not the space types are generated for the whole building
   * @returns {{[key: string]: string}}
   */
  spaceTypesForBuilding(building_type, template, wholeBuilding = false) {
    const hash = {};

    if (building_type == 'SecondarySchool') {
      if (['DOE Ref Pre-1980', 'DOE Ref 1980-2004', 'ComStock DOE Ref Pre-1980', 'ComStock DOE Ref 1980-2004'].indexOf(template) !== -1) {
        hash['Auditorium'] = 'Auditorium';
        hash['Cafeteria'] = 'Cafeteria';
        hash['Classroom'] = 'Classroom';
        hash['Corridor'] = 'Corridor';
        hash['Gym'] = 'Gym';
        hash['Gym - audience'] = 'Gym - audience';
        hash['Kitchen'] = 'Kitchen';
        hash['Library'] = 'Library';
        hash['Lobby'] = 'Lobby';
        hash['Mechanical'] = 'Mechanical';
        hash['Office'] = 'Office';
        hash['Restroom'] = 'Restroom';
      } else {
        hash['Auditorium'] = 'Auditorium';
        hash['Cafeteria'] = 'Cafeteria';
        hash['Classroom'] = 'Classroom';
        hash['ComputerRoom'] = 'ComputerRoom';
        hash['Corridor'] = 'Corridor';
        hash['Gym'] = 'Gym';
        hash['Kitchen'] = 'Kitchen';
        hash['Library'] = 'Library';
        hash['Lobby'] = 'Lobby';
        hash['Mechanical'] = 'Mechanical';
        hash['Office'] = 'Office';
        hash['Restroom'] = 'Restroom';
      }
    } else if (building_type == 'PrimarySchool') {
      if (['DOE Ref Pre-1980', 'DOE Ref 1980-2004', 'ComStock DOE Ref Pre-1980', 'ComStock DOE Ref 1980-2004'].indexOf(template) !== -1) {
        hash['Cafeteria'] = 'Cafeteria';
        hash['Classroom'] = 'Classroom';
        hash['Corridor'] = 'Corridor';
        hash['Gym'] = 'Gym';
        hash['Kitchen'] = 'Kitchen';
        hash['Library'] = 'Library';
        hash['Lobby'] = 'Lobby';
        hash['Mechanical'] = 'Mechanical';
        hash['Office'] = 'Office';
        hash['Restroom'] = 'Restroom';
      } else {
        hash['Cafeteria'] = 'Cafeteria';
        hash['Classroom'] = 'Classroom';
        hash['ComputerRoom'] = 'ComputerRoom';
        hash['Corridor'] = 'Corridor';
        hash['Gym'] = 'Gym';
        hash['Kitchen'] = 'Kitchen';
        hash['Library'] = 'Library';
        hash['Lobby'] = 'Lobby';
        hash['Mechanical'] = 'Mechanical';
        hash['Office'] = 'Office';
        hash['Restroom'] = 'Restroom';
      }
    } else if (building_type == 'SmallOffice') {
      if (wholeBuilding) {
        hash['WholeBuilding - Sm Office'] = 'WholeBuilding - Sm Office';
      } else {
        hash['SmallOffice - Breakroom'] = 'SmallOffice - Breakroom';
        hash['SmallOffice - ClosedOffice'] = 'SmallOffice - ClosedOffice';
        hash['SmallOffice - Conference'] = 'SmallOffice - Conference';
        hash['SmallOffice - Corridor'] = 'SmallOffice - Corridor';
        hash['SmallOffice - Elec/MechRoom'] = 'SmallOffice - Elec/MechRoom';
        hash['SmallOffice - Lobby'] = 'SmallOffice - Lobby';
        hash['SmallOffice - OpenOffice'] = 'SmallOffice - OpenOffice';
        hash['SmallOffice - Restroom'] = 'SmallOffice - Restroom';
        hash['SmallOffice - Stair'] = 'SmallOffice - Stair';
        hash['SmallOffice - Storage'] = 'SmallOffice - Storage';
        hash['SmallOffice - Classroom'] = 'SmallOffice - Classroom';
        hash['SmallOffice - Dining'] = 'SmallOffice - Dining';
        hash['WholeBuilding - Sm Office'] = 'WholeBuilding - Sm Office';
      }
    } else if (building_type == 'MediumOffice') {
      if (wholeBuilding) {
        hash['WholeBuilding - Md Office'] = 'WholeBuilding - Md Office';
      } else {
        hash['MediumOffice - Breakroom'] = 'MediumOffice - Breakroom';
        hash['MediumOffice - ClosedOffice'] = 'MediumOffice - ClosedOffice';
        hash['MediumOffice - Conference'] = 'MediumOffice - Conference';
        hash['MediumOffice - Corridor'] = 'MediumOffice - Corridor';
        hash['MediumOffice - Elec/MechRoom'] = 'MediumOffice - Elec/MechRoom';
        hash['MediumOffice - Lobby'] = 'MediumOffice - Lobby';
        hash['MediumOffice - OpenOffice'] = 'MediumOffice - OpenOffice';
        hash['MediumOffice - Restroom'] = 'MediumOffice - Restroom';
        hash['MediumOffice - Stair'] = 'MediumOffice - Stair';
        hash['MediumOffice - Storage'] = 'MediumOffice - Storage';
        hash['MediumOffice - Classroom'] = 'MediumOffice - Classroom';
        hash['MediumOffice - Dining'] = 'MediumOffice - Dining';
        hash['WholeBuilding - Md Office'] = 'WholeBuilding - Md Office';
      }
    } else if (building_type == 'LargeOffice') {
      if (['DOE Ref Pre-1980', 'DOE Ref 1980-2004', 'ComStock DOE Ref Pre-1980', 'ComStock DOE Ref 1980-2004'].indexOf(template) !== -1) {
        if (wholeBuilding) {
          hash['WholeBuilding - Lg Office'] = 'WholeBuilding - Lg Office';
        } else {
          hash['BreakRoom'] = 'BreakRoom';
          hash['ClosedOffice'] = 'ClosedOffice';
          hash['Conference'] = 'Conference';
          hash['Corridor'] = 'Corridor';
          hash['Elec/MechRoom'] = 'Elec/MechRoom';
          hash['IT_Room'] = 'IT_Room';
          hash['Lobby'] = 'Lobby';
          hash['OpenOffice'] = 'OpenOffice';
          hash['PrintRoom'] = 'PrintRoom';
          hash['Restroom'] = 'Restroom';
          hash['Stair'] = 'Stair';
          hash['Storage'] = 'Storage';
          hash['Vending'] = 'Vending';
          hash['WholeBuilding - Lg Office'] = 'WholeBuilding - Lg Office';
        }
      } else {
        if (wholeBuilding) {
          hash['WholeBuilding - Lg Office'] = 'WholeBuilding - Lg Office';
          hash['OfficeLarge Data Center'] = 'OfficeLarge Data Center';
          hash['OfficeLarge Main Data Center'] = 'OfficeLarge Main Data Center';
        } else {
          hash['BreakRoom'] = 'BreakRoom';
          hash['ClosedOffice'] = 'ClosedOffice';
          hash['Conference'] = 'Conference';
          hash['Corridor'] = 'Corridor';
          hash['Elec/MechRoom'] = 'Elec/MechRoom';
          hash['IT_Room'] = 'IT_Room';
          hash['Lobby'] = 'Lobby';
          hash['OpenOffice'] = 'OpenOffice';
          hash['PrintRoom'] = 'PrintRoom';
          hash['Restroom'] = 'Restroom';
          hash['Stair'] = 'Stair';
          hash['Storage'] = 'Storage';
          hash['Vending'] = 'Vending';
          hash['WholeBuilding - Lg Office'] = 'WholeBuilding - Lg Office';
          hash['OfficeLarge Data Center'] = 'OfficeLarge Data Center';
          hash['OfficeLarge Main Data Center'] = 'OfficeLarge Main Data Center';
        }
      }
    } else if (building_type == 'SmallHotel') {
      if (['DOE Ref Pre-1980', 'DOE Ref 1980-2004', 'ComStock DOE Ref Pre-1980', 'ComStock DOE Ref 1980-2004'].indexOf(template) !== -1) {
        hash['Corridor'] = 'Corridor';
        hash['Elec/MechRoom'] = 'Elec/MechRoom';
        hash['ElevatorCore'] = 'ElevatorCore';
        hash['Exercise'] = 'Exercise';
        hash['GuestLounge'] = 'GuestLounge';
        hash['GuestRoom'] = 'GuestRoom';
        hash['Laundry'] = 'Laundry';
        hash['Mechanical'] = 'Mechanical';
        hash['Meeting'] = 'Meeting';
        hash['Office'] = 'Office';
        hash['PublicRestroom'] = 'PublicRestroom';
        hash['StaffLounge'] = 'StaffLounge';
        hash['Stair'] = 'Stair';
        hash['Storage'] = 'Storage';
      } else {
        hash['Corridor'] = 'Corridor';
        hash['Elec/MechRoom'] = 'Elec/MechRoom';
        hash['ElevatorCore'] = 'ElevatorCore';
        hash['Exercise'] = 'Exercise';
        hash['GuestLounge'] = 'GuestLounge';
        hash['GuestRoom123Occ'] = 'GuestRoom123Occ';
        hash['GuestRoom123Vac'] = 'GuestRoom123Vac';
        hash['Laundry'] = 'Laundry';
        hash['Mechanical'] = 'Mechanical';
        hash['Meeting'] = 'Meeting';
        hash['Office'] = 'Office';
        hash['PublicRestroom'] = 'PublicRestroom';
        hash['StaffLounge'] = 'StaffLounge';
        hash['Stair'] = 'Stair';
        hash['Storage'] = 'Storage';
      }
    } else if (building_type == 'LargeHotel') {
      hash['Banquet'] = 'Banquet';
      hash['Basement'] = 'Basement';
      hash['Cafe'] = 'Cafe';
      hash['Corridor'] = 'Corridor';
      hash['GuestRoom'] = 'GuestRoom';
      hash['Kitchen'] = 'Kitchen';
      hash['Laundry'] = 'Laundry';
      hash['Lobby'] = 'Lobby';
      hash['Mechanical'] = 'Mechanical';
      hash['Retail'] = 'Retail';
      hash['Storage'] = 'Storage';
    } else if (building_type == 'Warehouse') {
      hash['Bulk'] = 'Bulk';
      hash['Fine'] = 'Fine';
      hash['Office'] = 'Office';
    } else if (building_type == 'RetailStandalone') {
      hash['Back_Space'] = 'Back_Space';
      hash['Entry'] = 'Entry';
      hash['Point_of_Sale'] = 'Point_of_Sale';
      hash['Retail'] = 'Retail';
    } else if (building_type == 'RetailStripmall') {
      hash['Strip mall - type 1'] = 'Strip mall - type 1';
      hash['Strip mall - type 2'] = 'Strip mall - type 2';
      hash['Strip mall - type 3'] = 'Strip mall - type 3';
    } else if (building_type == 'QuickServiceRestaurant') {
      hash['Dining'] = 'Dining';
      hash['Kitchen'] = 'Kitchen';
    } else if (building_type == 'FullServiceRestaurant') {
      hash['Dining'] = 'Dining';
      hash['Kitchen'] = 'Kitchen';
    } else if (building_type == 'MidriseApartment') {
      hash['Apartment'] = 'Apartment';
      hash['Corridor'] = 'Corridor';
      hash['Office'] = 'Office';
    } else if (building_type == 'HighriseApartment') {
      hash['Apartment'] = 'Apartment';
      hash['Corridor'] = 'Corridor';
      hash['Office'] = 'Office';
    } else if (building_type == 'Hospital') {
      hash['Basement'] = 'Basement';
      hash['Corridor'] = 'Corridor';
      hash['Dining'] = 'Dining';
      hash['ER_Exam'] = 'ER_Exam';
      hash['ER_NurseStn'] = 'ER_NurseStn';
      hash['ER_Trauma'] = 'ER_Trauma';
      hash['ER_Triage'] = 'ER_Triage';
      hash['ICU_NurseStn'] = 'ICU_NurseStn';
      hash['ICU_Open'] = 'ICU_Open';
      hash['ICU_PatRm'] = 'ICU_PatRm';
      hash['Kitchen'] = 'Kitchen';
      hash['Lab'] = 'Lab';
      hash['Lobby'] = 'Lobby';
      hash['NurseStn'] = 'NurseStn';
      hash['Office'] = 'Office';
      hash['OR'] = 'OR';
      hash['PatCorridor'] = 'PatCorridor';
      hash['PatRoom'] = 'PatRoom';
      hash['PhysTherapy'] = 'PhysTherapy';
      hash['Radiology'] = 'Radiology';
    } else if (building_type == 'Outpatient') {
      hash['Anesthesia'] = 'Anesthesia';
      hash['BioHazard'] = 'BioHazard';
      hash['Cafe'] = 'Cafe';
      hash['CleanWork'] = 'CleanWork';
      hash['Conference'] = 'Conference';
      hash['DresingRoom'] = 'DresingRoom';
      hash['Elec/MechRoom'] = 'Elec/MechRoom';
      hash['ElevatorPumpRoom'] = 'ElevatorPumpRoom';
      hash['Exam'] = 'Exam';
      hash['Hall'] = 'Hall';
      hash['IT_Room'] = 'IT_Room';
      hash['Janitor'] = 'Janitor';
      hash['Lobby'] = 'Lobby';
      hash['LockerRoom'] = 'LockerRoom';
      hash['Lounge'] = 'Lounge';
      hash['MedGas'] = 'MedGas';
      hash['MRI'] = 'MRI';
      hash['MRI_Control'] = 'MRI_Control';
      hash['NurseStation'] = 'NurseStation';
      hash['Office'] = 'Office';
      hash['OR'] = 'OR';
      hash['PACU'] = 'PACU';
      hash['PhysicalTherapy'] = 'PhysicalTherapy';
      hash['PreOp'] = 'PreOp';
      hash['ProcedureRoom'] = 'ProcedureRoom';
      hash['Reception'] = 'Reception';
      hash['Soil Work'] = 'Soil Work';
      hash['Stair'] = 'Stair';
      hash['Toilet'] = 'Toilet';
      hash['Undeveloped'] = 'Undeveloped';
      hash['Xray'] = 'Xray';
    } else if (building_type == 'SuperMarket') {
      hash['Bakery'] = 'Bakery';
      hash['Deli'] = 'Deli';
      hash['DryStorage'] = 'DryStorage';
      hash['Office'] = 'Office';
      hash['Produce'] = 'Produce';
      hash['Sales'] = 'Sales';
      hash['Corridor'] = 'Corridor';
      hash['Dining'] = 'Dining';
      hash['Elec/MechRoom'] = 'Elec/MechRoom';
      hash['Meeting'] = 'Meeting';
      hash['Restroom'] = 'Restroom';
      hash['Vestibule'] = 'Vestibule';
    } else if (building_type == 'Laboratory') {
      hash['Office'] = 'Office';
      hash['Open lab'] = 'Open lab';
      hash['Equipment corridor'] = 'Equipment corridor';
      hash['Lab with fume hood'] = 'Lab with fume hood';
    } else if (building_type == 'LargeDataCenterHighITE') {
      hash['StandaloneDataCenter'] = 'StandaloneDataCenter';
    } else if (building_type == 'LargeDataCenterLowITE') {
      hash['StandaloneDataCenter'] = 'StandaloneDataCenter';
    } else if (building_type == 'SmallDataCenterHighITE') {
      hash['ComputerRoom'] = 'ComputerRoom';
    } else if (building_type == 'SmallDataCenterLowITE') {
      hash['ComputerRoom'] = 'ComputerRoom';
    } else if (building_type == 'Asm') {
      hash['Auditorium'] = 'Auditorium';
      hash['OfficeGeneral'] = 'OfficeGeneral';
    } else if (building_type == 'ECC') {
      hash['Classroom'] = 'Classroom';
      hash['CompRoomClassRm'] = 'CompRoomClassRm';
      hash['Shop'] = 'Shop';
      hash['Dining'] = 'Dining';
      hash['Kitchen'] = 'Kitchen';
      hash['OfficeGeneral'] = 'OfficeGeneral';
    } else if (building_type == 'EPr') {
      hash['Classroom'] = 'Classroom';
      hash['CorridorStairway'] = 'CorridorStairway';
      hash['Dining'] = 'Dining';
      hash['Gymnasium'] = 'Gymnasium';
      hash['Kitchen'] = 'Kitchen';
    } else if (building_type == 'ERC') {
      hash['Classroom'] = 'Classroom';
    } else if (building_type == 'ESe') {
      hash['Classroom'] = 'Classroom';
      hash['CompRoomClassRm'] = 'CompRoomClassRm';
      hash['CorridorStairway'] = 'CorridorStairway';
      hash['Dining'] = 'Dining';
      hash['Gymnasium'] = 'Gymnasium';
      hash['Kitchen'] = 'Kitchen';
      hash['OfficeGeneral'] = 'OfficeGeneral';
    } else if (building_type == 'EUn') {
      hash['Dining'] = 'Dining';
      hash['Classroom'] = 'Classroom';
      hash['OfficeGeneral'] = 'OfficeGeneral';
      hash['CompRoomClassRm'] = 'CompRoomClassRm';
      hash['Kitchen'] = 'Kitchen';
      hash['CorridorStairway'] = 'CorridorStairway';
      hash['FacMaint'] = 'FacMaint';
      hash['DormitoryRoom'] = 'DormitoryRoom';
    } else if (building_type == 'Gro') {
      hash['GrocSales'] = 'GrocSales';
      hash['RefWalkInCool'] = 'RefWalkInCool';
      hash['OfficeGeneral'] = 'OfficeGeneral';
      hash['RefFoodPrep'] = 'RefFoodPrep';
      hash['RefWalkInFreeze'] = 'RefWalkInFreeze';
      hash['IndLoadDock'] = 'IndLoadDock';
    } else if (building_type == 'Hsp') {
      hash['HspSurgOutptLab'] = 'HspSurgOutptLab';
      hash['Dining'] = 'Dining';
      hash['Kitchen'] = 'Kitchen';
      hash['OfficeGeneral'] = 'OfficeGeneral';
      hash['PatientRoom'] = 'PatientRoom';
    } else if (building_type == 'Htl') {
      hash['Dining'] = 'Dining';
      hash['BarCasino'] = 'BarCasino';
      hash['HotelLobby'] = 'HotelLobby';
      hash['OfficeGeneral'] = 'OfficeGeneral';
      hash['GuestRmCorrid'] = 'GuestRmCorrid';
      hash['Laundry'] = 'Laundry';
      hash['GuestRmOcc'] = 'GuestRmOcc';
      hash['GuestRmUnOcc'] = 'GuestRmUnOcc';
      hash['Kitchen'] = 'Kitchen';
    } else if (building_type == 'MBT') {
      hash['CompRoomData'] = 'CompRoomData';
      hash['Laboratory'] = 'Laboratory';
      hash['CorridorStairway'] = 'CorridorStairway';
      hash['Conference'] = 'Conference';
      hash['Dining'] = 'Dining';
      hash['OfficeOpen'] = 'OfficeOpen';
      hash['Kitchen'] = 'Kitchen';
    } else if (building_type == 'MFm') {
      hash['ResLiving'] = 'ResLiving';
      hash['ResPublicArea'] = 'ResPublicArea';
    } else if (building_type == 'MLI') {
      hash['StockRoom'] = 'StockRoom';
      hash['Work'] = 'Work';
    } else if (building_type == 'Mtl') {
      hash['OfficeGeneral'] = 'OfficeGeneral';
      hash['GuestRmCorrid'] = 'GuestRmCorrid';
      hash['Laundry'] = 'Laundry';
      hash['GuestRmOcc'] = 'GuestRmOcc';
      hash['GuestRmUnOcc'] = 'GuestRmUnOcc';
    } else if (building_type == 'Nrs') {
      hash['CorridorStairway'] = 'CorridorStairway';
      hash['Dining'] = 'Dining';
      hash['Kitchen'] = 'Kitchen';
      hash['OfficeGeneral'] = 'OfficeGeneral';
      hash['PatientRoom'] = 'PatientRoom';
    } else if (building_type == 'OfL') {
      hash['LobbyWaiting'] = 'LobbyWaiting';
      hash['OfficeSmall'] = 'OfficeSmall';
      hash['OfficeOpen'] = 'OfficeOpen';
      hash['MechElecRoom'] = 'MechElecRoom';
    } else if (building_type == 'OfS') {
      hash['Hall'] = 'Hall';
      hash['OfficeSmall'] = 'OfficeSmall';
    } else if (building_type == 'RFF') {
      hash['Dining'] = 'Dining';
      hash['Kitchen'] = 'Kitchen';
      hash['LobbyWaiting'] = 'LobbyWaiting';
      hash['Restroom'] = 'Restroom';
    } else if (building_type == 'RSD') {
      hash['Restroom'] = 'Restroom';
      hash['Dining'] = 'Dining';
      hash['LobbyWaiting'] = 'LobbyWaiting';
      hash['Kitchen'] = 'Kitchen';
    } else if (building_type == 'Rt3') {
      hash['RetailSales'] = 'RetailSales';
    } else if (building_type == 'RtL') {
      hash['OfficeGeneral'] = 'OfficeGeneral';
      hash['Work'] = 'Work';
      hash['StockRoom'] = 'StockRoom';
      hash['RetailSales'] = 'RetailSales';
      hash['Kitchen'] = 'Kitchen';
    } else if (building_type == 'RtS') {
      hash['RetailSales'] = 'RetailSales';
      hash['StockRoom'] = 'StockRoom';
    } else if (building_type == 'SCn') {
      hash['WarehouseCond'] = 'WarehouseCond';
    } else if (building_type == 'SUn') {
      hash['WarehouseUnCond'] = 'WarehouseUnCond';
    } else if (building_type == 'WRf') {
      hash['IndLoadDock'] = 'IndLoadDock';
      hash['OfficeGeneral'] = 'OfficeGeneral';
      hash['RefStorFreezer'] = 'RefStorFreezer';
      hash['RefStorCooler'] = 'RefStorCooler';
    }

    return hash;
  }
};
export default helpers;
