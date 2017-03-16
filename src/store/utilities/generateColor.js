import appconfig from './../modules/application/appconfig.js'

export default (function colorFactory () {
    var typeIndices = {
        space: 0,
        building_unit: 0,
        thermal_zone: 0,
        space_type: 0
    };
    return (type) => {
        typeIndices[type]++;
        return appconfig.palette.colors[typeIndices[type] % appconfig.palette.colors.length]
    }
})();
