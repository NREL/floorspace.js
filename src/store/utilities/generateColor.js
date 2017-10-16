import appconfig from './../modules/application/appconfig';

const typeIndices = {};

export default function colorFactory(type) {
  typeIndices[type] = (typeIndices[type] || 0) + 1;
  return appconfig.palette.colors[typeIndices[type] % appconfig.palette.colors.length];
}
