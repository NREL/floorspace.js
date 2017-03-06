import factory from './factory.js'
const helpers = {
    /*
    * returns the displayName for a given key on an object type
    * custom user defined attributes will not included in the keymap - the unchanged keyname will be returned
    */
    displayNameForKey (type, key) {
        if (this.map[type].keymap[key]) {
            // return the displayName or null if the key is private
            return this.map[type].keymap[key].private ? null : this.map[type].keymap[key].displayName;
        } else {
            // custom user defiend key
            return key;
        }
    },
    /*
    * returns the display value for a given key on an object type
    * if the keymap includes a get () method for the key, its return value will be used
    */
    displayValueForKey (object, state, type, key) {
        if (this.map[type].keymap[key] && this.map[type].keymap[key].get) {
            return this.map[type].keymap[key] && this.map[type].keymap[key].get(object, state);
        } else {
            return object[key];
        }
    },
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
                    displayName: 'ID',
                    readonly: true,
                    private: false
                },
                name: {
                    displayName: 'Name',
                    readonly: false,
                    private: false
                }
            },
            init: factory.BuildingUnit
        },
        thermal_zones: {
            displayName: 'Thermal Zone',
            keymap: {
                id: {
                    displayName: 'ID',
                    readonly: true,
                    private: false
                },
                name: {
                    displayName: 'Name',
                    readonly: false,
                    private: false
                }
            },
            init: factory.ThermalZone
        },
        space_types: {
            displayName: 'Space Type',
            keymap: {
                id: {
                    displayName: 'ID',
                    readonly: true,
                    private: false
                },
                name: {
                    displayName: 'Name',
                    readonly: false,
                    private: false
                }
            },
            init: factory.SpaceType
        },
        construction_sets: {
            displayName: 'Construction Set',
            keymap: {
                id: {
                    displayName: 'ID',
                    readonly: true,
                    private: false
                },
                name: {
                    displayName: 'Name',
                    readonly: false,
                    private: false
                }
            },
            init: factory.ConstructionSet
        },
        constructions: {
            displayName: 'Construction',
            keymap: {
                id: {
                    displayName: 'ID',
                    readonly: true,
                    private: false
                },
                name: {
                    displayName: 'Name',
                    readonly: false,
                    private: false
                }
            },
            init: factory.Construction
        },
        windows: {
            displayName: 'Window',
            keymap: {
                id: {
                    displayName: 'ID',
                    readonly: true,
                    private: false
                },
                name: {
                    displayName: 'Name',
                    readonly: false,
                    private: false
                }
            },
            init: factory.Window
        },
        daylighting_controls: {
            displayName: 'Daylighting Control',
            keymap: {
                id: {
                    displayName: 'ID',
                    readonly: true,
                    private: false
                },
                name: {
                    displayName: 'Name',
                    readonly: false,
                    private: false
                }
            },
            init: factory.DaylightingControl
        },
        stories: {
            displayName: 'Story',
            keymap: {
                id: {
                    displayName: 'ID',
                    readonly: true,
                    private: false
                },
                name: {
                    displayName: 'Name',
                    readonly: false,
                    private: false
                },
                handle: {
                    readonly: false,
                    private: true
                },
                geometry_id: {
                    readonly: false,
                    private: true
                },
                below_floor_plenum_height: {
                    displayName: 'Below Floor Plenum Height',
                    readonly: false,
                    private: false
                },
                floor_to_ceiling_height: {
                    displayName: 'Floor To Ceiling Height',
                    readonly: false,
                    private: false
                },
                multiplier: {
                    displayName: 'Multiplier',
                    readonly: false,
                    private: false
                },
                spaces: {
                    displayName: 'Spaces',
                    readonly: true,
                    private: false,
                    get (story, state) {
                        return story.spaces.map(s => s.name).join(', ');
                    }
                },
                windows: {
                    displayName: 'Windows',
                    readonly: true,
                    private: false,
                    get (story, state) {
                        return story.windows.map(s => w.name).join(', ');
                    },
                    set () {

                    }
                },
                shading: {
                    displayName: 'Shading',
                    readonly: true,
                    private: false,
                    get (story, state) {
                        return story.shading.map(s => s.name).join(', ');
                    }
                },
                image_id: {
                    displayName: 'Image',
                    readonly: true,
                    private: false,
                    get (story, state) {
                        return story.shading.map(s => s.name).join(', ');
                    }
                }
            }
        },
        spaces: {
            displayName: 'Space',
            keymap: {
                id: {
                    displayName: 'ID',
                    readonly: true,
                    private: false
                },
                name: {
                    displayName: 'Name',
                    readonly: false,
                    private: false
                },
                handle: {
                    readonly: false,
                    private: true
                },
                face_id: {
                    readonly: false,
                    private: true
                },
                daylighting_controls: {
                    displayName: 'Daylighting Controls',
                    readonly: true,
                    private: false,
                    get (space, state) {
                        return space.daylighting_controls.map(d => d.name).join(', ');
                    }
                },
                building_unit_id: {
                    displayName: 'Building Unit',
                    readonly: true,
                    private: false,
                    get (space, state) {
                        return state.models.library.building_units.find(b => b.id === space.building_unit_id);
                    }
                },
                thermal_zone_id: {
                    displayName: 'Thermal Zone',
                    readonly: true,
                    private: false,
                    get (space, state) {
                        return state.models.library.thermal_zones.find(b => b.id === space.thermal_zone_id);
                    }
                },
                space_type_id: {
                    displayName: 'Space Type',
                    readonly: true,
                    private: false,
                    get (space, state) {
                        return state.models.library.space_types.find(s => s.id === space.space_type_id);
                    }
                },
                construction_set_id: {
                    displayName: 'Construction Set',
                    readonly: true,
                    private: false,
                    get (space, state) {
                        return state.models.library.construction_sets.find(c => c.id === space.construction_set_id);
                    }
                }
            }
        }
    }
};
export default helpers;
