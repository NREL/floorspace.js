import _ from 'lodash';
import map from './libconfig';
import idFactory from './../../utilities/generateId';

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
      hash['Auditorium'] = 'Auditorium';
      hash['Cafeteria'] = 'Cafeteria';
      hash['Classroom'] = 'Classroom';
      hash['Computer Room'] = 'ComputerRoom';
      hash['Corridor'] = 'Corridor';
      hash['Gym'] = 'Gym';
      hash['Kitchen'] = 'Kitchen';
      hash['Library'] = 'Library';
      hash['Lobby'] = 'Lobby';
      hash['Mechanical'] = 'Mechanical';
      hash['Office'] = 'Office';
      hash['Restroom'] = 'Restroom';

      if (['DOE Ref Pre-1980', 'DOE Ref 1980-2004', 'ComStock DOE Ref Pre-1980', 'ComStock DOE Ref 1980-2004'].indexOf(template) !== -1) {
        hash['Corridor'] = 'Corridor';
        hash['Gym - audience'] = 'Gym - audience';
      }

    } else if (building_type == 'PrimarySchool') {
      hash['Cafeteria'] = 'Cafeteria';
      hash['Classroom'] = 'Classroom';
      hash['Computer Room'] = 'ComputerRoom';
      hash['Corridor'] = 'Corridor';
      hash['Gym'] = 'Gym';
      hash['Kitchen'] = 'Kitchen';
      hash['Library'] = 'Library';
      hash['Lobby'] = 'Lobby';
      hash['Mechanical'] = 'Mechanical';
      hash['Office'] = 'Office';
      hash['Restroom'] = 'Restroom';

      if (['DOE Ref Pre-1980', 'DOE Ref 1980-2004', 'ComStock DOE Ref Pre-1980', 'ComStock DOE Ref 1980-2004'].indexOf(template) === -1) {
        hash['Computer Room'] = 'ComputerRoom';
      }

    } else if (building_type == 'SmallOffice') {
      if (wholeBuilding) {
        hash['Whole Building - Sm Office'] = 'WholeBuilding - Sm Office';
      } else {
        hash['Small Office - Breakroom'] = 'SmallOffice - Breakroom';
        hash['Small Office - ClosedOffice'] = 'SmallOffice - ClosedOffice';
        hash['Small Office - Conference'] = 'SmallOffice - Conference';
        hash['Small Office - Corridor'] = 'SmallOffice - Corridor';
        hash['Small Office - Elec/Mech Room'] = 'SmallOffice - Elec/MechRoom';
        hash['Small Office - Lobby'] = 'SmallOffice - Lobby';
        hash['Small Office - OpenOffice'] = 'SmallOffice - OpenOffice';
        hash['Small Office - Restroom'] = 'SmallOffice - Restroom';
        hash['Small Office - Stair'] = 'SmallOffice - Stair';
        hash['Small Office - Storage'] = 'SmallOffice - Storage';
        hash['Small Office - Classroom'] = 'SmallOffice - Classroom';
        hash['Small Office - Dining'] = 'SmallOffice - Dining';
        hash['Whole Building - Sm Office'] = 'WholeBuilding - Sm Office';
      }

    } else if (building_type == 'MediumOffice') {
      if (wholeBuilding) {
        hash['Whole Building - Md Office'] = 'WholeBuilding - Md Office';
      } else {
        hash['Medium Office - Breakroom'] = 'MediumOffice - Breakroom';
        hash['Medium Office - ClosedOffice'] = 'MediumOffice - ClosedOffice';
        hash['Medium Office - Conference'] = 'MediumOffice - Conference';
        hash['Medium Office - Corridor'] = 'MediumOffice - Corridor';
        hash['Medium Office - Elec/Mech Room'] = 'MediumOffice - Elec/MechRoom';
        hash['Medium Office - Lobby'] = 'MediumOffice - Lobby';
        hash['Medium Office - OpenOffice'] = 'MediumOffice - OpenOffice';
        hash['Medium Office - Restroom'] = 'MediumOffice - Restroom';
        hash['Medium Office - Stair'] = 'MediumOffice - Stair';
        hash['Medium Office - Storage'] = 'MediumOffice - Storage';
        hash['Medium Office - Classroom'] = 'MediumOffice - Classroom';
        hash['Medium Office - Dining'] = 'MediumOffice - Dining';
        hash['Whole Building - Md Office'] = 'WholeBuilding - Md Office';
      }

    } else if (building_type == 'LargeOffice') {
      if (wholeBuilding) {
        hash['Whole Building - Lg Office'] = 'WholeBuilding - Lg Office';
      }

      hash['Break Room'] = 'BreakRoom';
      hash['Closed Office'] = 'ClosedOffice';
      hash['Conference'] = 'Conference';
      hash['Corridor'] = 'Corridor';
      hash['Elec/Mech Room'] = 'Elec/MechRoom';
      hash['IT Room'] = 'IT_Room';
      hash['Lobby'] = 'Lobby';
      hash['Open Office'] = 'OpenOffice';
      hash['Print Room'] = 'PrintRoom';
      hash['Restroom'] = 'Restroom';
      hash['Stair'] = 'Stair';
      hash['Storage'] = 'Storage';
      hash['Vending'] = 'Vending';
      hash['Whole Building - Lg Office'] = 'WholeBuilding - Lg Office';

      if (['DOE Ref Pre-1980', 'DOE Ref 1980-2004', 'ComStock DOE Ref Pre-1980', 'ComStock DOE Ref 1980-2004'].indexOf(template) === -1) {
        if (wholeBuilding) {
          hash['Office - Large Data Center'] = 'OfficeLarge Data Center';
          hash['Office - Large Main Data Center'] = 'OfficeLarge Main Data Center';
        } else {
          hash['Office - Large Data Center'] = 'OfficeLarge Data Center';
          hash['Office - Large Main Data Center'] = 'OfficeLarge Main Data Center';
        }
      }

    } else if (building_type == 'SmallHotel') {
      hash['Corridor'] = 'Corridor';
      hash['Elec/Mech Room'] = 'Elec/MechRoom';
      hash['Elevator Core'] = 'ElevatorCore';
      hash['Exercise'] = 'Exercise';
      hash['Guest Lounge'] = 'GuestLounge';
      hash['Laundry'] = 'Laundry';
      hash['Mechanical'] = 'Mechanical';
      hash['Meeting'] = 'Meeting';
      hash['Office'] = 'Office';
      hash['Public Restroom'] = 'PublicRestroom';
      hash['Staff Lounge'] = 'StaffLounge';
      hash['Stair'] = 'Stair';
      hash['Storage'] = 'Storage';

      if (['DOE Ref Pre-1980', 'DOE Ref 1980-2004', 'ComStock DOE Ref Pre-1980', 'ComStock DOE Ref 1980-2004'].indexOf(template) !== -1) {
        hash['Guest Room'] = 'GuestRoom';
      } else {
        hash['Guest Room 123O cc'] = 'GuestRoom123Occ';
        hash['Guest Room 123V ac'] = 'GuestRoom123Vac';
      }
    } else if (building_type == 'LargeHotel') {
      hash['Banquet'] = 'Banquet';
      hash['Basement'] = 'Basement';
      hash['Cafe'] = 'Cafe';
      hash['Corridor'] = 'Corridor';
      hash['Guest Room'] = 'GuestRoom';
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
      hash['Back Space'] = 'Back_Space';
      hash['Entry'] = 'Entry';
      hash['Point of Sale'] = 'Point_of_Sale';
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
      hash['ER Exam'] = 'ER_Exam';
      hash['ER Nurse Station'] = 'ER_NurseStn';
      hash['ER Trauma'] = 'ER_Trauma';
      hash['ER Triage'] = 'ER_Triage';
      hash['ICU Nurse Station'] = 'ICU_NurseStn';
      hash['ICU Open'] = 'ICU_Open';
      hash['ICU Patient Room'] = 'ICU_PatRm';
      hash['Kitchen'] = 'Kitchen';
      hash['Lab'] = 'Lab';
      hash['Lobby'] = 'Lobby';
      hash['Nurse Station'] = 'NurseStn';
      hash['Office'] = 'Office';
      hash['OR'] = 'OR';
      hash['Patient Corridor'] = 'PatCorridor';
      hash['Patient Room'] = 'PatRoom';
      hash['Physical Therapy'] = 'PhysTherapy';
      hash['Radiology'] = 'Radiology';
    } else if (building_type == 'Outpatient') {
      hash['Anesthesia'] = 'Anesthesia';
      hash['BioHazard'] = 'BioHazard';
      hash['Cafe'] = 'Cafe';
      hash['Clean Work'] = 'CleanWork';
      hash['Conference'] = 'Conference';
      hash['Dressing Room'] = 'DresingRoom';
      hash['Elec/Mech Room'] = 'Elec/MechRoom';
      hash['Elevator Pump Room'] = 'ElevatorPumpRoom';
      hash['Exam'] = 'Exam';
      hash['Hall'] = 'Hall';
      hash['IT Room'] = 'IT_Room';
      hash['Janitor'] = 'Janitor';
      hash['Lobby'] = 'Lobby';
      hash['Locker Room'] = 'LockerRoom';
      hash['Lounge'] = 'Lounge';
      hash['Med Gas'] = 'MedGas';
      hash['MRI'] = 'MRI';
      hash['MRI Control'] = 'MRI_Control';
      hash['Nurse Station'] = 'NurseStation';
      hash['Office'] = 'Office';
      hash['OR'] = 'OR';
      hash['PACU'] = 'PACU';
      hash['Physical Therapy'] = 'PhysicalTherapy';
      hash['PreOp'] = 'PreOp';
      hash['Procedure Room'] = 'ProcedureRoom';
      hash['Reception'] = 'Reception';
      hash['Soil Work'] = 'Soil Work';
      hash['Stair'] = 'Stair';
      hash['Toilet'] = 'Toilet';
      hash['Undeveloped'] = 'Undeveloped';
      hash['Xray'] = 'Xray';
    } else if (building_type == 'SuperMarket') {
      hash['Bakery'] = 'Bakery';
      hash['Deli'] = 'Deli';
      hash['Dry Storage'] = 'DryStorage';
      hash['Office'] = 'Office';
      hash['Produce'] = 'Produce';
      hash['Sales'] = 'Sales';
      hash['Corridor'] = 'Corridor';
      hash['Dining'] = 'Dining';
      hash['Elec/Mech Room'] = 'Elec/MechRoom';
      hash['Meeting'] = 'Meeting';
      hash['Restroom'] = 'Restroom';
      hash['Vestibule'] = 'Vestibule';
    } else if (building_type == 'Laboratory') {
      hash['Office'] = 'Office';
      hash['Open Lab'] = 'Open lab';
      hash['Equipment Corridor'] = 'Equipment corridor';
      hash['Lab with Fume Hood'] = 'Lab with fume hood';
    } else if (building_type == 'LargeDataCenterHighITE') {
      hash['Standalone Data Center'] = 'StandaloneDataCenter';
    } else if (building_type == 'LargeDataCenterLowITE') {
      hash['Standalone Data Center'] = 'StandaloneDataCenter';
    } else if (building_type == 'SmallDataCenterHighITE') {
      hash['Computer Room'] = 'ComputerRoom';
    } else if (building_type == 'SmallDataCenterLowITE') {
      hash['Computer Room'] = 'ComputerRoom';
    } else if (building_type == 'Asm') {
      hash['Auditorium'] = 'Auditorium';
      hash['Office General'] = 'OfficeGeneral';
    } else if (building_type == 'ECC') {
      hash['Classroom'] = 'Classroom';
      hash['Computer Room Classroom'] = 'CompRoomClassRm';
      hash['Shop'] = 'Shop';
      hash['Dining'] = 'Dining';
      hash['Kitchen'] = 'Kitchen';
      hash['Office General'] = 'OfficeGeneral';
    } else if (building_type == 'EPr') {
      hash['Classroom'] = 'Classroom';
      hash['Corridor Stairway'] = 'CorridorStairway';
      hash['Dining'] = 'Dining';
      hash['Gymnasium'] = 'Gymnasium';
      hash['Kitchen'] = 'Kitchen';
    } else if (building_type == 'ERC') {
      hash['Classroom'] = 'Classroom';
    } else if (building_type == 'ESe') {
      hash['Classroom'] = 'Classroom';
      hash['Computer Room Classroom'] = 'CompRoomClassRm';
      hash['Corridor Stairway'] = 'CorridorStairway';
      hash['Dining'] = 'Dining';
      hash['Gymnasium'] = 'Gymnasium';
      hash['Kitchen'] = 'Kitchen';
      hash['Office General'] = 'OfficeGeneral';
    } else if (building_type == 'EUn') {
      hash['Dining'] = 'Dining';
      hash['Classroom'] = 'Classroom';
      hash['Office General'] = 'OfficeGeneral';
      hash['Computer Room Classroom'] = 'CompRoomClassRm';
      hash['Kitchen'] = 'Kitchen';
      hash['Corridor Stairway'] = 'CorridorStairway';
      hash['FacMaint'] = 'FacMaint';
      hash['Dormitory Room'] = 'DormitoryRoom';
    } else if (building_type == 'Gro') {
      hash['Grocery Sales'] = 'GrocSales';
      hash['Ref Walk In Cool'] = 'RefWalkInCool';
      hash['Office General'] = 'OfficeGeneral';
      hash['Ref Food Prep'] = 'RefFoodPrep';
      hash['Ref Walk In Freeze'] = 'RefWalkInFreeze';
      hash['Ind Load Dock'] = 'IndLoadDock';
    } else if (building_type == 'Hsp') {
      hash['Hsp Surg Outpt Lab'] = 'HspSurgOutptLab';
      hash['Dining'] = 'Dining';
      hash['Kitchen'] = 'Kitchen';
      hash['Office General'] = 'OfficeGeneral';
      hash['Patient Room'] = 'PatientRoom';
    } else if (building_type == 'Htl') {
      hash['Dining'] = 'Dining';
      hash['Bar Casino'] = 'BarCasino';
      hash['Hotel Lobby'] = 'HotelLobby';
      hash['Office General'] = 'OfficeGeneral';
      hash['Guest Rm Corrid'] = 'GuestRmCorrid';
      hash['Laundry'] = 'Laundry';
      hash['Guest Rm Occ'] = 'GuestRmOcc';
      hash['Guest Rm Un Occ'] = 'GuestRmUnOcc';
      hash['Kitchen'] = 'Kitchen';
    } else if (building_type == 'MBT') {
      hash['Computer Room Classroom'] = 'CompRoomData';
      hash['Laboratory'] = 'Laboratory';
      hash['Corridor Stairway'] = 'CorridorStairway';
      hash['Conference'] = 'Conference';
      hash['Dining'] = 'Dining';
      hash['Office Open'] = 'OfficeOpen';
      hash['Kitchen'] = 'Kitchen';
    } else if (building_type == 'MFm') {
      hash['Res Living'] = 'ResLiving';
      hash['Res Public Area'] = 'ResPublicArea';
    } else if (building_type == 'MLI') {
      hash['Stock Room'] = 'StockRoom';
      hash['Work'] = 'Work';
    } else if (building_type == 'Mtl') {
      hash['Office General'] = 'OfficeGeneral';
      hash['Guest Rm Corrid'] = 'GuestRmCorrid';
      hash['Laundry'] = 'Laundry';
      hash['Guest Rm Occ'] = 'GuestRmOcc';
      hash['Guest Rm Un Occ'] = 'GuestRmUnOcc';
    } else if (building_type == 'Nrs') {
      hash['Corridor Stairway'] = 'CorridorStairway';
      hash['Dining'] = 'Dining';
      hash['Kitchen'] = 'Kitchen';
      hash['Office General'] = 'OfficeGeneral';
      hash['Patient Room'] = 'PatientRoom';
    } else if (building_type == 'OfL') {
      hash['Lobby Waiting'] = 'LobbyWaiting';
      hash['Office Small'] = 'OfficeSmall';
      hash['Office Open'] = 'OfficeOpen';
      hash['Mech Elec Room'] = 'MechElecRoom';
    } else if (building_type == 'OfS') {
      hash['Hall'] = 'Hall';
      hash['Office Small'] = 'OfficeSmall';
    } else if (building_type == 'RFF') {
      hash['Dining'] = 'Dining';
      hash['Kitchen'] = 'Kitchen';
      hash['Lobby Waiting'] = 'LobbyWaiting';
      hash['Restroom'] = 'Restroom';
    } else if (building_type == 'RSD') {
      hash['Restroom'] = 'Restroom';
      hash['Dining'] = 'Dining';
      hash['Lobby Waiting'] = 'LobbyWaiting';
      hash['Kitchen'] = 'Kitchen';
    } else if (building_type == 'Rt3') {
      hash['Retail Sales'] = 'RetailSales';
    } else if (building_type == 'RtL') {
      hash['Office General'] = 'OfficeGeneral';
      hash['Work'] = 'Work';
      hash['Stock Room'] = 'StockRoom';
      hash['Retail Sales'] = 'RetailSales';
      hash['Kitchen'] = 'Kitchen';
    } else if (building_type == 'RtS') {
      hash['Retail Sales'] = 'RetailSales';
      hash['Stock Room'] = 'StockRoom';
    } else if (building_type == 'SCn') {
      hash['Warehouse Cond'] = 'WarehouseCond';
    } else if (building_type == 'SUn') {
      hash['Warehouse Un Cond'] = 'WarehouseUnCond';
    } else if (building_type == 'WRf') {
      hash['Ind Load Dock'] = 'IndLoadDock';
      hash['Office General'] = 'OfficeGeneral';
      hash['Ref Stor Freezer'] = 'RefStorFreezer';
      hash['Ref Stor Cooler'] = 'RefStorCooler';
    }

    return hash;
  },

  /**
   * Given a story
   * Generates new ids for the doors, windows, spaces and shading
   * Assigns those ids to the clonedStory based on the idMap
   * Returns the clonedStory
   *
   * @param {'Story'} story
   * @param {*} idMap
   */
  replaceIdsUpdateInfoForCloning(story, idMap) {
    const clonedStory = _.cloneDeep(story);
    clonedStory.doors = clonedStory.doors.map((door) => {
      const newID = idFactory.generate();
      idMap[door.id] = newID;
      door.id = newID;
      door.edge_id = idMap[door.edge_id];
      return door;
    });
    clonedStory.windows = clonedStory.windows.map((window) => {
      const newID = idFactory.generate();
      idMap[window.id] = newID;
      window.id = newID;
      window.edge_id = idMap[window.edge_id];
      return window;
    });
    clonedStory.spaces = clonedStory.spaces.map((space) => {
      const newID = idFactory.generate();
      idMap[space.id] = newID;
      space.id = newID;
      space.handle = null;
      space.name = '';
      space.face_id = idMap[space.face_id];
      space.daylighting_controls = space.daylighting_controls.map((daylighting_control) => {
        const newID = idFactory.generate();
        idMap[daylighting_control.id] = newID;
        daylighting_control.id = newID;
        daylighting_control.name = '';
        daylighting_control.vertex_id = idMap[daylighting_control.vertex_id];
        return daylighting_control;
      });
      return space;
    });
    clonedStory.shading = clonedStory.shading.map((shade) => {
      const newID = idFactory.generate();
      idMap[shade.id] = newID;
      shade.id = newID;
      shade.name = '';
      shade.face_id = idMap[shade.face_id];
      return shade;
    });
    return { clonedStory };
  },

  replaceSpaceNamesForCloning(state, type, story) {
    story.spaces = story.spaces.map((space) => {
      space.name = this.generateName(state, type, story);
      return space;
    });
  },
};
export default helpers;
