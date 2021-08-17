import _ from 'lodash';
import idFactory from './generateId';
import exportData from './export';
import importFloorplan from './importFloorplan';

export default function mergeFloorplans(context, payload) {
  // PREP CURRENT FLOORPLAN FOR MERGE
  const currentFloorplan = exportData(context.state, context.getters);
  console.log('current floorplan: ', currentFloorplan);

  // STORIES
  currentFloorplan.stories = currentFloorplan.stories.map((story) => {
    const faces = story.geometry.faces.map((face) => {
      const edge_ids = face.edge_ids.map(id => `l${id}`);
      return {
        ...face,
        id: `l${face.id}`,
        edge_ids,
      };
    });

    const edges = story.geometry.edges.map((edge) => {
      const face_ids = edge.face_ids.map(id => `l${id}`);
      const vertex_ids = edge.vertex_ids.map(id => `l${id}`);
      return {
        face_ids,
        id: `l${edge.id}`,
        vertex_ids,
      };
    });

    const vertices = story.geometry.vertices.map((vertex) => {
      const edge_ids = vertex.edge_ids.map(id => `l${id}`);
      return {
        ...vertex,
        edge_ids,
        id: `l${vertex.id}`,
      };
    });

    const geometry = {
      id: `l${story.geometry.id}`,
      faces,
      edges,
      vertices,
    };

    const spaces = story.spaces.map(space => ({
      ...space,
      id: `l${space.id}`,
      face_id: `l${space.face_id}`,
    }));

    const windows = story.windows.map(window => ({
      ...window,
      edge_id: `l${window.edge_id}`,
      id: `l${window.id}`,
      window_definition_id: `l${window.window_definition_id}`,
    }));

    return {
      ...story,
      id: `l${story.id}`,
      geometry,
      spaces,
      windows,
    };
  });

  // CURRENT WINDOW DEFS
  currentFloorplan.window_definitions = currentFloorplan.window_definitions.map(window_def => ({
    ...window_def,
    id: `l${window_def.id}`,
  }));

  // PREP IMPORTED FLOORPLAN FOR MERGE
  console.log('payload data: ', payload.data);
  payload.data.stories = payload.data.stories.map((story) => {
    const faces = story.geometry.faces.map((face) => {
      const edge_ids = face.edge_ids.map(id => `r${id}`);
      return {
        ...face,
        id: `r${face.id}`,
        edge_ids,
      };
    });

    const edges = story.geometry.edges.map((edge) => {
      const face_ids = edge.face_ids.map(id => `r${id}`);
      const vertex_ids = edge.vertex_ids.map(id => `r${id}`);
      return {
        face_ids,
        id: `r${edge.id}`,
        vertex_ids,
      };
    });

    const vertices = story.geometry.vertices.map((vertex) => {
      const edge_ids = vertex.edge_ids.map(id => `r${id}`);
      return {
        ...vertex,
        edge_ids,
        id: `r${vertex.id}`,
      };
    });

    const geometry = {
      id: `r${story.geometry.id}`,
      faces,
      edges,
      vertices,
    };

    const spaces = story.spaces.map(space => ({
      ...space,
      id: `r${space.id}`,
      face_id: `r${space.face_id}`,
    }));

    const windows = story.windows.map(window => ({
      ...window,
      edge_id: `r${window.edge_id}`,
      id: `r${window.id}`,
      window_definition_id: `r${window.window_definition_id}`,
    }));

    return {
      ...story,
      id: `r${story.id}`,
      geometry,
      spaces,
      windows,
    };
  });

  // INCOMING WINDOW DEFS
  payload.data.window_definitions = payload.data.window_definitions.map(window_def => ({
    ...window_def,
    id: `r${window_def.id}`,
  }));

  // MERGE FLOORPLANS PROPERTIES
  const zipUpStories = _.zip(payload.data.stories, currentFloorplan.stories);
  const zipUpWindowDefs = _.zip(payload.data.window_definitions, currentFloorplan.window_definitions).filter(x => x !== undefined);
  const mergeStories = zipUpStories.map((pairOfStories) => {
    if (!pairOfStories[0]) {
      return pairOfStories[1];
    }
    if (!pairOfStories[1]) {
      return pairOfStories[0];
    }
    return {
      ...pairOfStories[0],
      geometry: {
        id: pairOfStories[0].id,
        edges: [...pairOfStories[0].geometry.edges, ...pairOfStories[1].geometry.edges],
        faces: [...pairOfStories[0].geometry.faces, ...pairOfStories[1].geometry.faces],
        vertices: [...pairOfStories[0].geometry.vertices, ...pairOfStories[1].geometry.vertices],
      },
      spaces: [...pairOfStories[0].spaces, ...pairOfStories[1].spaces],
      windows: [...pairOfStories[0].windows, ...pairOfStories[1].windows],
    };
  });
  const mergeWindowDefs = zipUpWindowDefs.map((pairOfWindowDefs) => {
    if (!pairOfWindowDefs[0]) {
      return pairOfWindowDefs[1];
    }
    if (!pairOfWindowDefs[1]) {
      return pairOfWindowDefs[0];
    }
    return [...pairOfWindowDefs[0].window_definitions, ...pairOfWindowDefs[1].window_definitions];
  });

  const mergedResult = {
    data: {
      ...payload.data,
      stories: mergeStories,
      window_definitions: mergeWindowDefs,
    },
  };

  console.log('before importing the mergedResult: ', mergedResult);

  // IMPORT MERGED FLOORPLAN
  importFloorplan(context, mergedResult);
}
