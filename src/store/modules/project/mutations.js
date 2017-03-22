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
    },

    setFov (state, payload) {
        if ('fov' in payload) {
            state.view.fov = payload.fov;
        }
    },
    setZoom (state, payload) {
        if ('zoom' in payload) {
            state.view.zoom = payload.zoom;
        }
    },
    setFilmOffset (state, payload) {
        if ('filmOffset' in payload) {
            state.view.filmOffset = payload.filmOffset;
        }
    },

    // MAP
    setMapVisible (state, payload) {
        if ('visible' in payload) {
            state.map.visible = payload.visible;
        }
    },

    setMapLatitude (state, payload) {
        if ('latitude' in payload) {
            state.map.latitude = payload.latitude;
        }
    },

    setMapLongitude (state, payload) {
        if ('longitude' in payload) {
            state.map.longitude = payload.longitude;
        }
    },
    setMapZoom (state, payload) {
        if ('zoom' in payload) {
            state.map.zoom = payload.zoom;
        }
    },

    // import project data
    importData (state, payload) {
        state.config = payload.config;
        state.grid = payload.grid;
        state.view = payload.view;
        state.map = payload.map;

    }
}
