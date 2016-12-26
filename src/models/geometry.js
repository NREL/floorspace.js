function rect(x=0, y=0, h=0, w=0) {
    return {
        origin: {
            x: x,
            y: y
        },
        size: {
            height: h,
            width: w
        }
    };
}
function polygon(points=[]) {
    return {
        points:[]
    };
}
function point(x=0, y=0) {
    return {
        x: x,
        y: y
    };
}
