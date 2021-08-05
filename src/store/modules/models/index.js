import actions from './actions'
import mutations from './mutations'
import getters from './getters'

export default {
    namespaced: true,
    state: {
        stories: [/*{
            id: null,
            handle: null,
            name: null,
            geometry_id: null,
            below_floor_plenum_height: 0,
            above_floor_plenum_height: 0,
            floor_to_ceiling_height: 0,
            multiplier: 0,
            spaces: [{
                id: null,
                name: null,
                handle: null,
                face_id: null,
                daylighting_controls: [{
                    daylighting_control_id: null,
                    vertex_id: null
                }],
                building_unit_id: null,
                thermal_zone_id: null,
                space_type_id: null,
                construction_set_id: null
            }],
            shading: [{
                name: null,
                face_id: null
            }],
            images: [{
                id: null,
                src: null,
                name: null,
                visible: false,
                // coordinates and dimensions stored in RWU
                height: 0,
                width: 0,
                x: 0,
                y: 0,
                z: 0,
                opacity: 0
            }],
            windows: [{
                window_id: null,
                vertex_id: null
            }]
        }*/],
        // lib
        library: {
            building_units: [],
            thermal_zones: [],
            space_types: [],
            building_types: [
                {
                    id: 'SecondarySchool',
                    name: 'Secondary School',
                },
                {
                    id: 'PrimarySchool',
                    name: 'Primary School',
                },
                {
                    id: 'SmallOffice',
                    name: 'Small Office',
                },
                {
                    id: 'MediumOffice',
                    name: 'Medium Office',
                },
                {
                    id: 'LargeOffice',
                    name: 'Large Office',
                },
                {
                    id: 'SmallHotel',
                    name: 'Small Hotel',
                },
                {
                    id: 'LargeHotel',
                    name: 'Large Hotel',
                },
                {
                    id: 'Warehouse',
                    name: 'Warehouse',
                },
                {
                    id: 'RetailStandalone',
                    name: 'Retail Standalone',
                },
                {
                    id: 'RetailStripmall',
                    name: 'Retail Stripmall',
                },
                {
                    id: 'QuickServiceRestaurant',
                    name: 'Quick Service Restaurant',
                },
                {
                    id: 'FullServiceRestaurant',
                    name: 'Full Service Restaurant',
                },
                {
                    id: 'MidriseApartment',
                    name: 'Midrise Apartment',
                },
                {
                    id: 'HighriseApartment',
                    name: 'Highrise Apartment',
                },
                {
                    id: 'Hospital',
                    name: 'Hospital',
                },
                {
                    id: 'Outpatient',
                    name: 'Outpatient',
                },
                {
                    id: 'SuperMarket',
                    name: 'Super Market',
                },
                {
                    id: 'Laboratory',
                    name: 'Laboratory',
                },
                {
                    id: 'LargeDataCenterLowITE',
                    name: 'Large Data Center Low ITE',
                },
                {
                    id: 'LargeDataCenterHighITE',
                    name: 'Large Data Center High ITE',
                },
                {
                    id: 'SmallDataCenterLowITE',
                    name: 'Small Data Center Low ITE',
                },
                {
                    id: 'SmallDataCenterHighITE',
                    name: 'Small Data Center High ITE',
                },
            ],
            construction_sets: [],
            window_definitions: [],
            daylighting_control_definitions: [],
            pitched_roofs: [],
            door_definitions: [],
        }
    },
    actions: actions,
    mutations: mutations,
    getters: getters
}
