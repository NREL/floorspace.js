import _ from "lodash";

export function number(n, col) {
  if (n === "" || n === null) {
    return _.has(col, "default") ? col.default : col.nullable ? null : 0;
  }
  return +n;
}
export function bool(b) {
  return typeof b === typeof true ? b : b.toLowerCase() === "true";
}
export function gt0orNull(n) {
  return +n || null;
}
