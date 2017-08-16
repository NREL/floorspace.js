import _ from 'lodash';
import { gen } from 'testcheck';
import {
 assert, refute, assertProperty, assertEqual,
 genPoint, genTriangle, genRectangle, genRegularPolygon, genIrregularPolygon,
 createIrregularPolygon,
} from '../../test_helpers';
import {
  validateFaceGeometry, edgesToSplit,
} from '../../../../src/store/modules/geometry/actions/createFaceFromPoints';
import helpers from '../../../../src/store/modules/geometry/helpers';

import { splitEdge } from '../../../../src/store/modules/geometry/mutations';
import {
  preserveRectangularityGeometry, simpleGeometry, emptyGeometry, neg5by5Rect,
} from './examples';

describe('validateFaceGeometry', () => {
  it('preserves rectangularity when possible (issue #72 )', () => {
    // https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/598b63629862dc7224f4df8c/1bc285908438ddc20e64c55752191727/capture.png
    const
      points = JSON.parse('[{"x":0,"y":1},{"x":3.10847804166,"y":1},{"x":3.10847804166,"y":2.75847898924},{"x":0,"y":2.75847898924}]');

    const
      res = validateFaceGeometry(points, preserveRectangularityGeometry, 2),
      newVerts = _.reject(res.vertices, v => preserveRectangularityGeometry.vertices.find(c => c.id === v.id));

    assert(newVerts.length === 3);
  });

  const genTooFewVerts = gen.array(genPoint, { maxSize: 2 });

  it('fails when given too few vertices', () => {
    assertProperty(
      genTooFewVerts, (verts) => {
        const resp = validateFaceGeometry(verts, emptyGeometry, 0);
        refute(resp && resp.success);
      });
  });

  it('succeeds from empty on a triangle', () => {
    assertProperty(
      genTriangle, (tri) => {
        const resp = validateFaceGeometry(tri, emptyGeometry, 0);
        assert(resp && resp.success);
      });
  });

  it('succeeds from empty on a rectangle', () => {
    assertProperty(
      genRectangle, (rect) => {
        const resp = validateFaceGeometry(rect, emptyGeometry, 0);
        assert(resp && resp.success);
      });
  });

  it('succeeds from empty on a regular polygon', () => {
    assertProperty(
      genRegularPolygon, (poly) => {
        const resp = validateFaceGeometry(poly, emptyGeometry, 0);
        assert(resp && resp.success);
      });
  });

  it('succeeds from empty on an irregular polygon', () => {
    assertProperty(
      genIrregularPolygon, (poly) => {
        const resp = validateFaceGeometry(poly, emptyGeometry, 0);
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
        const resp = validateFaceGeometry(poly, emptyGeometry, 0);
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
        { x: 5, y: 5 }, { x: 0, y: 5 }], emptyGeometry, 0);
    refute(resp && resp.success);

    assertProperty(genPolygonWithSpur, (poly) => {
      const resp2 = validateFaceGeometry(poly, emptyGeometry, 0);
      refute(resp2 && resp2.success);
    });
  });

  it('fails when the polygon is self-intersecting', () => {
    const resp = validateFaceGeometry(
      [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 0, y: 5 }, { x: 5, y: 5 }],
      emptyGeometry, 0);
    refute(resp && resp.success);
  });

  it('fails when a vertex lies an edge of which it is not an endpoint', () => {
    // https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/598b740a2e569128b4392cb5/f71690195e4801010773652bac9d0a9c/capture.png
    const resp = validateFaceGeometry(
      [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 0, y: 3 }, { x: 0, y: 5 }],
      emptyGeometry, 0);

    refute(resp && resp.success);
  });

  it('uses existing vertices when they perfectly overlap', () => {
    const resp = validateFaceGeometry(
      [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }],
      neg5by5Rect, 0);
    assert(resp && resp.success);
    assert(_.find(resp.vertices, { x: 0, y: 0 }).id === 'origin');
  });

  it('uses existing edges when they perfectly overlap', () => {
    const resp = validateFaceGeometry(
      [{ x: 0, y: 0 }, { x: -5, y: 0 }, { x: -5, y: 5 }, { x: 0, y: 5 }],
      neg5by5Rect, 0);
    assert(resp && resp.success);
    assert(_.find(resp.vertices, { x: 0, y: 0 }).id === 'origin');
    assert(_.find(resp.vertices, { x: -5, y: 0 }).id === '(-5, 0)');
    assert(_.find(resp.edges, { v1: 'origin', v2: '(-5, 0)' }).id === 'top');
  });

  it('uses existing edges when they perfectly overlap (even backwards)', () => {
    const resp = validateFaceGeometry(
      [{ x: 0, y: 5 }, { x: -5, y: 5 }, { x: -5, y: 0 }, { x: 0, y: 0 }],
      neg5by5Rect, 0);
    assert(resp && resp.success);
    assert(_.find(resp.vertices, { x: 0, y: 0 }).id === 'origin');
    assert(_.find(resp.vertices, { x: -5, y: 0 }).id === '(-5, 0)');
    const edge = _.find(resp.edges, { v1: 'origin', v2: '(-5, 0)' });
    assert(edge.id === 'top' && edge.reverse);
  });
});

describe('edgesToSplit', () => {
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

  it('splits an edge in a simple case', () => {
    const edges = edgesToSplit(simpleGeometry);
    assert(edges.length === 1);

    const [{ edgeToDelete, newEdges, dyingEdgeRefs, newEdgeRefs }] = edges;
    assert(edgeToDelete === 'ce');
    assert(_.find(dyingEdgeRefs, { face_id: 'bottom', edge_id: 'ce' }));
    const edgeDE = (
      _.find(newEdges, { v1: 'd', v2: 'e' }) ||
      _.find(newEdges, { v1: 'e', v2: 'd' }));

    assert(_.find(newEdgeRefs, {
      face_id: 'bottom',
      edgeRef: { edge_id: edgeDE.id },
    }));
  });

  it('maintains order of existing vertices', () => {
    const
      edges = edgesToSplit(simpleGeometry),
      state = [_.cloneDeep(simpleGeometry)];

    // modify our copy of geometry to see what it will look like after mutations
    edges.forEach(
      payload => splitEdge(state, { geometry_id: simpleGeometry.id, ...payload }));

    const vertsIdsFromFace = face => (
      _.chain(face.edges)
        .flatMap(e => (
          e.reverse ? [e.v2, e.v1] : [e.v1, e.v2]
        ))
        .map('id')
        .uniq()
        .value()
    );

    const
      oldGeom = helpers.denormalize(simpleGeometry),
      newGeom = helpers.denormalize(state[0]);
    _.zip(
      newGeom.faces.map(vertsIdsFromFace),
      oldGeom.faces.map(vertsIdsFromFace),
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
    const edges = edgesToSplit(simpleGeometry);

    refute(_.find(edges, { id: 'eg' }));
  });

  it('reverses new edges when the original was reversed', () => {
    const edges = edgesToSplit(simpleGeometry);

    edges.forEach((edge) => {
      edge.dyingEdgeRefs.forEach((der) => {
        const originalEdgeRef = _.find(
          _.find(simpleGeometry.faces, { id: der.face_id }).edgeRefs,
          { edge_id: der.edge_id });
        _.filter(edge.newEdgeRefs, { face_id: der.face_id }).forEach((ner) => {
          // expect that the newly created edge refs are in the same direction
          // as the dying edge ref.
          assertEqual(
            ner.edgeRef.reverse,
            originalEdgeRef.reverse,
          );
        });
      });
    });
  });
});
