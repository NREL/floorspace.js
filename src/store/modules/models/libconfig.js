import factory from './factory.js'
import validators from './validators'

/*
* each library object type has
* displayName - for use in the type dropdown
* init - method to initialize a new object of the parent type (story and space do not have init functions and will be omitted from the CreateO)
* keymap - contains displayName and accessor for each property on objects of parent type
*/
const map = {
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
                input_type: 'text',
                private: false,
                validator: validators.name
            },
            color: {
                displayName: 'Color',
                readonly: false,
                input_type: 'color',
                private: false,
                validator: validators.color
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
                input_type: 'text',
                private: false,
                validator: validators.name
            },
            color: {
                displayName: 'Color',
                readonly: false,
                input_type: 'color',
                private: false,
                validator: validators.color
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
                input_type: 'text',
                private: false,
                validator: validators.name
            },
            color: {
                displayName: 'Color',
                readonly: false,
                input_type: 'color',
                private: false,
                validator: validators.color
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
                input_type: 'text',
                private: false,
                validator: validators.name
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
                input_type: 'text',
                private: false,
                validator: validators.name
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
                input_type: 'text',
                private: false,
                validator: validators.name
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
                input_type: 'text',
                private: false,
                validator: validators.name
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
                input_type: 'text',
                private: false,
                validator: validators.name
            },
            handle: {
                readonly: true,
                private: true
            },
            geometry_id: {
                readonly: true,
                private: true
            },
            below_floor_plenum_height: {
                displayName: 'Below Floor Plenum Height',
                readonly: false,
                input_type: 'text',
                private: false,
                validator: validators.number
            },
            floor_to_ceiling_height: {
                displayName: 'Floor To Ceiling Height',
                readonly: false,
                input_type: 'text',
                private: false,
                validator: validators.number
            },
            multiplier: {
                displayName: 'Multiplier',
                readonly: false,
                input_type: 'text',
                private: false,
                validator: validators.number
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
                    return story.windows.map(w => w.name).join(', ');
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
            images: {
                readonly: true,
                private: true
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
                input_type: 'text',
                private: false,
                validator: validators.name
            },
            handle: {
                readonly: true,
                private: true
            },
            face_id: {
                readonly: true,
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
                readonly: false,
                input_type: 'select',
                select_data (space, state) {
                    const options = {};
                    state.models.library.building_units.forEach( b => options[b.name] = b.id );
                    return options;
                },
                private: false,
                get (space, state) {
                    const buildingUnit = state.models.library.building_units.find(b => b.id === space.building_unit_id);
                    return buildingUnit ? buildingUnit.name : null;
                }
            },
            thermal_zone_id: {
                displayName: 'Thermal Zone',
                readonly: false,
                input_type: 'select',
                select_data (space, state) {
                    const options = {};
                    state.models.library.thermal_zones.forEach( t => options[t.name] = t.id );
                    return options;
                },
                private: false,
                get (space, state) {
                    const thermalZone = state.models.library.thermal_zones.find(b => b.id === space.thermal_zone_id);
                    return thermalZone ? thermalZone.name : null;
                }
            },
            space_type_id: {
                displayName: 'Space Type',
                readonly: false,
                input_type: 'select',
                select_data (space, state) {
                    const options = {};
                    state.models.library.space_types.forEach( s => options[s.name] = s.id );
                    return options;
                },
                private: false,
                get (space, state) {
                    const spaceType = state.models.library.space_types.find(s => s.id === space.space_type_id);
                    return spaceType ? spaceType.name : null;
                }
            },
            construction_set_id: {
                displayName: 'Construction Set',
                readonly: false,
                input_type: 'select',
                select_data (space, state) {
                    const options = {};
                    state.models.library.construction_sets.forEach( c => options[c.name] = c.id );
                    return options;
                },
                private: false,
                get (space, state) {
                    const constructionSet = state.models.library.construction_sets.find(c => c.id === space.construction_set_id);
                    return constructionSet ? constructionSet.name : null;
                }
            },
            color: {
                displayName: 'Color',
                readonly: false,
                input_type: 'color',
                private: false,
                validator: validators.color
            }
        }
    },
    shading: {
        displayName: 'Shading',
        keymap: {
            id: {
                displayName: 'ID',
                readonly: true,
                private: false
            },
            name: {
                displayName: 'Name',
                readonly: false,
                input_type: 'text',
                private: false,
                validator: validators.name
            },
            handle: {
                readonly: true,
                private: true
            },
            face_id: {
                readonly: true,
                private: true
            },
            color: {
                readonly: true,
                private: true
            }
        }
    },
    images: {
        displayName: 'Images',
        keymap: {
            id: {
                displayName: 'ID',
                readonly: true,
                private: false
            },
            name: {
                displayName: 'Name',
                readonly: false,
                input_type: 'text',
                private: false,
                validator: validators.name
            },
            height: {
                displayName: 'Height',
                readonly: false,
                input_type: 'text',
                private: false,
                validator: validators.number
            },
            x: {
                displayName: 'X Position',
                readonly: false,
                input_type: 'text',
                private: false,
                validator: validators.number
            },
            y: {
                displayName: 'Y Position',
                readonly: false,
                input_type: 'text',
                private: false,
                validator: validators.number
            },
            src: {
                readonly: true,
                private: true
            }
        }
    }
};

export default map;
