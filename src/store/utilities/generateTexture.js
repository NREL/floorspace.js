import { textures } from './../modules/application/appconfig';

const typeIndices = {};

export default function nextTextureForType(type) {
  typeIndices[type] = (typeIndices[type] || 0) + 1;
  return textures[typeIndices[type] % textures.length];
}
