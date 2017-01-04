// building is the highest structure in the heirarchy
function building() {
    return {
        'id': null,
        'name': '',
        'geometry': {},
        'stories': []
    };
}

function story() {
    return {
        'id': null,
        'name': '',
        'geometry': {},
        'thermalZones': [],
        'spaces': []
    };
}

// spaces and thermalZones belong to stories
function space() {
    return {
        'id': null,
        'name': '',
        'geometry': {}
    }
}

function thermalZone() {
    return {
        'id': null,
        'name': '',
        'geometry': {}
    }
}
