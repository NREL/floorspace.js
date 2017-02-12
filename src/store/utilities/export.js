export default function exportData (state, getters) {
    const exportObject = {
        project: state.project,
        geometry: getters['geometry/exportData'],
        stories: state.models.stories,
        ...lib
    };

    return JSON.parse(JSON.stringify(exportObject));
}

const lib = {
    'images': [{
        'id': 0
    }],
    'building_units': [{
        'id': 0,
        'name': '',
        'face_id': ''
    }],
    'thermal_zones': [{
        'id': 0,
        'name': '',
        'face_id': ''
    }],
    'space_types': [{
        'id': 0,
        'name': '',
        'face_id': ''
    }],
    'constructions': [{
        'id': 0,
        'handle': '',
        'name': ''
    }],
    'construction_sets': [{
        'id': 0,
        'handle': '',
        'name': ''
    }],
    'windows': [{
        'id': 0,
        'name': ''
    }],
    'daylighting_controls': [{
        'id': 0,
        'name': ''
    }]
};
