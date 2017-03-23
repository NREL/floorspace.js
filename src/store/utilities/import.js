const d3 = require('d3');

export default function importData (context, payload)  {
    // format the geometry
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


    // format models.stories
    payload.data.stories.forEach((story) => {
        story.geometry_id = story.geometry.id;
        delete story.geometry;
    });

    // update scales with new grid boundaries
    payload.data.application.scale.x = d3.scaleLinear()
        .domain([0, payload.clientWidth])
        .range([payload.data.project.view.min_x, payload.data.project.view.max_x])
    payload.data.application.scale.y = d3.scaleLinear()
        .domain([0, payload.clientHeight])
        .range([payload.data.project.view.min_y, payload.data.project.view.max_y])

    context.commit('importState', {
        project: payload.data.project,
        application: payload.data.application,
        models: {
            stories: payload.data.stories,
            images: payload.data.images,
            library: payload.data.library
        },
        geometry: geometry
    });
}
