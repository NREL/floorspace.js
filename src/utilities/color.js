export function brightness(r, g, b) {
  // returns a value in 0..255 representing perceived brightness
  // according to https://trendct.org/2016/01/22/how-to-choose-a-label-color-to-contrast-with-background/

  return (r * 299 + g * 587 + b * 114) / 1000;
}
