const
  pack = require('./package.json')['version'],
  schema = require('./schema/geometry_schema.json')['version'],
  version = require('./src/version.js');

if (pack !== schema || schema !== version) {
  console.error('version numbers in package.json, geometry_schema.json and version.js disagree!');
  console.log('package.json:', pack);
  console.log('geometry_schema.json:', schema);
  console.log('version.js', version);
  process.exit(1);
}

function success(message) {
  console.log('\x1b[32m' + message + '\x1b[0m');
}

success('package.json:         ' + pack);
success('geometry_schema.json: ' + schema);
success('version.js:           ' + version);
