import factory from './../../factory/index.js'
export default {
    namespaced: true,
    state: {
        // project
        config: {
            units: 'ft',
            language: 'EN-US',
            north_axis: 0
        },
        grid: {
            visible: true,
            x_spacing: 50,
            y_spacing: 50
        },
        view: {
            min_x: 100,
            min_y: 100,
            max_x: 1000,
            max_y: 1000
        },
        map: {
            visible: false,
            latitude: null,
            longitude: null,
            elevation: 0
        }
    },
    mutations: {
        // CONFIG
        // state.config.units
        setConfigUnits: function(state, payload) {
            if (payload.units === 'm' || payload.units === 'ft') {
                state.config.units = payload.units;
            }
        },
        // state.config.language
        setConfigLanguage: function(state, payload) {
            if (payload.language === 'EN-US') {
                state.config.language = payload.language;
            }
        },
        // state.config.north_axis
        setConfigNorthAxis: function(state, payload) {
            state.config.north_axis = parseFloat(payload.north_axis) ? payload.north_axis : state.config.north_axis;
        },

        // GRID
        // state.grid.visible
        setGridVisible: function(state, payload) {
            state.grid.visible = !!payload.visible;
        },

        // state.grid.x_spacing
        setGridXSpacing: function(state, payload) {
            const xSpacing = parseFloat(payload.x_spacing),
                isInt = !isNaN(parseFloat(payload.x_spacing)), // check that the value is a number
                fitsView = xSpacing < state.view.max_x - state.view.min_x, // check that the proposed width of a grid square is smaller than the width of the full view
                exceedsMinimumScale = xSpacing > 1;// check that the proposed grid square width is larger that the system minimum

            state.grid.x_spacing = isInt && fitsView && exceedsMinimumScale ? xSpacing : state.grid.x_spacing;
        },
        // state.grid.y_spacing
        setGridYSpacing: function(state, payload) {
            const ySpacing = parseFloat(payload.y_spacing),
                isInt = !isNaN(parseFloat(payload.y_spacing)), // check that the value is a number
                fitsView = ySpacing < state.view.max_y - state.view.min_y, // check that the proposed width of a grid square is smaller than the width of the full view
                exceedsMinimumScale = ySpacing > 1;// check that the proposed grid square width is larger that the system minimum

            state.grid.y_spacing = isInt && fitsView && exceedsMinimumScale ? ySpacing : state.grid.y_spacing;
        },

        // VIEW
        // state.view.min_x
        setViewMinX: function(state, payload) {
            const minX = parseFloat(payload.min_x),
                isInt = !isNaN(parseFloat(payload.min_x)), // check that the value is a number
                lessThanMaxX = minX < state.view.max_x; // check that the proposed min x of of the view is smaller than the max x

            state.view.min_x = isInt && lessThanMaxX ? minX : state.view.min_x;
        },
        // state.view.min_y
        setViewMinY: function(state, payload) {
            const minY = parseFloat(payload.min_y),
                isInt = !isNaN(parseFloat(payload.min_y)), // check that the value is a number
                lessThanMaxY = minY < state.view.max_y; // check that the proposed min x of of the view is smaller than the max x

            state.view.min_y = isInt && lessThanMaxY ? minY : state.view.min_y;
        },
        // state.view.max_x
        setViewMaxX: function(state, payload) {
            state.view.max_x = payload.max_x > state.view.min_x ? payload.max_x : state.view.max_x;
        },
        // state.view.max_y
        setViewMaxY: function(state, payload) {
            state.view.max_y = payload.max_y > state.view.min_y ? payload.max_y : state.view.max_y;
        }

        // TODO: MAP
    },
    getters: {}
}
