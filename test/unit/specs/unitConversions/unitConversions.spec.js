import _ from 'lodash';
import { gen } from 'testcheck';
import { conversionFactor, getConverter } from '../../../../src/store/utilities/unitConversion';
import { assertProperty, assertEqual, assert, assertThrows, genPoint, refute, nearlyEqual, isNearlyEqual } from '../../test_helpers';
import { simpleGeometry } from './../geometry/examples';

describe('conversionFactor', () => {
  it('knows that 10m is about 32.8084ft', () => {
    const factor = conversionFactor('m', 'ft');
    assert(nearlyEqual(factor * 10, 32.8084));
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
      ipVert = { x: 39.37008, y: -16.4042 };

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
