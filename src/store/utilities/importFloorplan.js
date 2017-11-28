import _ from 'lodash';
import idFactory from './generateId';
import factory from '../modules/models/factory';

function maybeUpdateProject(project) {
  // backwards compatibility changes:
  // 1. project.config.north_axis is now at project.north_axis
  if (project.config.north_axis) {
    // don't overwrite current key, if it's set
    project.north_axis = project.north_axis || project.config.north_axis;
    delete project.config.north_axis;
  }
  return project;
}

function withStoryDefaults(stories) {
  const
    story_defaults = factory.Story(),
    space_defaults = factory.Space();
  return stories.map((story) => {
    const multiplier = story.multiplier >= 1 ? story.multiplier : story_defaults.multiplier;

    return {
      ...story_defaults,
      ...story,
      spaces: story.spaces
        .map(space => ({
          ...space_defaults,
          ...space,
        })),
      multiplier,
    };
  });
}

export default function importFloorplan(context, payload) {
  // intialize a versionNumber if the app is running in embedded mode
  if (window.api) { window.versionNumber = 0; }

  // GEOMETRY
  const geometry = payload.data.stories.map((story) => {
    const faces = story.geometry.faces.map((face) => {
      const edgeRefs = face.edge_ids.map((id, index) => ({
        edge_id: id,
        reverse: !face.edge_order[index],
      }));
      return {
        id: face.id,
        edgeRefs,
      };
    });

    const edges = story.geometry.edges.map(e => ({
      id: e.id,
      v1: e.vertex_ids[0],
      v2: e.vertex_ids[1],
    }));
    return {
      id: story.geometry.id,
      faces,
      edges,
      vertices: story.geometry.vertices,
    };
  });

  // MODELS
  const stories = payload.data.stories.map((s) => {
    const story = {
      geometry_id: s.geometry.id,
      ...s,
    };
    delete story.geometry;
    return story;
  });

  function forEachNestedProp(obj, func, propName = null) {
    if (_.isObject(obj)) {
      Object.keys(obj).forEach(k => forEachNestedProp(obj[k], func, k));
    } else if (_.isArray(obj)) {
      obj.forEach(elem => forEachNestedProp(elem, func));
    } else {
      func(propName, obj);
    }
  }

  // find the highest id in the imported floorplan
  let largestId = 0;
  forEachNestedProp(payload, (k, v) => {
    if (k && k === 'id' && (+v > largestId)) {
      largestId = v;
    }
  });

  // set the idFactory to the next id
  largestId += 1;
  idFactory.setId(largestId);

  context.commit('importState', {
    project: maybeUpdateProject(payload.data.project),
    application: context.state.application,
    models: {
      stories: withStoryDefaults(stories),
      library: {
        building_units: payload.data.building_units,
        thermal_zones: payload.data.thermal_zones,
        space_types: payload.data.space_types,
        construction_sets: payload.data.construction_sets,
        window_definitions: payload.data.window_definitions || [],
        daylighting_control_definitions: payload.data.daylighting_control_definitions || [],
        pitched_roofs: payload.data.pitched_roofs || [],
      },
    },
    geometry,
  });
  _.defer(() => {
    context.dispatch(
      'application/setCurrentStoryId',
      { id: stories[0].id },
      { root: true });
    _.defer(() => window.eventBus.$emit('zoomToFit'));
  });

  document.getElementById('svg-grid').dispatchEvent(new Event('reloadGrid'));
}
