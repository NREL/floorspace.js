import _ from 'lodash';
import geometryHelpers from './../helpers';
import { snapWindowToEdge, snapToVertexWithinFace, windowLocation } from '../../../../components/Grid/snapping';

function facesContainingEdge(faces, edge_id) {
  return _.filter(
    faces,
    f => _.chain(f.edges)
      .map('id')
      .includes(edge_id)
      .value());
}

function componentsOnStory(state, geometry_id) {
  const
    geom = geometryHelpers.denormalize(_.find(state.geometry, { id: geometry_id })),
    story = _.find(state.models.stories, { geometry_id });

  const perFaceComponents = story.spaces.map(space => ({
    daylighting_controls: space.daylighting_controls
      .map(d => ({ ...d, vertex: _.find(geom.vertices, { id: d.vertex_id }) })),
    space_id: space.id,
    face_id: space.face_id,
  }));
  return {
    geometry_id,
    story_id: story.id,
    windows: story.windows
      .map((w) => {
        const
          edge = _.find(geom.edges, { id: w.edge_id }),
          faces = facesContainingEdge(geom.faces, w.edge_id);
        return {
          ...w,
          originalLoc: windowLocation(edge, w),
          originalFaceIds: _.map(faces, 'id'),
        };
      }),
    perFaceComponents,
  };
}

function replaceComponents(
  context,
  components,
  movementsByFaceId = {},
) {
  const
    { geometry_id, story_id, windows, perFaceComponents } = components,
    geometry = geometryHelpers.denormalize(_.find(context.rootState.geometry, { id: geometry_id })),
    spacing = context.rootState.project.grid.spacing;

  context.dispatch('models/destroyAllComponents', { story_id }, { root: true });

  const edgesPresentOnFaces = _.flatMap(geometry.faces, 'edges');
  windows.forEach((w) => {
    const
      { dx, dy } = movementsByFaceId[w.originalFaceIds[0]] || { dx: 0, dy: 0 },
      newLoc = { x: w.originalLoc.x + dx, y: w.originalLoc.y + dy },
      loc = snapWindowToEdge(/* snapMode */ 'nonstrict', edgesPresentOnFaces, newLoc, 1, spacing),
      facesWithEdge = _.map(facesContainingEdge(geometry.faces, w.edge_id), 'id');
    if (!loc) { return; }
    if (_.intersection(facesWithEdge, w.originalFaceIds).length !== facesWithEdge.length ||
        (w.originalFaceIds.length > 1 && _.intersection(Object.keys(movementsByFaceId), w.originalFaceIds))) {
      // Suppose we add some windows to an edge that's shared between two spaces.
      // What happens when we move one of the spaces?
      // Should we just duplicate the windows?

      // dan's response:
      // Remove that window.
      // also, if you have a window on an exterior wall, then draw another space
      // so it becomes interior, id delete the window too.
      return;
    }

    context.dispatch('models/createWindow', {
      story_id,
      edge_id: loc.edge_id,
      alpha: loc.alpha,
      window_defn_id: w.window_defn_id,
    }, { root: true });
  });

  perFaceComponents.forEach(({ face_id, daylighting_controls }) => {
    const face = _.find(geometry.faces, { id: face_id });

    daylighting_controls.forEach((d) => {
      const
        { dx, dy } = movementsByFaceId[face_id] || { dx: 0, dy: 0 },
        newLoc = { x: d.vertex.x + dx, y: d.vertex.y + dy },
        loc = snapToVertexWithinFace(/* snapMode */ 'nonstrict', [face], newLoc, spacing);
      if (!loc) { return; }

      context.dispatch('models/createDaylightingControl', {
        daylighting_control_defn_id: d.daylighting_control_defn_id,
        x: loc.x,
        y: loc.y,
        story_id,
        face_id,
      }, { root: true });
    });
  });
}

export function withPreservedComponents(...args) {
  let context, geometry_id, action, movementsByFaceId;
  if (args.length === 3) {
    [context, geometry_id, action] = args;
    movementsByFaceId = {};
  } else if (args.length === 4) {
    [context, geometry_id, movementsByFaceId, action] = args;
  } else {
    throw new Error('usage: withPreservedComponents(context, geometry_id, action [,movementsByFaceId])');
  }

  const components = componentsOnStory(context.rootState, geometry_id);
  action();
  replaceComponents(context, components, movementsByFaceId);
}
