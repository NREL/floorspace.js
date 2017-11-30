import _ from 'lodash';
import { ptsAreCollinear, distanceBetweenPoints } from '../store/modules/geometry/helpers';

export default function checkGeometry(geom) {
  const
    errors = [],
    vertPos = v => `${v.x}:${v.y}`,
    vertPosToId = _.fromPairs(geom.vertices.map(v => [vertPos(v), v.id]));

  geom.vertices.forEach((vert) => {
    if (vert.id !== vertPosToId[vertPos(vert)]) {
      errors.push(`vertex ${vert.id} is a duplicate of ${vertPosToId[vertPos(vert)]}`);
    }
  });

  geom.edges.forEach((edge) => {
    if (
      edge.v1.id === edge.v2.id ||
      vertPos(edge.v1) === vertPos(edge.v2)
    ) {
      errors.push(`edge ${edge.id} is of length zero`);
    }
  });

  geom.faces.forEach((face) => {
    face.vertices
      .map((v, ix, a) => [
        a[ix === 0 ? a.length - 1 : ix - 1],
        a[ix],
        a[(ix + 1) % a.length],
      ])
      .forEach(([fst, snd, thd]) => {
        if (
          ptsAreCollinear(fst, snd, thd) &&
          distanceBetweenPoints(fst, snd) > distanceBetweenPoints(fst, thd)
        ) {
          errors.push(`face ${face.id} has a backwards section (${JSON.stringify(fst)} -> ${JSON.stringify(snd)} -> ${JSON.stringify(thd)})`);
        }
      });
  });
  return errors;
}
