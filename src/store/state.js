export default {
    'config': {
        'language': null,
        'scale': null,
        'units': null
    },
    'settings': {
        'scale': null,
        'drawingMode': null,
        'tool': null,
        'selectedStory': null,
        'selectedThermalZone': null,
        'selectedSpace': null
    },
    'structures': {
        'stories': [{
            'name': null,
            'id': null,
            'thermalZoneIds': [],
            'spaceIds': [],
            'geometry': {
                'surfaces': []
            }
        }],
        'thermalZones': [{
            'name': null,
            'id': null,
            'spaceIds': [],
            'geometry': {
                'surfaces': []
            }
        }],
        'spaces': [{
            'name': null,
            'id': null,
            'surfaceIds': [],
            'geometry': {
                'surfaces': []
            }
        }],
        'surfaces': [{
            'id': null,
            'p1': null,
            'p2': null
        }],
        'points': [{
            'id': null,
            'x': null,
            'y': null
        }]
    }
}
