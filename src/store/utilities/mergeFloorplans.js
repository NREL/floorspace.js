import _ from 'lodash';
import exportData from './export';
import importFloorplan from './importFloorplan';

/**
 * When merging 2 floorplans we need to prep each floor plan
 * by giving each property (usually ids) a unique identifier
 * which is represented by a side (left or right)
 * We pass in the floorplan data and receive a floorplan with
 * unique data that can then be merged
 *
 * @param {string} side
 * @param {Data} data
 */
function prepareDataForMerge(side, data) {
  data.stories = data.stories.map((story) => {
    const faces = story.geometry.faces.map((face) => {
      const edge_ids = face.edge_ids.map(id => `${side}${id}`);
      return {
        ...face,
        id: `${side}${face.id}`,
        edge_ids,
      };
    });

    const edges = story.geometry.edges.map((edge) => {
      const face_ids = edge.face_ids.map(id => `${side}${id}`);
      const vertex_ids = edge.vertex_ids.map(id => `${side}${id}`);
      return {
        face_ids,
        id: `${side}${edge.id}`,
        vertex_ids,
      };
    });

    const vertices = story.geometry.vertices.map((vertex) => {
      const edge_ids = vertex.edge_ids.map(id => `${side}${id}`);
      return {
        ...vertex,
        edge_ids,
        id: `${side}${vertex.id}`,
      };
    });

    const geometry = {
      id: `${side}${story.geometry.id}`,
      faces,
      edges,
      vertices,
    };

    const spaces = story.spaces.map((space) => {
      const daylighting_controls = space.daylighting_controls.map(control => ({
        daylighting_control_definition_id: `${side}${control.daylighting_control_definition_id}`,
        id: `${side}${control.id}`,
        vertex_id: `${side}${control.vertex_id}`,
      }));

      return {
        ...space,
        name: side === 'l' ? `${space.name} (Original)` : `${space.name} (Imported)`,
        id: `${side}${space.id}`,
        face_id: `${side}${space.face_id}`,
        daylighting_controls,
        thermal_zone_id: `${side}${space.thermal_zone_id}`,
        building_unit_id: `${side}${space.building_unit_id}`,
        space_type_id: `${side}${space.space_type_id}`,
        pitched_roof_id: `${side}${space.pitched_roof_id}`,
      };
    });

    const windows = story.windows.map(window => ({
      ...window,
      edge_id: `${side}${window.edge_id}`,
      id: `${side}${window.id}`,
      window_definition_id: `${side}${window.window_definition_id}`,
    }));

    const doors = story.doors.map(door => ({
      ...door,
      edge_id: `${side}${door.edge_id}`,
      id: `${side}${door.id}`,
      door_definition_id: `${side}${door.door_definition_id}`,
    }));

    const shading = story.shading.map(shade => ({
      ...shade,
      id: `${side}${shade.id}`,
      face_id: `${side}${shade.face_id}`,
    }));

    const images = story.images.map(image => ({
      ...image,
      id: `${side}${image.id}`,
    }));

    return {
      ...story,
      id: `${side}${story.id}`,
      geometry,
      spaces,
      windows,
      doors,
      shading,
      images,
    };
  });

  // CURRENT WINDOW DEFS
  data.window_definitions = data.window_definitions.map(window_def => ({
    ...window_def,
    id: `${side}${window_def.id}`,
  }));

  // CURRENT DOOR DEFS
  data.door_definitions = data.door_definitions.map(door_def => ({
    ...door_def,
    id: `${side}${door_def.id}`,
  }));

  // CURRENT DAYLIGHTING DEFS
  data.daylighting_control_definitions = data.daylighting_control_definitions.map(control => ({
    ...control,
    id: `${side}${control.id}`,
  }));

  // CURRENT THERMAL ZONES
  data.thermal_zones = data.thermal_zones.map(zone => ({
    ...zone,
    id: `${side}${zone.id}`,
  }));

  // CURRENT BUILDING UNITS
  data.building_units = data.building_units.map(unit => ({
    ...unit,
    id: `${side}${unit.id}`,
  }));

  // CURRENT SPACE TYPES
  data.space_types = data.space_types.map(space => ({
    ...space,
    id: `${side}${space.id}`,
  }));

  // CURRENT PITCHED ROOFS
  data.pitched_roofs = data.pitched_roofs.map(roof => ({
    ...roof,
    id: `${side}${roof.id}`,
  }));

  return data;
}

/**
 * Takes in the current state to get the current floorplan
 * Generates like structure for both current and imported floorplan
 * Merges them into one object and imports that as 1 new floorplan
 *
 * @param {Context} context
 * @param {Payload} payload
 */
export default function mergeFloorplans(context, payload) {
  // PREP FLOORPLANS FOR MERGE
  const currentFloorplan = exportData(context.state, context.getters);

  const prepedCurrentFloorplan = prepareDataForMerge('l', currentFloorplan);
  const prepedIncomingFloorplan = prepareDataForMerge('r', payload.data);

  // MERGE FLOORPLANS PROPERTIES
  const zipUpStories = _.zip(prepedIncomingFloorplan.stories, prepedCurrentFloorplan.stories);
  const mergeStories = zipUpStories.map(([leftStory, rightStory]) => {
    if (!leftStory) {
      return rightStory;
    }
    if (!rightStory) {
      return leftStory;
    }
    return {
      ...leftStory,
      geometry: {
        id: leftStory.id,
        edges: [...leftStory.geometry.edges, ...rightStory.geometry.edges],
        faces: [...leftStory.geometry.faces, ...rightStory.geometry.faces],
        vertices: [...leftStory.geometry.vertices, ...rightStory.geometry.vertices],
      },
      spaces: [...leftStory.spaces, ...rightStory.spaces],
      windows: [...leftStory.windows, ...rightStory.windows],
      doors: [...leftStory.doors, ...rightStory.doors],
      shading: [...leftStory.shading, ...rightStory.shading],
      images: [...leftStory.images, ...rightStory.images],
    };
  });

  const mergedResult = {
    data: {
      ...prepedIncomingFloorplan,
      stories: mergeStories,
      window_definitions: [...prepedIncomingFloorplan.window_definitions, ...prepedCurrentFloorplan.window_definitions],
      door_definitions: [...prepedIncomingFloorplan.door_definitions, ...prepedCurrentFloorplan.door_definitions],
      daylighting_control_definitions: [...prepedIncomingFloorplan.daylighting_control_definitions, ...prepedCurrentFloorplan.daylighting_control_definitions],
      thermal_zones: [...prepedIncomingFloorplan.thermal_zones, ...prepedCurrentFloorplan.thermal_zones],
      building_units: [...prepedIncomingFloorplan.building_units, ...prepedCurrentFloorplan.building_units],
      space_types: [...prepedIncomingFloorplan.space_types, ...prepedCurrentFloorplan.space_types],
      pitched_roofs: [...prepedIncomingFloorplan.pitched_roofs, ...prepedCurrentFloorplan.pitched_roofs],
    },
  };

  // IMPORT MERGED FLOORPLAN
  importFloorplan(context, mergedResult);
}
