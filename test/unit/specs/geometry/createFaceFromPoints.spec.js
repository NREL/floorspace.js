import _ from 'lodash';
import { gen } from 'testcheck';
import {
 assert, refute, assertProperty, assertEqual,
 genPoint, genTriangle, genRectangle, genRegularPolygon, genIrregularPolygon,
 createIrregularPolygon,
} from '../../test_helpers';
import {
  validateFaceGeometry, edgesToSplit, newGeometriesOfOverlappedFaces,
} from '../../../../src/store/modules/geometry/actions/createFaceFromPoints';
import helpers from '../../../../src/store/modules/geometry/helpers';

import { splitEdge } from '../../../../src/store/modules/geometry/mutations';
import {
  preserveRectangularityGeometry, simpleGeometry, smallGeometry, emptyGeometry, neg5by5Rect, emptyEdgesProblem,
} from './examples';

describe('validateFaceGeometry', () => {
  it('preserves rectangularity when possible (issue #72 )', () => {
    // https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/598b63629862dc7224f4df8c/1bc285908438ddc20e64c55752191727/capture.png
    const
      points = JSON.parse('[{"x":0,"y":1},{"x":3.10847804166,"y":1},{"x":3.10847804166,"y":2.75847898924},{"x":0,"y":2.75847898924}]');

    const
      res = validateFaceGeometry(points, preserveRectangularityGeometry),
      newVerts = _.reject(res.vertices, v => preserveRectangularityGeometry.vertices.find(c => helpers.distanceBetweenPoints(v, c) < 0.0001));

    assert(newVerts.length === 3);
  });

  const genTooFewVerts = gen.array(genPoint, { minSize: 1, maxSize: 2 });

  it('fails when given too few vertices', () => {
    assertProperty(
      genTooFewVerts, (verts) => {
        const resp = validateFaceGeometry(verts, emptyGeometry);
        refute(resp && resp.success);
      });
  });

  it('succeeds when given 0 vertices', () => {
    const resp = validateFaceGeometry([], emptyGeometry);
    assert(resp && resp.success);
  });

  it('succeeds from empty on a triangle', () => {
    assertProperty(
      genTriangle, (tri) => {
        const resp = validateFaceGeometry(tri, emptyGeometry);
        assert(resp && resp.success);
      });
  });

  it('succeeds from empty on a rectangle', () => {
    assertProperty(
      genRectangle, (rect) => {
        const resp = validateFaceGeometry(rect, emptyGeometry);
        assert(resp && resp.success);
      });
  });

  it('succeeds from empty on a regular polygon', () => {
    assertProperty(
      genRegularPolygon, (poly) => {
        const resp = validateFaceGeometry(poly, emptyGeometry);
        assert(resp && resp.success);
      });
  });

  it('succeeds from empty on an irregular polygon', () => {
    assertProperty(
      genIrregularPolygon, (poly) => {
        const resp = validateFaceGeometry(poly, emptyGeometry);
        assert(resp && resp.success);
      });
  });

  const
    genZeroAreaTriangle = gen.array(genPoint, { size: 2 })
      .then(([a, b]) => ([a, b, a])),
    genZeroAreaRectangle = gen.array(genPoint, { size: 2 })
      .then(([a, b]) => ([a, b, b, a])),
    genZeroAreaPolygon = gen.oneOf([
      genZeroAreaTriangle, genZeroAreaRectangle,
    ]);

  it('fails when given a zero-area polygon', () => {
    assertProperty(
      genZeroAreaPolygon, (poly) => {
        const resp = validateFaceGeometry(poly, emptyGeometry);
        refute(resp && resp.success);
      });
  });

  const genPolygonWithSpur = gen.object({
    center: genPoint,
    radii: gen.array(gen.intWithin(5, 100), { minSize: 3, maxSize: 20 }),
    spurPos: gen.sPosInt,
  })
  .then(({ center, radii, spurPos: spurPosBeforeMod }) => {
    const
      spurPos = spurPosBeforeMod % radii.length,
      poly = createIrregularPolygon({ center, radii }),
      spikyPoly = createIrregularPolygon({
        center,
        radii: [
          ...radii.slice(0, spurPos),
          radii[spurPos] + 20,
          ...radii.slice(spurPos + 1),
        ],
      });
    poly.splice(spurPos + 1, 0, spikyPoly[spurPos], poly[spurPos]);
    return poly;
  });

  it("fails when there's a zero-area portion of the polygon", () => {
    const resp = validateFaceGeometry(
      [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 20, y: 0 }, { x: 5, y: 0 },
        { x: 5, y: 5 }, { x: 0, y: 5 }], emptyGeometry);
    refute(resp && resp.success);

    assertProperty(genPolygonWithSpur, (poly) => {
      const resp2 = validateFaceGeometry(poly, emptyGeometry);
      refute(resp2 && resp2.success);
    });
  });

  it('fails when the polygon is self-intersecting', () => {
    const resp = validateFaceGeometry(
      [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 0, y: 5 }, { x: 5, y: 5 }],
      emptyGeometry);
    refute(resp && resp.success);
  });

  it('fails when a vertex lies an edge of which it is not an endpoint', () => {
    // https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/598b740a2e569128b4392cb5/f71690195e4801010773652bac9d0a9c/capture.png
    const resp = validateFaceGeometry(
      [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 0, y: 3 }, { x: 0, y: 5 }],
      emptyGeometry);

    refute(resp && resp.success);
  });

  it('uses existing vertices when they perfectly overlap', () => {
    const resp = validateFaceGeometry(
      [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }],
      neg5by5Rect);
    assert(resp && resp.success);
    assert(_.find(resp.vertices, { x: 0, y: 0 }).id === 'origin');
  });

  it('uses existing edges when they perfectly overlap', () => {
    const resp = validateFaceGeometry(
      [{ x: 0, y: 0 }, { x: -5, y: 0 }, { x: -5, y: 5 }, { x: 0, y: 5 }],
      neg5by5Rect);
    assert(resp && resp.success);
    assert(_.find(resp.vertices, { x: 0, y: 0 }).id === 'origin');
    assert(_.find(resp.vertices, { x: -5, y: 0 }).id === '(-5, 0)');
    assert(_.find(resp.edges, { v1: 'origin', v2: '(-5, 0)' }).id === 'top');
  });

  it('uses existing edges when they perfectly overlap (even backwards)', () => {
    const resp = validateFaceGeometry(
      [{ x: 0, y: 5 }, { x: -5, y: 5 }, { x: -5, y: 0 }, { x: 0, y: 0 }],
      neg5by5Rect);
    assert(resp && resp.success);
    assert(_.find(resp.vertices, { x: 0, y: 0 }).id === 'origin');
    assert(_.find(resp.vertices, { x: -5, y: 0 }).id === '(-5, 0)');
    const edge = _.find(resp.edges, { v1: 'origin', v2: '(-5, 0)' });
    assert(edge.id === 'top' && edge.reverse);
  });
});

describe('edgesToSplit:simpleGeometry', () => {
  /*

      a +---+ b
        |   |
        |   |
      c +---+-----+ e
        |   d     |
        |         |
        |         |
      f +---------+ g

  */
  const
    edges = edgesToSplit(simpleGeometry, 5),
    newSimpleGeometry = _.cloneDeep(simpleGeometry),
    state = [newSimpleGeometry];

  // modify our copy of geometry to see what it will look like after mutations
  edges.forEach(
    payload => splitEdge(state, { geometry_id: simpleGeometry.id, ...payload }), 5);

  const
    oldGeom = helpers.denormalize(simpleGeometry),
    newGeom = helpers.denormalize(newSimpleGeometry);

  const vertsIdsFromFace = face => (
    _.chain(face.edges)
      .flatMap(e => (
        e.reverse ? [e.v2, e.v1] : [e.v1, e.v2]
      ))
      .map('id')
      .value()
  );

  it('splits an edge in a simple case', () => {
    assert(edges.length === 1, 'only one edge should be split');

    const [{ edgeToDelete, newEdges, replaceEdgeRefs }] = edges;
    assert(edgeToDelete === 'ce', 'that edge should be "ce"');

    const replaceCE = _.find(replaceEdgeRefs, { face_id: 'bottom', edge_id: 'ce' });
    assert(replaceCE);

    const edgeDE = (
      _.find(newEdges, { v1: 'd', v2: 'e' }) ||
      _.find(newEdges, { v1: 'e', v2: 'd' }));

    assert(_.includes(_.map(replaceCE.newEdges, 'id'), edgeDE.id));
  });

  it('maintains order of existing vertices', () => {
    _.zip(
      _.uniq(newGeom.faces.map(vertsIdsFromFace)),
      _.uniq(oldGeom.faces.map(vertsIdsFromFace)),
    ).forEach(([newVerts, oldVerts]) => {
      // check that any old verts still around are in the same order.
      assertEqual(
        // from lodash docs:
        // The order and references of result values
        //  are determined by the first array.
        _.intersection(newVerts, oldVerts),
        _.intersection(oldVerts, newVerts),
      );
    });
  });

  it('skips edges that are not nearby', () => {
    refute(_.find(edges, { id: 'eg' }));
  });

  it('reverses new edges when the original was reversed', () => {
    edges.forEach((edge) => {
      edge.replaceEdgeRefs.forEach((rer) => {
        const
          originalEdgeRef = _.find(
            _.find(simpleGeometry.faces, { id: rer.face_id }).edgeRefs,
            { edge_id: rer.edge_id }),
          newEdgeRefs = _.filter(
            _.find(newSimpleGeometry.faces, { id: rer.face_id }).edgeRefs,
            er => _.includes(edge.newEdgeRefs, er.edge_id));
        newEdgeRefs.forEach((ner) => {
          // expect that the newly created edge refs are in the same direction
          // as the replaced edge ref.
          assertEqual(
            ner.reverse,
            originalEdgeRef.reverse,
          );
        });
      });
    });
  });

  it('produces closed faces', () => {
    newGeom.faces.forEach((face) => {
      const verts = vertsIdsFromFace(face);
      assertEqual(verts[0], verts[verts.length - 1]);
      _.chunk(verts.slice(1, -1), 2).forEach(
        ([v2OfPrev, v1OfNext]) => assertEqual(v2OfPrev, v1OfNext),
      );
    });
  });
});

describe('edgesToSplit:emptyEdgesProblem', () => {
  it('should not return edges that are empty', () => {
    const edges = edgesToSplit(emptyEdgesProblem, 0.2);
    edges.forEach((edge) => {
      edge.newEdges.forEach((newEdge) => {
        const vert1 = emptyEdgesProblem.vertices.find((vert) => {
          return vert.id === newEdge.v1;
        });
        const vert2 = emptyEdgesProblem.vertices.find((vert) => {
          return vert.id === newEdge.v2;
        });
        const distance = helpers.distanceBetweenPoints(vert1, vert2);
        assert(distance.toFixed(10) > 0, 'distance must be greater than 0');
      });
    });
  });
});


describe('edgesToSplit:smallGeometry', () => {
  /*

      a +---+ b
        |   |
        |   |
      c +---+-----+ e
        |   d     |
        |         |
        |         |
      f +---------+ g

  */
  const
    edges = edgesToSplit(smallGeometry, 0.2),
    newSmallGeometry = _.cloneDeep(smallGeometry),
    state = [newSmallGeometry];

  // modify our copy of geometry to see what it will look like after mutations
  edges.forEach(
    payload => splitEdge(state, { geometry_id: smallGeometry.id, ...payload }), 0.2);

  const
    oldGeom = helpers.denormalize(smallGeometry),
    newGeom = helpers.denormalize(newSmallGeometry);

  const vertsIdsFromFace = face => (
    _.chain(face.edges)
      .flatMap(e => (
        e.reverse ? [e.v2, e.v1] : [e.v1, e.v2]
      ))
      .map('id')
      .value()
  );

  it('splits an edge in a simple case', () => {
    assert(edges.length === 1, 'only one edge should be split');

    const [{ edgeToDelete, newEdges, replaceEdgeRefs }] = edges;
    assert(edgeToDelete === 'ce', 'that edge should be "ce"');

    const replaceCE = _.find(replaceEdgeRefs, { face_id: 'bottom', edge_id: 'ce' });
    assert(replaceCE);

    const edgeDE = (
      _.find(newEdges, { v1: 'd', v2: 'e' }) ||
      _.find(newEdges, { v1: 'e', v2: 'd' }));

    assert(_.includes(_.map(replaceCE.newEdges, 'id'), edgeDE.id));
  });

  it('maintains order of existing vertices', () => {
    _.zip(
      _.uniq(newGeom.faces.map(vertsIdsFromFace)),
      _.uniq(oldGeom.faces.map(vertsIdsFromFace)),
    ).forEach(([newVerts, oldVerts]) => {
      // check that any old verts still around are in the same order.
      assertEqual(
        // from lodash docs:
        // The order and references of result values
        //  are determined by the first array.
        _.intersection(newVerts, oldVerts),
        _.intersection(oldVerts, newVerts),
      );
    });
  });

  it('skips edges that are not nearby', () => {
    refute(_.find(edges, { id: 'eg' }));
  });

  it('reverses new edges when the original was reversed', () => {
    edges.forEach((edge) => {
      edge.replaceEdgeRefs.forEach((rer) => {
        const
          originalEdgeRef = _.find(
            _.find(smallGeometry.faces, { id: rer.face_id }).edgeRefs,
            { edge_id: rer.edge_id }),
          newEdgeRefs = _.filter(
            _.find(newSmallGeometry.faces, { id: rer.face_id }).edgeRefs,
            er => _.includes(edge.newEdgeRefs, er.edge_id));
        newEdgeRefs.forEach((ner) => {
          // expect that the newly created edge refs are in the same direction
          // as the replaced edge ref.
          assertEqual(
            ner.reverse,
            originalEdgeRef.reverse,
          );
        });
      });
    });
  });

  it('produces closed faces', () => {
    newGeom.faces.forEach((face) => {
      const verts = vertsIdsFromFace(face);
      assertEqual(verts[0], verts[verts.length - 1]);
      _.chunk(verts.slice(1, -1), 2).forEach(
        ([v2OfPrev, v1OfNext]) => assertEqual(v2OfPrev, v1OfNext),
      );
    });
  });
});


describe('newGeometriesOfOverlappedFaces', () => {

  const
    geometry = helpers.normalize({
      vertices: [],
      edges: [],
      id: 1,
      faces: [
        {
          id: 'bigger',
          edges: [
            { id: 1, v1: { id: 'a', x: 2, y: 0 }, v2: { id: 'b', x: 2, y: 10 } },
            { id: 2, v1: { id: 'b', x: 2, y: 10 }, v2: { id: 'c', x: 8, y: 10 } },
            { id: 3, v1: { id: 'c', x: 8, y: 10 }, v2: { id: 'd', x: 8, y: 0 } },
            { id: 4, v1: { id: 'd', x: 8, y: 0 }, v2: { id: 'a', x: 2, y: 0 } },
          ],
        },
        {
          id: 'being_moved',
          edges: [
            { id: 1, v1: { id: 'w', x: 12, y: 1 }, v2: { id: 'z', x: 12, y: 9 } },
            { id: 2, v1: { id: 'z', x: 12, y: 9 }, v2: { id: 'm', x: 14, y: 9 } },
            { id: 3, v1: { id: 'm', x: 14, y: 9 }, v2: { id: 'n', x: 14, y: 1 } },
            { id: 4, v1: { id: 'n', x: 14, y: 1 }, v2: { id: 'w', x: 12, y: 1 } },
          ],
        },
      ],
    }),
    beingMovedPositionedInCenterOfBigger = [
      { x: 3, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 9 }, { x: 3, y: 9 }],
    beingMovedToSideOfBigger = [
      { x: 7, y: 1 }, { x: 9, y: 1 }, { x: 9, y: 9 }, { x: 7, y: 9 }
    ];


  it('disallows faces to be split (as in issue #124)', () => {
    const
      geometry = helpers.normalize({
        vertices: [],
        edges: [],
        id: 1,
        faces: [
          {
            id: 'twelve',
            edges: [
              { id: 1, v1: { id: 'a', x: 2, y: 0 }, v2: { id: 'b', x: 2, y: 10 } },
              { id: 2, v1: { id: 'b', x: 2, y: 10 }, v2: { id: 'c', x: 4, y: 10 } },
              { id: 3, v1: { id: 'c', x: 4, y: 10 }, v2: { id: 'd', x: 4, y: 0 } },
              { id: 4, v1: { id: 'd', x: 4, y: 0 }, v2: { id: 'a', x: 2, y: 0 } },
            ],
          },
        ],
      }),
      points = [{ x: 0, y: 3 }, { x: 5, y: 3 }, { x: 5, y: 5 }, { x: 0, y: 5 }];

    assertEqual(
      newGeometriesOfOverlappedFaces(points, geometry).error,
      'no split faces');
  });

  it('disallows a space being moved to cause a split (as in issue #133)', () => {
    assertEqual(
      newGeometriesOfOverlappedFaces(
        beingMovedPositionedInCenterOfBigger,
        helpers.exceptFace(geometry, 'being_moved')),
      { error: 'no holes' });
  });

  it("permits a space to be moved if it doesn't cause a split face", () => {
    const newGeoms = newGeometriesOfOverlappedFaces(
      beingMovedToSideOfBigger,
      helpers.exceptFace(geometry, 'being_moved'));

    refute(newGeoms.error, 'Expected movement to succeed');
    assert(newGeoms.length === 1);
    const newBigger = newGeoms[0];
    assert(newBigger.face_id === 'bigger');

    assertEqual(newBigger.vertices.length, 8);
  });
});
