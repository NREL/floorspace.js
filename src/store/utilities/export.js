export default function exportData (state, getters) {

    var exportObject = {
        application: state.application,
        project: state.project,
        stories: state.models.stories,
        images: state.models.images,
        ...state.models.library
    };
    const geometrySets = getters['geometry/exportData']
    exportObject = JSON.parse(JSON.stringify(exportObject));
    exportObject.stories.forEach((story) => {
        story.geometry = geometrySets.find((geometry) => { return geometry.id === story.geometry_id; });
        delete story.geometry_id;
    });
    formatObject(exportObject);
    return exportObject;
}

function formatObject(obj) {
    for (var key in obj) {
        // coerce all numeric ids to strings
        if ((key === "id" || ~key.indexOf("_id")) && typeof obj[key] === "number") {
            obj[key] = String(obj[key]);
        }
        if (~key.indexOf("_ids") && typeof obj[key] === "object") {
            obj[key] = obj[key].map(id => String(id));
        }
        // recurse
        if (obj[key] !== null && typeof obj[key] === "object") {
            formatObject(obj[key]);
        }
    }
}
