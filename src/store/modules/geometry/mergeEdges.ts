import _ from "lodash";
import { allPairs } from "../../../utilities";
import helpers from "./helpers";

export default {
  findMergeableEdges() {
    // Find edges that are very near to one another, and the user might
    // mistakenly think they are the same.
    // mergeable edges are:
    // - edges with whose endpoints are very near to one another
    // - edges with similar angles where the vertices of one/both lie near the
    // edge of the other.
  },
  areMergeable(edge1, edge2) {
    return (
      this.endpointsNearby(edge1, edge2) ||
      this.oneEdgeCouldEatAnother(edge1, edge2) ||
      this.edgesExtend(edge1, edge2) ||
      this.edgesCombine(edge1, edge2)
    );
  },
  oneEdgeCouldEatAnother(edge1, edge2) {
    /*
          o-------o
     o--------------------------o
    */
    if (!helpers.haveSimilarAngles(edge1, edge2)) {
      return false;
    }
    return (
      this.leftEdgeEatsRight(edge1, edge2) ||
      this.leftEdgeEatsRight(edge2, edge1)
    );
  },
  leftEdgeEatsRight(left, right) {
    const { start, end } = right,
      avgEdgeLen = this.avgEdgeLength(left, right),
      { dist: startDist, proj: startProj } = helpers.pointDistanceToSegment(
        start,
        left
      ),
      { dist: endDist, proj: endProj } = helpers.pointDistanceToSegment(
        end,
        left
      );

    if (!(Math.max(startDist, endDist) < 0.05 * avgEdgeLen)) {
      return false;
    }

    return {
      mergeType: "oneEdgeEatsAnother",
      newVertexOrder: this.consolidateVertices(
        left.start,
        left.end,
        startProj,
        endProj
      ),
    };
  },
  edgesExtend(edge1, edge2) {
    /*
                  o----------------o
        o--------o
    */
    if (!helpers.haveSimilarAngles(edge1, edge2)) {
      return false;
    }
    const distCutoff = 0.05 * this.avgEdgeLength(edge1, edge2);

    const allPts = [edge1.start, edge1.end, edge2.start, edge2.end],
      lrPairs = [
        [edge1.start, edge2.start],
        [edge1.start, edge2.end],
        [edge1.end, edge2.start],
        [edge1.end, edge2.end],
      ],
      dists = _.map(lrPairs, ([p1, p2]) =>
        helpers.distanceBetweenPoints(p1, p2)
      ),
      farthestPair = this.findFarthestApartPair(...allPts);
    if (_.min(dists) < distCutoff) {
      return {
        mergeType: "edgesExtend",
        newVertexOrder: this.consolidateVertices(...farthestPair, ...allPts),
      };
    }

    return false;
  },
  edgesCombine(edge1, edge2) {
    /*

      o------------o
           o---------------o
    */
    if (!helpers.haveSimilarAngles(edge1, edge2)) {
      return false;
    }
    // if close enough
    let left, right; // eslint-disable-line one-var-declaration-per-line
    if (this.edgesCombine_LeftBeforeRight(edge1, edge2)) {
      left = edge1;
      right = edge2;
    } else if (this.edgesCombine_LeftBeforeRight(edge2, edge1)) {
      left = edge1;
      right = edge2;
    } else {
      return false;
    }

    // project onto the direction with most variance to get order
    // then output that order
    const [p1, p2] = this.findFarthestApartPair(
        left.start,
        left.end,
        right.start,
        right.end
      ),
      dirWithMostVar = { p1, p2 },
      leftMiddle = helpers.projectionOfPointToLine(right.start, dirWithMostVar),
      rightMiddle = helpers.projectionOfPointToLine(left.end, dirWithMostVar);
    return {
      mergeType: "combine",
      newVertexOrder: this.consolidateVertices(
        p1,
        p2,
        left.start,
        right.end,
        leftMiddle,
        rightMiddle
      ),
    };
  },
  edgesCombine_LeftBeforeRight(left, right) {
    const avgEdgeLength = this.avgEdgeLength(left, right),
      distCutoff = 0.05 * avgEdgeLength,
      { dist: leftEndDist } = helpers.pointDistanceToSegment(left.end, right),
      { dist: rightStartDist } = helpers.pointDistanceToSegment(
        right.start,
        left
      );

    return Math.min(leftEndDist, rightStartDist) < distCutoff;
  },
  avgEdgeLength({ start: start1, end: end1 }, { start: start2, end: end2 }) {
    return (
      (helpers.distanceBetweenPoints(start1, end1) +
        helpers.distanceBetweenPoints(start2, end2)) /
      2
    );
  },
  findFarthestApartPair(...points) {
    const pairs = allPairs(points);
    return _.maxBy(pairs, ([p1, p2]) => helpers.distanceBetweenPoints(p1, p2));
  },
  endpointsNearby(edge1, edge2) {
    /*

      o---------------------o
     o----------------------o

    */
    const { start: start1, end: end1 } = edge1;
    const { start: start2, end: end2 } = edge2;
    const avgEdgeLen = this.avgEdgeLength(edge1, edge2);

    const startDist = helpers.distanceBetweenPoints(start1, start2);
    const endDist = helpers.distanceBetweenPoints(end1, end2);

    if (startDist < 0.05 * avgEdgeLen && endDist < 0.05 * avgEdgeLen) {
      return { mergeType: "sameEndpoints" };
    }

    const startEndDist = helpers.distanceBetweenPoints(start1, end2);
    const endStartDist = helpers.distanceBetweenPoints(end1, start2);

    if (startEndDist < 0.05 * avgEdgeLen && endStartDist < 0.05 * avgEdgeLen) {
      return { mergeType: "reverseEndpoints" };
    }

    return false;
  },
  consolidateVertices(start, end, ...interveningPts) {
    const distCutoff = 0.05 * helpers.distanceBetweenPoints(end, start),
      finalPts = [start, end],
      // First, make sure we're considering points in order left-to-right
      intervening = _.sortBy(interveningPts, (pt) =>
        helpers.distanceBetweenPoints(pt, start)
      );

    // now, consider each point for inclusion. A point will be included if it's
    // farther than distCutoff from every point so far.
    intervening.forEach((pt) => {
      if (
        _.every(
          finalPts,
          (fp) => helpers.distanceBetweenPoints(pt, fp) > distCutoff
        )
      ) {
        finalPts.push(pt);
      }
    });

    // Now put the 'end' back at the end.
    finalPts.push(finalPts.splice(1, 1)[0]);
    return finalPts;
  },
};
