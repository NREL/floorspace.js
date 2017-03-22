export default function importData (context, payload)  {
    const geometry = payload.data.stories.map(s => s.geometry);
    context.commit('geometry/importData', { data: geometry });


    payload.data.stories.forEach((story) => {
        story.geometry_id = story.geometry.id;
        delete story.geometry;
    });
    context.commit('models/importData', { ...payload.data });

    // APPLICATION
    delete payload.data.application.scale;
    context.commit('application/importData', { ...payload.data.application });

    // PROJECT
    context.commit('project/importData', { ...payload.data.project });
}
