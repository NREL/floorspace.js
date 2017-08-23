const
  pack = require('./package.json'),
  schema = require('./schema/geometry_schema.json'),
  version = require('./src/version.js');

if (pack !== schema || schema !== version) {
  console.error('version numbers in package.json, geometry_schema.json and version.js disagree!');
  process.exit(1);
}
