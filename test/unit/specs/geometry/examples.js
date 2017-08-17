export const emptyGeometry = {
  id: 2, vertices: [], edges: [], faces: []
};

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
export const simpleGeometry = {
  /* eslint-disable */
  id: 1,
  vertices: [
    {id: 'f', x: 0, y: 0},
    {id: 'g', x: 10, y: 0},
    {id: 'c', x: 0, y: 10},
    {id: 'd', x: 4, y: 10},
    {id: 'e', x: 10, y: 10},
    {id: 'a', x: 0, y: 16},
    {id: 'b', x: 4, y: 16},
  ],
  edges: [
    'ab', 'ac', 'bd', 'cd', 'eg', 'gf', 'fc', 'ce',
  ].map(id => ({ id, v1: id[0], v2: id[1] })),
  faces: [
    {id: 'top', edgeRefs: [
      {edge_id: 'ab', reverse: false},
      {edge_id: 'bd', reverse: false},
      {edge_id: 'cd', reverse: true},
      {edge_id: 'ac', reverse: true},
    ]},
    {id: 'bottom', edgeRefs: [
      {edge_id: 'ce', reverse: false},
      {edge_id: 'eg', reverse: false},
      {edge_id: 'gf', reverse: false},
      {edge_id: 'fc', reverse: false},
    ]},
  ],
  /* eslint-enable */
};

// https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/598b63629862dc7224f4df8c/1bc285908438ddc20e64c55752191727/capture.png
export const preserveRectangularityGeometry = {
  /* eslint-disable */
  "id":"2","vertices":[
    {"id":"4","x":0,"y":-4.0358709153},{"id":"5","x":3,"y":-4.0358709153},
    {"id":"6","x":3,"y":0},{"id":"7","x":0,"y":0},{"id":"14","x":7,"y":0},
    {"id":"15","x":7,"y":-4},{"id":"39","x":8,"y":1},{"id":"78","x":0,"y":1},
    {"id":"38","x":8,"y":-4}
  ],"edges":[
    {"id":"8","v1":"4","v2":"5"},{"id":"9","v1":"5","v2":"6"},
    {"id":"10","v1":"6","v2":"7"},{"id":"11","v1":"7","v2":"4"},
    {"id":"16","v1":"6","v2":"14"},{"id":"17","v1":"14","v2":"15"},
    {"id":"18","v1":"15","v2":"5"},{"id":"79","v1":"39","v2":"78"},
    {"id":"80","v1":"78","v2":"7"},{"id":"41","v1":"15","v2":"38"},
    {"id":"42","v1":"38","v2":"39"},{"id":"83","v1":"7","v2":"6"},
    {"id":"84","v1":"6","v2":"14"}],
  "faces":[
    {"id":"12","edgeRefs":[{"edge_id":"8","reverse":false},{"edge_id":"9","reverse":false},{"edge_id":"10","reverse":false},{"edge_id":"11","reverse":false}]},
    {"id":"19","edgeRefs":[{"edge_id":"16","reverse":false},{"edge_id":"17","reverse":false},{"edge_id":"18","reverse":false},{"edge_id":"9","reverse":false}]},
    {"id":"82","edgeRefs":[{"edge_id":"79","reverse":false},{"edge_id":"80","reverse":false},{"edge_id":"83","reverse":false},{"edge_id":"84","reverse":false},{"edge_id":"17","reverse":false},{"edge_id":"41","reverse":false},{"edge_id":"42","reverse":false}
  ]}]
  /* eslint-enable */
};

export const neg5by5Rect = {
  id: 3,
  vertices: [
    { x: 0, y: 0, id: 'origin' }, { x: -5, y: 0, id: '(-5, 0)' },
    { x: -5, y: -5, id: '(-5, -5)' }, { x: 0, y: -5, id: '(0, -5)' }],
  edges: [
    { id: 'top', v1: 'origin', v2: '(-5, 0)' },
    { id: 'left', v1: '(-5, 0)', v2: '(-5, -5)' },
    { id: 'bottom', v1: '(-5, -5)', v2: '(0, -5)' },
    { id: 'right', v1: '(0, -5)', v2: 'origin' }],
  faces: [],
};
