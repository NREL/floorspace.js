exports.assertion = function () {
  this.message = 'Checking for duplicate vertices, empty edges, and faces that fold backwards';
  this.expected = 'all good';
  this.pass = function (val) {
    return val === this.expected;
  };
  this.value = function (res) {
    const errors = res.value;
    if (errors.length === 0) {
      return this.expected;
    }
    return errors.join('\n');
  };
  this.command = function (cb) {
    const self = this;
    return this.api.execute(
      () => window.application.$store.getters['geometry/errors'],
      [],
      (res) => {
        cb.call(self, res);
      });
  };
};
