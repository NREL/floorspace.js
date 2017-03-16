import map from './appconfig.js'

const helpers = {
    /*
    * returns the displayName for a given mode
    */
    displayNameForMode (mode) {
        return map.modes[mode];
    },
    config: map

};
export default helpers;
