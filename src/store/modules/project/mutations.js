export default {
    // CONFIG
  setUnits(state, payload) {
    if ('units' in payload) {
      state.config.units = payload.units;
    }
    if ('editable' in payload) {
      state.config.unitsEditable = payload.editable;
    }
  },
    setLanguage (state, payload) {
        if ('language' in payload) {
            state.config.language = payload.language;
        }
    },
    setConfigNorthAxis (state, payload) {
        if ('north_axis' in payload) {
            state.north_axis = payload.north_axis;
        }
    },

    // GRID
    setGridVisible (state, payload) {
		if ('visible' in payload) {
            state.grid.visible = payload.visible;
        }
    },
    setSpacing (state, payload) {
        state.grid.spacing = payload.spacing;
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
    setDimensions (state, payload) {
        state.view = Object.assign({}, state.view, payload);
    },

    // MAP
    setMapEnabled (state, payload) {
        if ('enabled' in payload) {
            state.map.enabled = payload.enabled;
        }
    },
    setMapInitialized (state, payload) {
        if ('initialized' in payload) {
            state.map.initialized = payload.initialized;
        }
    },
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

    setMapRotation (state, payload) {
        if ('rotation' in payload) {
            state.map.rotation = payload.rotation;
        }
    },

    setPreviousStoryVisible (state, payload) {
        if ('visible' in payload) {
            state.previous_story.visible = payload.visible;
        }
    },
  setShowImportExport(state, payload) {
    state.show_import_export = payload;
  },

  modifyGround(state, { key, value }) {
    state.ground[key] = value;
  },
};
