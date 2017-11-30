const _ = require('lodash');

function checkGeometry(geom) {
  const errors = [];
  const vertVals = _.map(geom.vertices, v => _.pick(v, ['x', 'y']));
  if (_.uniqBy(vertVals, JSON.stringify).length < vertVals.length) {
    errors.push('we got a duplicate vertex here!');
  }

  // geom.faces.forEach((face) => {
  //   var faceVerts = _.map(face.vertices, v => _.pick(v, ['x', 'y']));
  // });
  return errors;
}


exports.assertion = function () {
  this.message = 'Checking for duplicate vertices, faces that fold back on themselves';
  this.expected = 'all good';
  this.pass = function (val) {
    if (val !== this.expected) {
      console.error('pass func, val is ', val);
    }
    return val === this.expected;
  };
  this.value = function (res) {
    console.log('top of value, res.value is', res.value);
    const errors = _.flatMap(res.value, checkGeometry);
    if (errors.length === 0) {
      return this.expected;
    }
    errors.forEach(e => console.error('value func, e is ', e));
    return errors.join('\n');
  };
  this.command = function (cb) {
    const self = this;
    return this.api.execute(
      () => window.application.$store.getters['geometry/denormalized'],
      [],
      (res) => {
        cb.call(self, res);
      });
  };
};
