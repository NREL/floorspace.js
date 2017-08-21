# Snapping

modes (?):
- Snap to grid and vertices only (no shift)
- Snap to grid, vertices, 'synthetic' points, edges, (sizes, midpoints?)

considerations:
- On moving a polygon we need to snap with awareness of all verts on polygon.
- should the eraser snap?
- Snapping to an edge, or to 'synthetic' points, should only restrict a single dimension: line snapping.
- try to satisfy multiple constraints at once (eg, a line and a point)?
- pixels are probably the wrong dimensions to use for these calculations (hard to tell which is a grid component)
- Snapping to both crooked edge *and* grid point. Might not intersect except at
  endpoints of edges. Do we snap to intersection with grid _line_? (not just grid point?) https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/599b11844353e9e75f6c9c8b/5cd57f09b6c2e8721dde4b62a9dad5dc/capture.png
- synthetic edges only for rectangles

SnapTarget:
  - dx, dy offsets from cursor position (only one of these for edges? what about diagonal edges? maybe something like (5 + 4*t, 3 + 2*t)? Am I writing a prolog?)
  - distance
  - x, y absolute positions (for high lighting)
  - type? (gridpoint, vertex, edge, synthetic edge)

snapTargets(vertices, gridSpacing, location) -> [SnapTarget]
  - consider nearby grid points and (nearby?) existing vertices
  - for each one, find the dx, dy necessary to bring us to that location
  - sort by magnitude of vector
  - can multiple be satisfied?
  - (allow tab-ing between options?)

highlightSnapTarget(snapTarget)
  - emphasize the absolute position of that target

on click, choose the currently highlighted snap target?

Examples

- Should we allow snapping to edges? It frees the user to put a vertex *anywhere* (see video: https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/599b0cb915b6ae80bff92998/44a5c0bc2cd920cb15454c202307ded5/recording.webm and also https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/599b1003e20cf0bae65fbac6/0807dfdb794dc47d3fa53e9bc516a934/recording.webm)
-
