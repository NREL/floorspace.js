import helpers from './helpers'

export default {
    BuildingUnit: function() {
        return {
            id: helpers.generateId(),
            handle: null,
            name: null
        }
    },
    ThermalZone: function() {
        return {
            id: helpers.generateId(),
            handle: null,
            name: null
        }
    },
    SpaceType: function() {
        return {
            id: helpers.generateId(),
            handle: null,
            name: null
        }
    },
    Construction: function() {
        return {
            id: helpers.generateId(),
            handle: null,
            name: null
        }
    },
    ConstructionSet: function() {
        return {
            id: helpers.generateId(),
            handle: null,
            name: null
        }
    },
    Window: function() {
        return {
            id: helpers.generateId(),
            handle: null,
            name: null
        }
    },
    DaylightingControl: function() {
        return {
            id: helpers.generateId(),
            handle: null,
            name: null
        }
    }
}
