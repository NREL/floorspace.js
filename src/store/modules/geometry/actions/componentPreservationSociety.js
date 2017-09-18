import geometryHelpers from './../helpers';
import { snapWindowToEdge, snapToVertexWithinFace, windowLocation } from '../../../../components/Grid/snapping';

export function componentsOnFace(state, geometry_id, face_id) {
  const
    geom = geometryHelpers.denormalize(_.find(state.geometry, { id: geometry_id })),
    face = _.find(geom.faces, { id: face_id }),
    story = _.find(state.models.stories, { geometry_id }),
    space = _.find(story.spaces, { face_id });

  if (!face) {
    // brand new face, no components possible
    return { face_id: null, geometry_id: null, story_id: null, windows: [], daylighting_controls: [] };
  }

  const retval = {
    story_id: story.id,
    windows: story.windows.filter(
      w => _.includes(_.map(face.edges, 'edge_id'), w.edge_id),
    ).map(w => ({
      ...w,
      originalLoc: windowLocation(_.find(face.edges, { edge_id: w.edge_id }), w),
    })),
    daylighting_controls: space.daylighting_controls
    .map(d => ({ ...d, vertex: _.find(geom.vertices, { id: d.vertex_id }) })),
    face_id,
    geometry_id,
  };
  return retval;
}

export function replaceComponents(
  context,
  { windows, daylighting_controls, story_id, face_id, geometry_id },
  { dx, dy } = { dx: 0, dy: 0 },
) {
  if (!face_id || !geometry_id) {
    // brand new face, no components possible
    return;
  }
  const
    geometry = geometryHelpers.denormalize(_.find(context.rootState.geometry, { id: geometry_id })),
    face = _.find(geometry.faces, { id: face_id }),
    spacing = context.rootState.project.grid.spacing;

  context.dispatch('models/destroyAllComponents', { face_id, story_id }, { root: true });

  windows.forEach((w) => {
    const
      newLoc = { x: w.originalLoc.x + dx, y: w.originalLoc.y + dy },
      loc = snapWindowToEdge(face.edges, newLoc, 1, spacing);
    if (!loc) { return; }

    context.dispatch('models/createWindow', {
      story_id,
      edge_id: loc.edge_id,
      alpha: loc.alpha,
      window_defn_id: w.window_defn_id,
    }, { root: true });
  });

  daylighting_controls.forEach((d) => {
    const
      newLoc = { x: d.vertex.x + dx, y: d.vertex.y + dy },
      loc = snapToVertexWithinFace([face], newLoc, spacing);
    if (!loc) { return; }

    context.dispatch('models/createDaylightingControl', {
      daylighting_control_defn_id: d.daylighting_control_defn_id,
      x: loc.x,
      y: loc.y,
      story_id,
      face_id,
    }, { root: true });
  });
}
