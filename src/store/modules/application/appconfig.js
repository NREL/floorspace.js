
export const assignableProperties = ['building_units', 'thermal_zones', 'space_types', 'construction_sets', 'pitched_roofs'];

const config = {
  // map modes to displaynames
  modes: {
    stories: 'Story',
    images: 'Image',
    spaces: 'Space',
    shading: 'Shading',
    building_units: 'Building Unit',
    thermal_zones: 'Thermal Zone',
    space_types: 'Space Type',
    pitched_roofs: 'Pitched Roof',
    construction_sets: 'Construction Set',
  },
  assignableProperties,
  palette: {
    shading: '#E8E3E5',
    neutral: '#bbc3c7',
    // colors to associate with new models
    colors: [
      '#a49',
      '#8ce',
      '#328',
      '#173',
      '#993',
      '#dc7',
      '#c67',
      '#825',
      '#4a9',
      '#69c',
      '#610',
      '#a46',
    ],
  },
};

export default config;
