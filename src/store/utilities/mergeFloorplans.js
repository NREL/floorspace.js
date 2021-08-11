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
      const edgeRefs = face.edge_ids.map((id, index) => ({
        edge_id: `l${id}`,
        reverse: !face.edge_order[index],
      }));
      return {
        id: `l${face.id}`,
        edgeRefs,
      };
    });

    const edges = story.geometry.edges.map(e => ({
      id: `l${e.id}`,
      v1: `l${e.vertex_ids[0]}`,
      v2: `l${e.vertex_ids[1]}`,
    }));

    const vertices = story.geometry.vertices.map((vertex) => {
      const edge_ids = vertex.edge_ids.map(id => `l${id}`);
      return {
        edge_ids,
        id: `l${vertex.id}`,
        x: vertex.x,
        y: vertex.y,
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
      const edgeRefs = face.edge_ids.map((id, index) => ({
        edge_id: `r${id}`,
        reverse: !face.edge_order[index],
      }));
      return {
        id: `r${face.id}`,
        edgeRefs,
      };
    });

    const edges = story.geometry.edges.map(e => ({
      id: `r${e.id}`,
      v1: `r${e.vertex_ids[0]}`,
      v2: `r${e.vertex_ids[1]}`,
    }));

    const vertices = story.geometry.vertices.map((vertex) => {
      const edge_ids = vertex.edge_ids.map(id => `r${id}`);
      return {
        edge_ids,
        id: `r${vertex.id}`,
        x: vertex.x,
        y: vertex.y,
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
