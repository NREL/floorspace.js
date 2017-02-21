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
        const validator = new Validator(payload);
        validator.validateFloat('north_axis');
        context.commit('setNorthAxis', validator.validatedPayload);
    },
    setMapVisible (context, payload) {
        if (typeof payload.visible === 'boolean') {
            context.commit('setMapVisible', payload);
        }
    },
    setGridVisible (context, payload) {
        if (typeof payload.visible === 'boolean') {
            context.commit('setGridVisible', payload);
        }
    },

    // state.grid.x_spacing
    setGridXSpacing (context, payload) {
        const validator = new Validator(payload);
        validator.validateInt('x_spacing');
        validator.validateMin('x_spacing', 0);
        // check that the proposed width of a grid square is smaller than the width of the full view and greater than 1 unit
        validator.validateMax('x_spacing', context.state.view.max_x - context.state.view.min_x);
        context.commit('setGridXSpacing', validator.validatedPayload);
    },
    // state.grid.y_spacing
    setGridYSpacing (context, payload) {
        const validator = new Validator(payload);
        validator.validateInt('y_spacing');
        validator.validateMin('y_spacing', 0);
        // check that the proposed height of a grid square is smaller than the height of the full view
        validator.validateMax('y_spacing', context.state.view.max_y - context.state.view.min_y);
        context.commit('setGridYSpacing', validator.validatedPayload);
    },

    setViewMinX (context, payload) {
        const validator = new Validator(payload);
        validator.validateInt('min_x');
        // check that the proposed min_x is smaller than the max_x
        validator.validateMax('min_x', context.state.view.max_x);
        context.commit('setViewMinX', validator.validatedPayload);
    },
    setViewMinY (context, payload) {
        const validator = new Validator(payload);
        validator.validateInt('min_y');
        // check that the proposed min_y is smaller than the max_y
        validator.validateMax('min_y', context.state.view.max_y);
        context.commit('setViewMinY', validator.validatedPayload);
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
        context.commit('setMapZoom', validator.validatedPayload);
    }
}
