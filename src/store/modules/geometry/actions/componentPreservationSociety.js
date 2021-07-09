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
    doors: story.doors
      .map((d) => {
        const
          edge = _.find(geom.edges, { id: d.edge_id }),
          faces = facesContainingEdge(geom.faces, d.edge_id);
        return {
          ...d,
          originalLoc: windowLocation(edge, d),
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
    { geometry_id, story_id, windows, doors, perFaceComponents } = components,
    geometry = geometryHelpers.denormalize(_.find(context.rootState.geometry, { id: geometry_id })),
    story = _.find(context.rootState.models.stories, { id: story_id }),
    spaceFaces = geometry.faces.filter(f => _.find(story.spaces, { face_id: f.id })),
    spacing = context.rootState.project.grid.spacing;

  context.dispatch('models/destroyAllComponents', { story_id }, { root: true });

  const edgesPresentOnFaces = _.flatMap(spaceFaces, 'edges');
  /**
   * Replaces all windows or doors.  Batches everything together.
   * This is probably intended to verify that all windows and doors are in a good state after modifying the edges
   *
   * @param {*} arr Array of windows or doors to be replaced
   * @param {'Window' | 'Door'} windowOrDoor 
   */
  const replaceWindowOrDoor = (arr, windowOrDoor) => {
    const windowsOrDoors = [];
    arr.forEach((w) => {
      const
        { dx, dy } = movementsByFaceId[w.originalFaceIds[0]] || { dx: 0, dy: 0 },
        newLoc = { x: w.originalLoc.x + dx, y: w.originalLoc.y + dy },
        loc = snapWindowToEdge(/* snapMode */ 'nonstrict', edgesPresentOnFaces, newLoc, { width: 1 }, spacing / 4);
      if (!loc) { return; }

      const facesWithEdge = _.map(facesContainingEdge(spaceFaces, loc.edge_id), 'id');
      if (w.originalFaceIds.length !== facesWithEdge.length ||
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

      windowsOrDoors.push({
        story_id,
        edge_id: loc.edge_id,
        alpha: loc.alpha,
        [`${windowOrDoor.toLowerCase()}_definition_id`]: w.window_definition_id || w.door_definition_id,
      });
    });

    context.dispatch(`models/create${windowOrDoor}s`, windowsOrDoors, { root: true });
  };
  
  replaceWindowOrDoor(windows, 'Window');
  replaceWindowOrDoor(doors, 'Door');

  perFaceComponents.forEach(({ face_id, daylighting_controls }) => {
    daylighting_controls.forEach((d) => {
      const
        { dx, dy } = movementsByFaceId[face_id] || { dx: 0, dy: 0 },
        newLoc = { x: d.vertex.x + dx, y: d.vertex.y + dy },
        loc = snapToVertexWithinFace(/* snapMode */ 'nonstrict', spaceFaces, newLoc, spacing / 4);
      if (!loc) { return; }

      context.dispatch('models/createDaylightingControl', {
        daylighting_control_definition_id: d.daylighting_control_definition_id,
        x: loc.x,
        y: loc.y,
        story_id,
        face_id: loc.face_id,
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
