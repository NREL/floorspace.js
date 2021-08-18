import _ from 'lodash';
import exportData from './export';
import importFloorplan from './importFloorplan';

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

export default function mergeFloorplans(context, payload) {
  // PREP CURRENT FLOORPLAN FOR MERGE
  const currentFloorplan = exportData(context.state, context.getters);
  console.log('current floorplan: ', currentFloorplan);

  const prepedCurrentFloorplan = prepareDataForMerge('l', currentFloorplan);
  const prepedIncomingFloorplan = prepareDataForMerge('r', payload.data);

  // -------------------------------------------
  // PREP IMPORTED FLOORPLAN FOR MERGE
  console.log('payload data: ', payload.data);
  // payload.data.stories = payload.data.stories.map((story) => {
  //   const faces = story.geometry.faces.map((face) => {
  //     const edge_ids = face.edge_ids.map(id => `r${id}`);
  //     return {
  //       ...face,
  //       id: `r${face.id}`,
  //       edge_ids,
  //     };
  //   });

  //   const edges = story.geometry.edges.map((edge) => {
  //     const face_ids = edge.face_ids.map(id => `r${id}`);
  //     const vertex_ids = edge.vertex_ids.map(id => `r${id}`);
  //     return {
  //       face_ids,
  //       id: `r${edge.id}`,
  //       vertex_ids,
  //     };
  //   });

  //   const vertices = story.geometry.vertices.map((vertex) => {
  //     const edge_ids = vertex.edge_ids.map(id => `r${id}`);
  //     return {
  //       ...vertex,
  //       edge_ids,
  //       id: `r${vertex.id}`,
  //     };
  //   });

  //   const geometry = {
  //     id: `r${story.geometry.id}`,
  //     faces,
  //     edges,
  //     vertices,
  //   };

  //   const spaces = story.spaces.map((space) => {
  //     const daylighting_controls = space.daylighting_controls.map(control => ({
  //       daylighting_control_definition_id: `r${control.daylighting_control_definition_id}`,
  //       id: `r${control.id}`,
  //       vertex_id: `r${control.vertex_id}`,
  //     }));

  //     return {
  //       ...space,
  //       id: `r${space.id}`,
  //       face_id: `r${space.face_id}`,
  //       daylighting_controls,
  //       thermal_zone_id: `r${space.thermal_zone_id}`,
  //       building_unit_id: `r${space.building_unit_id}`,
  //       space_type_id: `r${space.space_type_id}`,
  //       pitched_roof_id: `r${space.pitched_roof_id}`,
  //     };
  //   });

  //   const windows = story.windows.map(window => ({
  //     ...window,
  //     edge_id: `r${window.edge_id}`,
  //     id: `r${window.id}`,
  //     window_definition_id: `r${window.window_definition_id}`,
  //   }));

  //   const doors = story.doors.map(door => ({
  //     ...door,
  //     edge_id: `r${door.edge_id}`,
  //     id: `r${door.id}`,
  //     door_definition_id: `r${door.door_definition_id}`,
  //   }));

  //   const shading = story.shading.map(shade => ({
  //     ...shade,
  //     id: `r${shade.id}`,
  //     face_id: `r${shade.face_id}`,
  //   }));

  //   const images = story.images.map(image => ({
  //     ...image,
  //     id: `r${image.id}`,
  //   }));

  //   return {
  //     ...story,
  //     id: `r${story.id}`,
  //     geometry,
  //     spaces,
  //     windows,
  //     doors,
  //     shading,
  //     images,
  //   };
  // });

  // // INCOMING WINDOW DEFS
  // payload.data.window_definitions = payload.data.window_definitions.map(window_def => ({
  //   ...window_def,
  //   id: `r${window_def.id}`,
  // }));

  // // INCOMING DOOR DEFS
  // payload.data.door_definitions = payload.data.door_definitions.map(door_def => ({
  //   ...door_def,
  //   id: `r${door_def.id}`,
  // }));

  // // INCOMING DAYLIGHTING DEFS
  // payload.data.daylighting_control_definitions = payload.data.daylighting_control_definitions.map(control => ({
  //   ...control,
  //   id: `r${control.id}`,
  // }));

  // // INCOMING THERMAL ZONES
  // payload.data.thermal_zones = payload.data.thermal_zones.map(zone => ({
  //   ...zone,
  //   id: `r${zone.id}`,
  // }));

  // // INCOMING BUILDING UNITS
  // payload.data.building_units = payload.data.building_units.map(unit => ({
  //   ...unit,
  //   id: `r${unit.id}`,
  // }));

  // // INCOMING SPACE TYPES
  // payload.data.space_types = payload.data.space_types.map(space => ({
  //   ...space,
  //   id: `r${space.id}`,
  // }));

  // // INCOMING PITCHED ROOFS
  // payload.data.pitched_roofs = payload.data.pitched_roofs.map(roof => ({
  //   ...roof,
  //   id: `r${roof.id}`,
  // }));

  // ---------------------------------
  // MERGE FLOORPLANS PROPERTIES
  const zipUpStories = _.zip(prepedIncomingFloorplan.stories, prepedCurrentFloorplan.stories);
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

  console.log('before importing the mergedResult: ', mergedResult);

  // IMPORT MERGED FLOORPLAN
  importFloorplan(context, mergedResult);
}
