export default (function colorFactory () {
    const palette = [
        '#002626',
        '#007373',
        '#000000',
        '#004749',
        '#009196',
        '#8BC600',
        '#b9ff14',
        '#001516',
        '#557a00',
        '#E54C00',
        '#ff7633',
        '#993300',
        '#EF9300',
        '#ffb43d',
        '#a36400'
    ];

    var typeIndices = {
        story: 0,
        space: 0,
        shading: 0,
        building_unit: 0,
        thermal_zone: 0,
        space_type: 0
    };
    return (type) => {
        typeIndices[type]++;
        return palette[palette.length % typeIndices[type]]
    }
})();
