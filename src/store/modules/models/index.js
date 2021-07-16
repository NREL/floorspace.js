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
                    id: 'secondarySchool',
                    name: 'Secondary School',
                },
                {
                    id: 'primarySchool',
                    name: 'Primary School',
                },
                {
                    id: 'smallOffice',
                    name: 'Small Office',
                },
                {
                    id: 'mediumOffice',
                    name: 'Medium Office',
                },
                {
                    id: 'largeOffice',
                    name: 'Large Office',
                },
                {
                    id: 'smallHotel',
                    name: 'Small Hotel',
                },
                {
                    id: 'largeHotel',
                    name: 'Large Hotel',
                },
                {
                    id: 'warehouse',
                    name: 'Warehouse',
                },
                {
                    id: 'retailStandalone',
                    name: 'Retail Standalone',
                },
                {
                    id: 'retailStripmall',
                    name: 'Retail Stripmall',
                },
                {
                    id: 'quickServiceRestaurant',
                    name: 'Quick Service Restaurant',
                },
                {
                    id: 'fullServiceRestaurant',
                    name: 'Full Service Restaurant',
                },
                {
                    id: 'midriseApartment',
                    name: 'Midrise Apartment',
                },
                {
                    id: 'highriseApartment',
                    name: 'Highrise Apartment',
                },
                {
                    id: 'hospital',
                    name: 'Hospital',
                },
                {
                    id: 'outpatient',
                    name: 'Outpatient',
                },
                {
                    id: 'superMarket',
                    name: 'Super Market',
                },
                {
                    id: 'laboratory',
                    name: 'Laboratory',
                },
                {
                    id: 'largeDataCenterLowITE',
                    name: 'Large Data Center Low ITE',
                },
                {
                    id: 'largeDataCenterHighITE',
                    name: 'Large Data Center High ITE',
                },
                {
                    id: 'smallDataCenterLowITE',
                    name: 'Small Data Center Low ITE',
                },
                {
                    id: 'smallDataCenterHighITE',
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
