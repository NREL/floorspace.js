import factory from './factory/index'
import helpers from './factory/helpers'

export default function initializeDefaultState(state) {
    // initialize app with a story
    const storyId = helpers.generateId();
    const geometryId = helpers.generateId();

    state.application.currentSelections.story_id = storyId;

    state.geometry.push({
        'id': geometryId,
        'vertices': [],
        'edges': [],
        'faces': []
    });

    state.stories.push({
        'id': storyId,
        'handle': null,
        'name': 'Ground Level',
        'below_floor_plenum_height': 0,
        'floor_to_ceiling_height': 0,
        'multiplier': 0,
        'images': [],
        'geometry_id': geometryId,
        'spaces': [],
        'windows': []
    });
}
