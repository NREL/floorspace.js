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
    actions: {
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
            const validator = new factory.Validator(payload);
            validator.validateFloat('north_axis');
            context.commit('setNorthAxis', validator.validatedPayload);
        },
        setGridVisible (context, payload) {
            if (typeof payload.visible === 'boolean') {
                context.commit('setGridVisible', payload);
            }
        },

        // state.grid.x_spacing
        setGridXSpacing (context, payload) {
            const validator = new factory.Validator(payload);
            validator.validateInt('x_spacing');
            validator.validateMin('x_spacing', 0);
            // check that the proposed width of a grid square is smaller than the width of the full view and greater than 1 unit
            validator.validateMax('x_spacing', context.state.view.max_x - context.state.view.min_x);
            context.commit('setGridXSpacing', validator.validatedPayload);
        },
        // state.grid.y_spacing
        setGridYSpacing (context, payload) {
            const validator = new factory.Validator(payload);
            validator.validateInt('y_spacing');
            validator.validateMin('y_spacing', 0);
            // check that the proposed height of a grid square is smaller than the height of the full view
            validator.validateMax('y_spacing', context.state.view.max_y - context.state.view.min_y);
            context.commit('setGridYSpacing', validator.validatedPayload);
        },

        setViewMinX (context, payload) {
            const validator = new factory.Validator(payload);
            validator.validateInt('min_x');
            // check that the proposed min_x is smaller than the max_x
            validator.validateMax('min_x', context.state.view.max_x);
            context.commit('setViewMinX', validator.validatedPayload);
        },
        setViewMinY (context, payload) {
            const validator = new factory.Validator(payload);
            validator.validateInt('min_y');
            // check that the proposed min_y is smaller than the max_y
            validator.validateMax('min_y', context.state.view.max_y);
            context.commit('setViewMinY', validator.validatedPayload);
        },

        setViewMaxX (context, payload) {
            const validator = new factory.Validator(payload);
            validator.validateInt('max_x');
            // check that the proposed max_x is greater than the min_x
            validator.validateMin('max_x', context.state.view.min_x);
            context.commit('setViewMaxX', validator.validatedPayload);
        },
        setViewMaxY (context, payload) {
            const validator = new factory.Validator(payload);
            validator.validateInt('max_y');
            // check that the proposed max_y is greater than the min_y
            validator.validateMin('max_y', context.state.view.min_y);
            context.commit('setViewMaxY', validator.validatedPayload);
        }
    },
    mutations: {
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
    },
    getters: {
        snapToleranceX (state, getters, rootState, rootGetters) {
            return Math.abs(state.view.max_x - state.view.min_x) * 0.05;
        },
        snapToleranceY (state, getters, rootState, rootGetters) {
            return Math.abs(state.view.max_y - state.view.min_y) * 0.05;
        }
    }
}
