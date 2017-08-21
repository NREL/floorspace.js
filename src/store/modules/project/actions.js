import Validator from './../../utilities/validator.js'

export default {
    // CONFIG
    setUnits (context, payload) {
        if (payload.units === 'm' || payload.units === 'ft') {
            context.commit('setUnits', payload);
        }
    },
    setLanguage (context, payload) {
        if (payload.language === 'EN-US') {
            context.commit('setLanguage', payload);
        }
    },
    setNorthAxis (context, payload) {
      const { north_axis } = payload;
      if (north_axis > 360 || north_axis < 0) { return; }
      context.commit('setConfigNorthAxis', { north_axis });
    },
    setMapVisible (context, payload) {
        if (typeof payload.visible === 'boolean') {
            context.commit('setMapVisible', payload);
        }
    },
    setMapEnabled(context, payload) {
        if (typeof payload.enabled === 'boolean') {
            context.commit('setMapEnabled', payload);
        }
    },
    setMapInitialized(context, payload) {
        if (typeof payload.initialized === 'boolean') {
            context.commit('setMapInitialized', payload);
        }
    },
    setGridVisible (context, payload) {
        if (typeof payload.visible === 'boolean') {
            context.commit('setGridVisible', payload);
        }
    },

    // state.grid.spacing
    setSpacing (context, payload) {
       context.commit('setSpacing', payload);
    },

    setViewMinX (context, payload) {
        context.commit('setViewMinX', payload);
    },
    setViewMinY (context, payload) {
        context.commit('setViewMinY', payload);
    },

    setViewMaxX (context, payload) {
        const validator = new Validator(payload);
        validator.validateInt('max_x');
        // check that the proposed max_x is greater than the min_x
        validator.validateMin('max_x', context.state.view.min_x);
        context.commit('setViewMaxX', validator.validatedPayload);
    },
    setViewMaxY (context, payload) {
        const validator = new Validator(payload);
        validator.validateInt('max_y');
        // check that the proposed max_y is greater than the min_y
        validator.validateMin('max_y', context.state.view.min_y);
        context.commit('setViewMaxY', validator.validatedPayload);
    },
    // setFov (context, payload) {
    //     context.commit('setFov', payload);
    // },
    setZoom (context, payload) {
        context.commit('setMapZoom', payload);
    },
    // setFilmOffset (context, payload) {
    //     context.commit('setFilmOffset', payload);
    // },

    setMapLatitude (context, payload) {
        const validator = new Validator(payload);
        validator.validateFloat('latitude');
        validator.validateMax('latitude', 180);
        validator.validateMin('latitude', -180);
        context.commit('setMapLatitude', validator.validatedPayload);
    },

    setMapLongitude (context, payload) {
        const validator = new Validator(payload);
        validator.validateFloat('longitude');
        validator.validateMax('longitude', 180);
        validator.validateMin('longitude', -180);
        context.commit('setMapLongitude', validator.validatedPayload);
    },

    setMapZoom (context, payload) {
        const validator = new Validator(payload);
        validator.validateFloat('zoom');
        context.commit('setMapZoom',  { zoom: payload.zoom });
    },


    setMapRotation (context, payload) {
        context.dispatch('setNorthAxis', { north_axis: (payload.rotation/(2*Math.PI)) * 360 });
        context.commit('setMapRotation', { rotation: payload.rotation });
    },


    setPreviousStoryVisible (context, payload) {
        context.commit('setPreviousStoryVisible', { visible: payload.visible });

    },

    setShowImportExport(context, payload) {
      context.commit('setShowImportExport', payload);
    },
}
