export function number(n) { return +n; }
export function bool(b) { return b.toLowerCase() === 'true'; }
export function gt0orNull(n) { return +n || null; }
