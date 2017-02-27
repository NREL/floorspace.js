import actions from './actions'
import mutations from './mutations'

export default {
    namespaced: true,
    state: {
        stories: [/*{
            id: null,
            handle: null,
            name: null,
            geometry_id: null,
            below_floor_plenum_height: 0,
            floor_to_ceiling_height: 0,
            multiplier: 0,
            imageVisible: false,
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
            windows: [{
                window_id: null,
                vertex_id: null
            }],
            shading: [{
                name: null,
                face_id: null
            }],
            image_id: null
        }*/],
        images: [],
        // lib
        library: {
            'building_units': [{
                id: '103',
                name: 'Building Unit 1'
            }, {
                id: '104',
                name: 'Building Unit 2'
            }, {
                id: '105',
                name: 'Building Unit 3'
            }],
            'thermal_zones': [{
                id: '106',
                name: 'Thermal Zone 1'
            }, {
                id: '107',
                name: 'Thermal Zone 2'
            }, {
                id: '108',
                name: 'Thermal Zone 3'
            }],
            'space_types': [{
                id: '109',
                name: 'Space Type 1'
            }, {
                id: '1010',
                name: 'Space Type 2'
            }, {
                id: '1011',
                name: 'Space Type 3'
            }, {
                id: '1012',
                name: 'Space Type 4'
            }],
            'construction_sets': [{
                id: '1013',
                name: 'Construction Set 1'
            }, {
                id: '1014',
                name: 'Construction Set 2'
            }],
            'constructions': [{
                id: '1015',
                name: 'Construction 1'
            }],
            'windows': [{
                id: '1016',
                name: 'Window 1'
            }, {
                id: '1017',
                name: 'Window 2'
            }, {
                id: '1021',
                name: 'Window 3'
            }],
            'daylighting_controls': [{
                id: '1018',
                name: 'Daylighting Control 1'
            }, {
                id: '1019',
                name: 'Daylighting Control 2'
            }, {
                id: '1020',
                name: 'Daylighting Control 3'
            }]


            // building_units: [],
            // thermal_zones: [],
            // space_types: [],
            // construction_sets: [],
            // constructions: [],
            // windows: [],
            // daylighting_controls: []
        }
    },
    actions: actions,
    mutations: mutations,
    getters: {}
}
