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

    return {
      ...story,
      id: `l${story.id}`,
      geometry,
      spaces,
    };
  });

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

    return {
      ...story,
      id: `r${story.id}`,
      geometry,
      spaces,
    };
  });

  // MERGE FLOORPLANS
  payload.data.stories = [...payload.data.stories, ...currentFloorplan.stories];

  // IMPORT MERGED FLOORPLAN
  importFloorplan(context, payload);
}
