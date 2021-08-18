import _ from 'lodash';
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

    const spaces = story.spaces.map((space) => {
      const daylighting_controls = space.daylighting_controls.map(control => ({
        daylighting_control_definition_id: `l${control.daylighting_control_definition_id}`,
        id: `l${control.id}`,
        vertex_id: `l${control.vertex_id}`,
      }));

      return {
        ...space,
        id: `l${space.id}`,
        face_id: `l${space.face_id}`,
        daylighting_controls,
        thermal_zone_id: `l${space.thermal_zone_id}`,
      };
    });

    const windows = story.windows.map(window => ({
      ...window,
      edge_id: `l${window.edge_id}`,
      id: `l${window.id}`,
      window_definition_id: `l${window.window_definition_id}`,
    }));

    const doors = story.doors.map(door => ({
      ...door,
      edge_id: `l${door.edge_id}`,
      id: `l${door.id}`,
      door_definition_id: `l${door.door_definition_id}`,
    }));

    const shading = story.shading.map(shade => ({
      ...shade,
      id: `l${shade.id}`,
      face_id: `l${shade.face_id}`,
    }));

    const images = story.images.map(image => ({
      ...image,
      id: `l${image.id}`,
    }));

    return {
      ...story,
      id: `l${story.id}`,
      geometry,
      spaces,
      windows,
      doors,
      shading,
      images,
    };
  });

  // CURRENT WINDOW DEFS
  currentFloorplan.window_definitions = currentFloorplan.window_definitions.map(window_def => ({
    ...window_def,
    id: `l${window_def.id}`,
  }));

  // CURRENT DOOR DEFS
  currentFloorplan.door_definitions = currentFloorplan.door_definitions.map(door_def => ({
    ...door_def,
    id: `l${door_def.id}`,
  }));

  // CURRENT DAYLIGHTING DEFS
  currentFloorplan.daylighting_control_definitions = currentFloorplan.daylighting_control_definitions.map(control => ({
    ...control,
    id: `l${control.id}`,
  }));

  // CURRENT THERMAL ZONES
  currentFloorplan.thermal_zones = currentFloorplan.thermal_zones.map(zone => ({
    ...zone,
    id: `l${zone.id}`,
  }));

  // -------------------------------------------
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

    const spaces = story.spaces.map((space) => {
      const daylighting_controls = space.daylighting_controls.map(control => ({
        daylighting_control_definition_id: `r${control.daylighting_control_definition_id}`,
        id: `r${control.id}`,
        vertex_id: `r${control.vertex_id}`,
      }));

      return {
        ...space,
        id: `r${space.id}`,
        face_id: `r${space.face_id}`,
        daylighting_controls,
        thermal_zone_id: `l${space.thermal_zone_id}`,
      };
    });

    const windows = story.windows.map(window => ({
      ...window,
      edge_id: `r${window.edge_id}`,
      id: `r${window.id}`,
      window_definition_id: `r${window.window_definition_id}`,
    }));

    const doors = story.doors.map(door => ({
      ...door,
      edge_id: `r${door.edge_id}`,
      id: `r${door.id}`,
      door_definition_id: `r${door.door_definition_id}`,
    }));

    const shading = story.shading.map(shade => ({
      ...shade,
      id: `r${shade.id}`,
      face_id: `r${shade.face_id}`,
    }));

    const images = story.images.map(image => ({
      ...image,
      id: `r${image.id}`,
    }));

    return {
      ...story,
      id: `r${story.id}`,
      geometry,
      spaces,
      windows,
      doors,
      shading,
      images,
    };
  });

  // INCOMING WINDOW DEFS
  payload.data.window_definitions = payload.data.window_definitions.map(window_def => ({
    ...window_def,
    id: `r${window_def.id}`,
  }));

  // INCOMING DOOR DEFS
  payload.data.door_definitions = payload.data.door_definitions.map(door_def => ({
    ...door_def,
    id: `r${door_def.id}`,
  }));

  // INCOMING DAYLIGHTING DEFS
  payload.data.daylighting_control_definitions = payload.data.daylighting_control_definitions.map(control => ({
    ...control,
    id: `r${control.id}`,
  }));

  // CURRENT THERMAL ZONES
  payload.data.thermal_zones = payload.data.thermal_zones.map(zone => ({
    ...zone,
    id: `r${zone.id}`,
  }));

  // ---------------------------------
  // MERGE FLOORPLANS PROPERTIES
  const zipUpStories = _.zip(payload.data.stories, currentFloorplan.stories);
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
      doors: [...pairOfStories[0].doors, ...pairOfStories[1].doors],
      shading: [...pairOfStories[0].shading, ...pairOfStories[1].shading],
      images: [...pairOfStories[0].images, ...pairOfStories[1].images],
    };
  });

  const mergedResult = {
    data: {
      ...payload.data,
      stories: mergeStories,
      window_definitions: [...payload.data.window_definitions, ...currentFloorplan.window_definitions],
      door_definitions: [...payload.data.door_definitions, ...currentFloorplan.door_definitions],
      daylighting_control_definitions: [...payload.data.daylighting_control_definitions, ...currentFloorplan.daylighting_control_definitions],
      thermal_zones: [...payload.data.thermal_zones, ...currentFloorplan.thermal_zones],
    },
  };

  console.log('before importing the mergedResult: ', mergedResult);

  // IMPORT MERGED FLOORPLAN
  importFloorplan(context, mergedResult);
}
