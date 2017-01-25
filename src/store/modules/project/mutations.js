export default {
    // CONFIG
    setUnits (state, payload) {
        if ('units' in payload) {
            state.config.units = payload.units;
        }
    },
    setLanguage (state, payload) {
        if ('language' in payload) {
            state.config.language = payload.language;
        }
    },
    setConfigNorthAxis (state, payload) {
        if ('north_axis' in payload) {
            state.config.north_axis = payload.north_axis;
        }
    },

    // GRID
    setGridVisible (state, payload) {
        if ('visible' in payload) {
            state.grid.visible = payload.visible;
        }
    },
    setGridXSpacing (state, payload) {
        if ('x_spacing' in payload) {
            state.grid.x_spacing = payload.x_spacing;
        }
    },
    setGridYSpacing (state, payload) {
        if ('y_spacing' in payload) {
            state.grid.y_spacing = payload.y_spacing;
        }
    },

    // VIEW
    setViewMinX (state, payload) {
        if ('min_x' in payload) {
            state.view.min_x = payload.min_x;
        }
    },
    setViewMinY (state, payload) {
        if ('min_y' in payload) {
            state.view.min_y = payload.min_y;
        }
    },
    setViewMaxX (state, payload) {
        if ('max_x' in payload) {
            state.view.max_x = payload.max_x;
        }
    },
    setViewMaxY (state, payload) {
        if ('max_y' in payload) {
            state.view.max_y = payload.max_y;
        }
    }
}
