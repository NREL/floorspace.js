import idFactory from './generateId'

const d3 = require('d3');

export default function importData (context, payload)  {
    // GEOMETRY
    const geometry = JSON.parse(JSON.stringify(payload.data.stories.map(s => s.geometry)));
    for (var i = 0; i < geometry.length; i++) {
        geometry[i].faces = geometry[i].faces.map((f) => {
            return {
                id: f.id,
                edgeRefs: f.edge_ids.map((edge_id, i) => {
                    return {
                        edge_id: edge_id,
                        reverse: !f.edge_order[i]
                    }
                })
            }
        });

        geometry[i].edges = geometry[i].edges.map((e) => {
            return {
                id: e.id,
                v1: e.vertex_ids[0],
                v2: e.vertex_ids[1]
            };
        });

        geometry[i].vertices = geometry[i].vertices.map((v) => {
            return {
                id: v.id,
                x: v.x,
                y: v.y,
                X: v.x,
                Y: v.y
            };
        });
    }


    // MODELS
    payload.data.stories.forEach((story) => {
        story.geometry_id = story.geometry.id;
        delete story.geometry;
    });

    // APPLICATION
    // update scales with new grid boundaries
    payload.data.application.scale.x = d3.scaleLinear()
        .domain([0, payload.clientWidth])
        .range([payload.data.project.view.min_x, payload.data.project.view.max_x])
    payload.data.application.scale.y = d3.scaleLinear()
        .domain([0, payload.clientHeight])
        .range([payload.data.project.view.min_y, payload.data.project.view.max_y])

    // set currentSelections so that references are pointed to objects in the store instead of deep copies
    const currentSelections = payload.data.application.currentSelections,
        currentStory = payload.data.stories.find(s => s.id === currentSelections.story.id)
    currentSelections.story = currentStory;
    currentSelections.space = currentSelections.space ? currentStory.spaces.find(s => s.id === currentSelections.space.id) : null;
    currentSelections.shading = currentSelections.shading ? currentStory.shading.find(s => s.id === currentSelections.shading.id) : null;

    currentSelections.building_unit = currentSelections.building_unit ? payload.data.library.building_units.find(b => b.id === currentSelections.building_unit.id) : null;
    currentSelections.thermal_zone = currentSelections.thermal_zone ? payload.data.library.thermal_zones.find(t => t.id === currentSelections.thermal_zone.id) : null;
    currentSelections.space_type = currentSelections.space_type ? payload.data.library.space_types.find(s => s.id === currentSelections.space_type.id) : null;

    var max_id = 0;
    (function loopOnObject (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                max_id = (key === 'id' && Number(obj[key]) > max_id) ? Number(obj[key]) : max_id;
                if (obj[key] !== null && typeof obj[key] === 'object') {
                    loopOnObject(obj[key]);
                }
            }
        }
    })(payload);

    console.log(max_id);

    idFactory.setId(max_id);
    context.commit('importState', {
        project: payload.data.project,
        application: payload.data.application,
        models: {
            stories: payload.data.stories,
            images: payload.data.images,
            library: {
                building_units: payload.data.building_units,
                thermal_zones: payload.data.thermal_zones,
                space_types: payload.data.space_types,
                construction_sets: payload.data.construction_sets,
                constructions: payload.data.constructions,
                windows: payload.data.windows,
                daylighting_controls: payload.data.daylighting_controls
            }
        },
        geometry: geometry
    });


}
