import factory from './factory.js'
const helpers = {
    /*
    * each library object type has
    * displayName - for use in the type dropdown
    * init - method to initialize a new object of the parent type (story and space do not have init functions and will be omitted from the CreateO)
    * keymap - contains displayName and accessor for each property on objects of parent type
    *
    */
    map: {
        building_units: {
            displayName: 'Building Unit',
            keymap: {
                id: {
                    displayName: 'ID'
                },
                name: {
                    displayName: 'Name'
                }
            },
            init: factory.BuildingUnit
        },
        thermal_zones: {
            displayName: 'Thermal Zone',
            keymap: {
                id: {
                    displayName: 'ID'
                },
                name: {
                    displayName: 'Name'
                }
            },
            init: factory.ThermalZone
        },
        space_types: {
            displayName: 'Space Type',
            keymap: {
                id: {
                    displayName: 'ID'
                },
                name: {
                    displayName: 'Name'
                }
            },
            init: factory.SpaceType
        },
        construction_sets: {
            displayName: 'Construction Set',
            keymap: {
                id: {
                    displayName: 'ID'
                },
                name: {
                    displayName: 'Name'
                }
            },
            init: factory.ConstructionSet
        },
        constructions: {
            displayName: 'Construction',
            keymap: {
                id: {
                    displayName: 'ID'
                },
                name: {
                    displayName: 'Name'
                }
            },
            init: factory.Construction
        },
        windows: {
            displayName: 'Window',
            keymap: {
                id: {
                    displayName: 'ID'
                },
                name: {
                    displayName: 'Name'
                }
            },
            init: factory.Window
        },
        daylighting_controls: {
            displayName: 'Daylighting Control',
            keymap: {
                id: {
                    displayName: 'ID'
                },
                name: {
                    displayName: 'Name'
                }
            },
            init: factory.DaylightingControl
        },
        stories: {
            displayName: 'Story',
            keymap: {
                id: {
                    displayName: 'ID'
                },
                name: {
                    displayName: 'Name'
                },
                below_floor_plenum_height: {
                    displayName: 'Below Floor Plenum Height'
                },
                floor_to_ceiling_height: {
                    displayName: 'Floor To Ceiling Height'
                },
                multiplier: {
                    displayName: 'Multiplier'
                },
                spaces: {
                    displayName: 'Spaces',
                    get (story, state) {
                        return story.spaces.map(s => s.name);
                    },
                    set () {

                    }
                },
                windows: {
                    displayName: 'Windows',
                    get (story, state) {
                        return story.windows.map(s => w.name);
                    },
                    set () {

                    }
                },
                shading: {
                    displayName: 'Shading',
                    get (story, state) {
                        return story.shading.map(s => s.name);
                    }
                },
                image_id: {
                    displayName: 'Image',
                    get (story, state) {
                        return story.shading.map(s => s.name);
                    }
                }
            }
        },
        spaces: {
            displayName: 'Space',
            keymap: {
                id: {
                    displayName: 'ID'
                },
                name: {
                    displayName: 'Name'
                },
                building_unit_id: {
                    displayName: 'Building Unit',
                    get (space, state) {
                        return state.library.building_units.find(b => b.id === space.building_unit_id);
                    }
                },
                thermal_zone_id: {
                    displayName: 'Thermal Zone',
                    get (space, state) {
                        return state.library.thermal_zones.find(b => b.id === space.thermal_zone_id);
                    }
                },
                space_type_id: {
                    displayName: 'Space Type',
                    get (space, state) {
                        return state.library.space_types.find(s => s.id === space.space_type_id);
                    }
                },
                construction_set_id: {
                    displayName: 'Construction Set',
                    get (space, state) {
                        return state.library.construction_sets.find(c => c.id === space.construction_set_id);
                    }
                }
            }
        }
    }
};
export default helpers;
