// spaces, thermal zones, and stories each have a geometry object
// geometry is assumed to be a polygon with an arbitrary number of surfaces
function geometry() {
    return {
        'surfaces': []
    };
}

// each surface is just two points, different geometry definitions can share references to the same surfaces
function surface(p1, p2) {
    return {
        'id': null,
        'p1': p1,
        'p2': p2
    };
}

// points are stored in userspace units, scaling information is stored in the app config
function point(x=0, y=0) {
    return {
        'id': null,
        'x': x,
        'y': y
    };
}
