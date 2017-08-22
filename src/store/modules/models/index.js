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
            }]
        }*/],
        // lib
        library: {
            building_units: [],
            thermal_zones: [],
            space_types: [],
            construction_sets: [],
            windows: [],
            daylighting_controls: []
        }
    },
    actions: actions,
    mutations: mutations,
    getters: getters
}
