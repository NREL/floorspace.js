import { textures } from './../modules/application/appconfig';

const typeIndices = {};

export default function nextTextureForType(type) {
  typeIndices[type] = (typeIndices[type] || 0) + 1;
  console.log('sending out a ', textures[typeIndices[type] % textures.length]);
  return textures[typeIndices[type] % textures.length];
}
