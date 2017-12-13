import _ from 'lodash';
import { conversionFactor, getConverter, convertSchema, convertState, units } from '../../../../src/store/utilities/unitConversion';
import { assertEqual, assert, assertThrows, nearlyEqual, isNearlyEqual } from '../../test_helpers';
import { simpleGeometry } from './../geometry/examples';
import ipFloorplan from '../../../e2e/fixtures/floorplan_two_story_2017_11_28.json';

describe('conversionFactor', () => {
  it('knows that 10m is about 32.80839895ft', () => {
    const factor = conversionFactor('m', 'ft');
    assert(nearlyEqual(factor * 10, 10 * 3.280839895));
  });

  it('throws on unknown conversions', () => {
    assertThrows(
      () => conversionFactor('zots', 'krambles'),
      'expected not to find a conversion between zots and krambles');
  });
});

describe('getConverter', () => {
  it('produces an acceptable conversion for Vertices', () => {
    const
      toIP = getConverter('Vertex', 'si_units', 'ip_units'),
      toSI = getConverter('Vertex', 'ip_units', 'si_units'),
      siVert = { x: 12, y: -5 },
      ipVert = { x: 12 * 3.280839895, y: -5 * 3.280839895 };

    assert(isNearlyEqual(toSI(ipVert), siVert));
    assert(isNearlyEqual(toIP(siVert), ipVert));
  });

  const
    ipProject = {
      north_axis: 12,
      ground: {
        floor_offset: 5,
        azimuth_angle: 20,
        tilt_slope: 0.4,
      },
      view: {
        min_x: -250,
        min_y: -150,
        max_x: 250,
        max_y: 150,
      },
      map: {
        zoom: 14,
        elevation: 40,
        rotation: 12,
      },
      show_import_export: false,
    },
    siProject = getConverter('Project', 'ip_units', 'si_units')(ipProject);

  it('converts nested attributes', () => {
    assert(isNearlyEqual(
      siProject.view,
      _.mapValues(ipProject.view, v => v * 0.3048),
    ));
  });

  it('provides the identity func when converting unknown objects', () => {
    assertEqual(
      getConverter('User', 'si_units', 'ip_units'),
      _.identity);
  });

  it('leaves alone unitless properties', () => {
    assertEqual(
      ipProject.ground.tilt_slope,
      siProject.ground.tilt_slope);
    assertEqual(
      ipProject.map.zoom,
      siProject.map.zoom);
    assertEqual(
      ipProject.show_import_export,
      siProject.show_import_export);
  });

  it('leaves alone properties with same units in both systems', () => {
    assertEqual(ipProject.map.rotation, siProject.map.rotation);
    assertEqual(ipProject.north_axis, siProject.north_axis);
    assertEqual(ipProject.ground.azimuth_angle, siProject.ground.azimuth_angle);
  });

  it('succeeds on a window definition', () => {
    const
      siWindow = {
        id: 'originallySi',
        name: 'my si window',
        window_definition_type: 'Single Window',
        wwr: 0.3,
        sill_height: 1,
        window_spacing: 2,
        height: 1,
        width: 2,
        overhang_projection_factor: 0.2,
        fin_projection_factor: 0.3,
      },
      ipWindow = {
        id: 'originallyIP',
        name: 'my ip window',
        window_definition_type: 'Single Window',
        wwr: 0.3,
        sill_height: 3.28084,
        window_spacing: 2 * 3.28084,
        height: 3.28084,
        width: 2 * 3.28084,
        overhang_projection_factor: 0.2,
        fin_projection_factor: 0.3,
      };

    assert(isNearlyEqual(
      _.omit(siWindow, ['name', 'id']),
      _.omit(
        getConverter('WindowDefinition', 'ip_units', 'si_units')(ipWindow),
        ['name', 'id'])));

    assert(isNearlyEqual(
      _.omit(ipWindow, ['name', 'id']),
      _.omit(
        getConverter('WindowDefinition', 'si_units', 'ip_units')(siWindow),
        ['name', 'id'])));
  });

  it('applies recursive Vertex conversion to Geometry', () => {
    const
      geomConvert = getConverter('Geometry', 'si_units', 'ip_units'),
      vertConvert = getConverter('Vertex', 'si_units', 'ip_units'),
      ipGeometry = geomConvert(simpleGeometry);
    assertEqual(
      _.omit(simpleGeometry, 'vertices'),
      _.omit(ipGeometry, 'vertices'));
    _.zip(simpleGeometry.vertices, ipGeometry.vertices)
      .forEach(
        ([siVert, ipVert]) => assertEqual(vertConvert(siVert), ipVert));
  });
});

describe('convertSchema', () => {
  const siFloorplan = convertSchema(ipFloorplan, 'ip_units', 'si_units');
  it('has the same keys as original', () => {
    assertEqual(_.keys(siFloorplan), _.keys(ipFloorplan));
  });

  it('converted the project', () => {
    const projectConvert = getConverter('Project', 'ip_units', 'si_units');
    assertEqual(
      siFloorplan.project,
      projectConvert(ipFloorplan.project));
  });

  it('converted each vertex', () => {
    const vertConvert = getConverter('Vertex', 'ip_units', 'si_units');

    assertEqual(
      _.chain(siFloorplan.stories)
        .flatMap('geometry')
        .flatMap('vertices')
        .value(),
      _.chain(ipFloorplan.stories)
        .flatMap('geometry')
        .flatMap('vertices')
        .map(vertConvert)
        .value());
  });
});

describe('units', () => {
  it("can't be modified", () => {
    assertThrows(() => {
      units.blah = 12;
    });
  });

  it("can't be modified, even deeply", () => {
    assertThrows(() => {
      units.Application.blah = 12;
    });
  });
});

describe('convertState', () => {
  const ipState = JSON.parse(`{
  "application": {
    "currentSelections": {
      "story": null,
      "story_id": "1",
      "subselection_ids": {
        "1": "3"
      },
      "component_id": null,
      "component_definition_id": "14",
      "component_instance_id": null,
      "space_property_id": null,
      "tool": "Place Component",
      "mode": "spaces",
      "snapMode": "grid-strict",
      "modeTab": "components",
      "subselectionType": "window_definitions"
    },
    "modes": [
      "spaces",
      "shading",
      "building_units",
      "thermal_zones",
      "pitched_roofs",
      "space_types",
      "images"
    ],
    "tools": [
      "Pan",
      "Drag",
      "Rectangle",
      "Polygon",
      "Eraser",
      "Select",
      "Map",
      "Fill",
      "Place Component",
      "Image",
      "Apply Property"
    ],
    "scale": {
      "x": {
        "pixels": 968,
        "rwuRange": [
          -180.31017770597737,
          0.3101777059773809
        ]
      },
      "y": {
        "pixels": 619,
        "rwuRange": [
          -0.25,
          115.25
        ]
      }
    }
  },
  "project": {
    "config": {
      "units": "ft",
      "unitsEditable": true,
      "language": "EN-US"
    },
    "north_axis": 0,
    "ground": {
      "floor_offset": 0,
      "azimuth_angle": 0,
      "tilt_slope": 0
    },
    "grid": {
      "visible": true,
      "spacing": 5
    },
    "view": {
      "min_x": -180.31017770597737,
      "min_y": -0.25,
      "max_x": 0.3101777059773667,
      "max_y": 115.25
    },
    "map": {
      "initialized": false,
      "enabled": false,
      "visible": true,
      "latitude": 39.7653,
      "longitude": -104.9863,
      "zoom": 4.5,
      "rotation": 0,
      "elevation": 0
    },
    "previous_story": {
      "visible": true
    },
    "show_import_export": true
  },
  "geometry": [
    {
      "id": "2",
      "vertices": [
        {
          "id": "5",
          "x": -135,
          "y": 110
        },
        {
          "id": "6",
          "x": -45,
          "y": 110
        },
        {
          "id": "7",
          "x": -45,
          "y": 5
        },
        {
          "id": "8",
          "x": -135,
          "y": 5
        }
      ],
      "edges": [
        {
          "id": "9",
          "v1": "5",
          "v2": "6"
        },
        {
          "id": "10",
          "v1": "6",
          "v2": "7"
        },
        {
          "id": "11",
          "v1": "7",
          "v2": "8"
        },
        {
          "id": "12",
          "v1": "8",
          "v2": "5"
        }
      ],
      "faces": [
        {
          "id": "13",
          "edgeRefs": [
            {
              "edge_id": "9",
              "reverse": false
            },
            {
              "edge_id": "10",
              "reverse": false
            },
            {
              "edge_id": "11",
              "reverse": false
            },
            {
              "edge_id": "12",
              "reverse": false
            }
          ]
        }
      ]
    }
  ],
  "models": {
    "stories": [
      {
        "id": "1",
        "handle": null,
        "name": "Story 1",
        "image_visible": true,
        "below_floor_plenum_height": 0,
        "floor_to_ceiling_height": 8,
        "above_ceiling_plenum_height": 0,
        "multiplier": 1,
        "color": "#8ce",
        "geometry": null,
        "images": [],
        "spaces": [
          {
            "id": "3",
            "handle": null,
            "name": "Space 1 - 1",
            "face_id": "13",
            "building_unit_id": null,
            "thermal_zone_id": null,
            "space_type_id": null,
            "construction_set_id": null,
            "pitched_roof_id": null,
            "daylighting_controls": [],
            "below_floor_plenum_height": 2.3,
            "floor_to_ceiling_height": null,
            "above_ceiling_plenum_height": 4,
            "floor_offset": null,
            "open_to_below": null,
            "color": "#8ce",
            "type": "space"
          }
        ],
        "shading": [
          {
            "id": "4",
            "handle": null,
            "name": "Shading 1 - 1",
            "face_id": null,
            "color": "#E8E3E5"
          }
        ],
        "windows": [
          {
            "window_definition_id": "14",
            "edge_id": "12",
            "alpha": 0.8571428571428571,
            "id": "15",
            "name": "Window 1 - 1"
          },
          {
            "window_definition_id": "14",
            "edge_id": "9",
            "alpha": 0.3888888888888889,
            "id": "16",
            "name": "Window 1 - 2"
          }
        ],
        "geometry_id": "2"
      }
    ],
    "library": {
      "building_units": [],
      "thermal_zones": [],
      "space_types": [],
      "construction_sets": [],
      "window_definitions": [
        {
          "id": "14",
          "name": "Window 1",
          "window_definition_type": "Single Window",
          "wwr": null,
          "sill_height": 3,
          "window_spacing": null,
          "height": 4,
          "width": 2,
          "overhang_projection_factor": null,
          "fin_projection_factor": null
        }
      ],
      "daylighting_control_definitions": [],
      "pitched_roofs": []
    }
  },
  "timetravelInitialized": true
}`),
    siState = convertState(ipState, 'ip_units', 'si_units');
  it('converts nested library values', () => {
    const convertWindowDefn = getConverter('WindowDefinition', 'ip_units', 'si_units');
    assert(isNearlyEqual(
      siState.models.library.window_definitions[0],
      convertWindowDefn(ipState.models.library.window_definitions[0])));
  });

  it('converts nested geometry state', () => {
    const convertGeom = getConverter('Geometry', 'ip_units', 'si_units');
    assert(isNearlyEqual(
      siState.geometry[0],
      convertGeom(ipState.geometry[0])));
  });

  it("doesn't add extra geometry key to stories", () => {
    assertEqual(
      _.keys(siState.models.stories[0]),
      _.keys(ipState.models.stories[0]));
  });

  it('converts space properties', () => {
    const convertSpace = getConverter('Space', 'ip_units', 'si_units');

    assertEqual(
      siState.models.stories[0].spaces[0],
      convertSpace(ipState.models.stories[0].spaces[0]),
    );
  });
});
