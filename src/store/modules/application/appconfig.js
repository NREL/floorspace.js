export const assignableProperties = [
  "building_units",
  "thermal_zones",
  "space_types",
  "construction_sets",
  "pitched_roofs",
  "building_types",
];
export const componentTypes = [
  "window_definitions",
  "daylighting_control_definitions",
  "door_definitions",
];
export const libraryTypes = [...assignableProperties, ...componentTypes];
export const textures = [
  "circles-2",
  "circles-5",
  "circles-8",
  "diagonal-stripe-1",
  "diagonal-stripe-4",
  "diagonal-stripe-6",
  "dots-5",
  "dots-8",
  "vertical-line",
  "crosshatch",
];

const config = {
  // map modes to displaynames
  modes: {
    stories: "Story",
    images: "Image",
    spaces: "Space",
    shading: "Shading",
    building_units: "Building Unit",
    building_types: "Building Type",
    thermal_zones: "Thermal Zone",
    space_types: "Space Type",
    pitched_roofs: "Pitched Roof",
    construction_sets: "Construction Set",
    window_definitions: "Window Definitions",
    daylighting_control_definitions: "Daylighting Control Definitions",
  },
  componentTypes,
  assignableProperties,
  palette: {
    shading: "#E8E3E5",
    neutral: "#bbc3c7",
    // colors to associate with new models
    colors: [
      "#aa4499",
      "#88ccee",
      "#332288",
      "#117733",
      "#999933",
      "#ddcc77",
      "#cc6677",
      "#882255",
      "#44aa99",
      "#6699cc",
      "#661100",
      "#aa4466",
    ],
  },
};

export default config;
