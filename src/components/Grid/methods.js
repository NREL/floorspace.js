// Floorspace.js, Copyright (c) 2016-2017, Alliance for Sustainable Energy, LLC. All rights reserved.
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
// (1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
// (2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
// (3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import * as d3 from 'd3';
import polylabel from 'polylabel';
import _ from 'lodash';
import { snapTargets, snapWindowToEdge, snapToVertexWithinFace, findClosestEdge, findClosestWindow, gridSnapTargets, vertexSnapTargets } from './snapping';
import geometryHelpers, { distanceBetweenPoints, fitToAspectRatio, projectionOfPointToLine } from './../../store/modules/geometry/helpers';
import modelHelpers from './../../store/modules/models/helpers';

function ticksInRange(start, stop, spacing) {
  return _.range(
    Math.ceil(start / spacing) * spacing,
    stop,
    spacing);
}

function transformDiff(t1, t2) {
  // returns a new transform that is sufficient to take you from
  // t1 to t2.
  // boy was this a doozy to figure out. Tricky bit is that the
  // translation is dependent on the scaling factor. So we have to
  // divide that out before we can subtract.
  return new d3.zoomIdentity.constructor(
    t2.k / t1.k,
    (t2.x / t2.k - t1.x / t1.k) * t2.k,
    (t2.y / t2.k - t1.y / t1.k) * t2.k,
  );
}


export default {
  // ****************** USER INTERACTION EVENTS ****************** //
  /*
  * handle a click on the svg grid
  */
  gridClicked() {
    if (this.currentTool === 'Eraser' ||
    ((this.currentTool === 'Rectangle' || this.currentTool === 'Polygon') && (this.currentSpace || this.currentShading))) {
      this.addPoint();
    }
    if (this.currentTool === 'Place Component') {
      this.placeOrSelectComponent();
    }
    if (this.currentTool === 'Image') {
      this.deselectImages();
    }
    if (this.currentTool === 'Apply Property') {
      this.assignProperty();
    }
  },
  assignProperty() {
    if (!this.currentSpaceProperty) { return; }
    const
      gridCoords = d3.mouse(this.$refs.grid),
      gridPoint = { x: gridCoords[0], y: gridCoords[1] },
      rwuPoint = this.gridPointToRWU(gridPoint),
      space = this.currentStory.spaces.find((sp) => {
        const face = _.find(this.denormalizedGeometry.faces, { id: sp.face_id });
        if (!face) {
          // this space has no geometry. It can't be the one that was clicked.
          return false;
        }
        return geometryHelpers.pointInFace(rwuPoint, face.vertices);
      });
    if (!space) { return; }
    this.$store.dispatch('models/updateSpaceWithData', {
      space,
      [this.spacePropertyKey]: this.currentSpaceProperty.id,
    });
  },
  deselectImages() {
    this.$store.dispatch('application/setCurrentSubSelectionId', this.currentStory.spaces[0]);
  },
  componentToSelect() {
    const
      gridCoords = d3.mouse(this.$refs.grid),
      gridPoint = { x: gridCoords[0], y: gridCoords[1] },
      rwuPoint = this.gridPointToRWU(gridPoint),
      component = _.minBy(
        this.currentComponentTypeLocs(rwuPoint),
        ci => distanceBetweenPoints(ci, rwuPoint)),
      distToComp = component && distanceBetweenPoints(component, rwuPoint);
    if (!component || distToComp > this.spacing / 2) {
      return null;
    }
    return component;
  },
  handleKeyDown(e) {
    if ((e.keyCode === 8 || e.keyCode === 46) &&
        !_.includes(['input', 'textarea'], document.activeElement.tagName.toLowerCase())) {
      this.deleteElement();
    }
  },
  deleteElement() {
    if (this.modeTab === 'components') {
      this.removeSelectedComponent();
    }
  },
  removeSelectedComponent() {
    const component = this.currentComponentInstance;
    if (!component) {
      return;
    }
    const payload = { story_id: this.currentStory.id, object: { id: component.id } };
    if (component.type === 'windows') {
      this.$store.dispatch('models/destroyWindow', payload);
    } else if (component.type === 'daylighting_controls') {
      this.$store.dispatch('models/destroyDaylightingControl', payload);
    } else if (component.type === 'doors') {
      this.$store.dispatch('models/destroyDoor', payload);
    } else {
      console.error(`unrecognized component to remove: ${component}`);
    }
  },
  placeOrSelectComponent() {
    // hold down shift to force placement when we might otherwise select
    const toSelect = d3.event.shiftKey ? false : this.componentToSelect();
    if (toSelect) {
      this.currentComponentInstanceId = toSelect.id;
      return;
    }
    // user is holding shift, or we didn't find a component to select
    // => we're placing
    if (this.currentComponentType === 'daylighting_control_definitions') {
      this.placeDaylightingControl();
    } else if (
        this.currentComponentType === 'window_definitions' ||
        this.currentComponentType === 'door_definitions'
    ) {
      this.placeWindowOrDoor();
    } else {
      throw new Error(`unrecognized componentType: ${this.currentComponentType}`);
    }
  },
  highlightComponentToSelect() {
    if (d3.event.shiftKey) {
      return null;
    }
    const component = this.componentToSelect();
    this.componentFacingSelection = component && component.id;
    if (!component) {
      // do no highlighting
    } else if (component.type === 'windows' || component.type === 'doors') {
      this.highlightWindowGuideline(component);
    } else if (component.type === 'daylighting_controls') {
      this.highlightDaylightingControlGuideline(component);
    } else {
      throw new Error(`unrecognized componentType: ${this.currentComponentType}`);
    }
    return component;
  },
  placeWindowOrDoor() {
    const
      gridCoords = d3.mouse(this.$refs.grid),
      gridPoint = { x: gridCoords[0], y: gridCoords[1] },
      rwuPoint = this.gridPointToRWU(gridPoint),
      loc = snapWindowToEdge(
        this.snapMode,
        this.spaceEdges, rwuPoint,
        this.currentComponentDefinition, this.spacing * 2, this.spacing,
      ),
      windowOrDoor = this.currentComponentType === 'window_definitions' ? 'Window' : 'Door';

    if (!loc) { return; }

    const payload = {
      story_id: this.currentStory.id,
      edge_id: loc.edge_id,
      [`${windowOrDoor.toLowerCase()}_definition_id`]: this.currentComponentDefinition.id,
      alpha: loc.alpha,
    };
    this.$store.dispatch(`models/create${windowOrDoor}`, payload);
  },
  raiseOrLowerImages() {
    if (this.currentTool === 'Image') {
      d3.select('#grid svg .images').raise();
    } else {
      d3.select('#grid svg .images').lower();
    }
  },
  placeDaylightingControl() {
    const
      gridCoords = d3.mouse(this.$refs.grid),
      gridPoint = { x: gridCoords[0], y: gridCoords[1] },
      rwuPoint = {
        x: this.gridToRWU(gridPoint.x, 'x'),
        y: this.gridToRWU(gridPoint.y, 'y'),
      },
      loc = snapToVertexWithinFace(
        this.snapMode,
        this.spaceFaces, rwuPoint, this.spacing);

    if (!loc) { return; }

    const payload = {
      story_id: this.currentStory.id,
      face_id: loc.face_id,
      daylighting_control_definition_id: this.currentComponentDefinition.id,
      ...loc,
    };
    this.$store.dispatch('models/createDaylightingControl', payload);
  },
  /*
  * If the grid is clicked when a drawing tool or the eraser tool is active, add a point to the component
  * if the new point completes a face being drawn, save the face
  * if the new point completes an eraser selection, call the eraseRectangularSelection method
  */
  addPoint() {
    // location of the mouse in grid units
    const
      gridCoords = d3.mouse(this.$refs.grid),
      gridPoint = { x: gridCoords[0], y: gridCoords[1] },
      snapTarget = this.findSnapTarget(gridPoint);

    // if the snapTarget is the origin of the face being drawn in Polygon mode, close the face and don't add a new point
    if (snapTarget.type === 'vertex' && snapTarget.origin && this.currentTool === 'Polygon') {
      this.savePolygonFace();
      return;
    }

    // create the point
    const newPoint = snapTarget.type === 'edge' ? snapTarget.projection : snapTarget;
    this.points.push(newPoint);
    this.drawPoints();
    // if the Rectangle or Eraser tool is active and two points have been drawn (to define a rectangle)
    // complete the corresponding operation for the tool
    if (this.currentTool === 'Eraser' && this.points.length === 2) { this.eraseRectangularSelection(); }
    if (this.currentTool === 'Rectangle' && this.points.length === 2) { this.saveRectangularFace(); }
  },

  /*
  * When a mousemove event is triggered on the grid and
  * the 'Rectangle' or 'Polygon' tool is active and a space or shading is selected or the 'Eraser' tool is active
  * look up the snap target for the location of the event, highlight it, and render a guide point
  * if there is no snap target, use the event location
  */
  highlightSnapTarget(e) {
    // only highlight snap targets in drawing modes when a space or shading has been selected
    if (!(this.currentTool === 'Eraser' ||
    (this.currentTool === 'Place Component' && this.currentComponentDefinition) ||
    ((this.currentTool === 'Rectangle' || this.currentTool === 'Polygon') && (this.currentSpace || this.currentShading)))) { return; }

    // unhighlight expired snap targets
    this.clearHighlights();

    // location of the mouse in grid units

    let gridPoint;
    if (d3.event instanceof MouseEvent) {
      // d3.mouse() will fail if d3.event is a ZoomEvent, or other
      const gridCoords = d3.mouse(this.$refs.grid);
      gridPoint = { x: gridCoords[0], y: gridCoords[1] };
    } else {
      gridPoint = this.lastMousePosition;
    }
    if (!gridPoint) {
      return;
    }

    if (this.currentTool === 'Place Component') {
      this.highlightComponentToPlaceOrSelect(gridPoint);
      return;
    }

    const snapTarget = this.findSnapTarget(gridPoint);

    // render a line and point showing which geometry would be created with a click at this location
    const guidePoint = snapTarget.type === 'edge' ? snapTarget.projection :
      snapTarget;

    const ellipsePoint = snapTarget.synthetic ? snapTarget.originalPt : guidePoint;
    this.drawGuideLines(e, guidePoint);


    // if snapping to an edisting edge or radius, draw a larger point, if snapping to the grid or just displaying the location of the pointer, create a small point
    if (snapTarget.type === 'vertex') {
      d3.select('#grid svg')
      .append('ellipse')
      .attr('cx', this.rwuToGrid(ellipsePoint.x, 'x'))
      .attr('cy', this.rwuToGrid(ellipsePoint.y, 'y'))
      .attr('rx', 5)
      .attr('ry', 5)
      .classed('highlight', true)
      .attr('data-transform-plz', '')
      .attr('vector-effect', 'non-scaling-stroke');
    } else {
      d3.select('#grid svg')
      .append('ellipse')
      .attr('cx', this.rwuToGrid(ellipsePoint.x, 'x'))
      .attr('cy', this.rwuToGrid(ellipsePoint.y, 'y'))
      .attr('rx', 3)
      .attr('ry', 3)
      .classed('gridpoint', true)
      .attr('data-transform-plz', '')
      .attr('vector-effect', 'non-scaling-stroke');
    }

    // in drawing modes, highlight edges that would be snapped to
    if (snapTarget.type === 'edge' && this.currentTool !== 'Eraser') {
      d3.select('#grid svg')
      .append('line')
      .attr('x1', this.rwuToGrid(snapTarget.v1GridCoords.x, 'x'))
      .attr('y1', this.rwuToGrid(snapTarget.v1GridCoords.y, 'y'))
      .attr('x2', this.rwuToGrid(snapTarget.v2GridCoords.x, 'x'))
      .attr('y2', this.rwuToGrid(snapTarget.v2GridCoords.y, 'y'))
      .attr('stroke-width', 1)
      .classed('highlight', true)
      .attr('data-transform-plz', '')
      .attr('vector-effect', 'non-scaling-stroke');
    }
    // save off mouse pos so that we can redo highlight if zoom occurs during
    // point drawing.
    this.lastMousePosition = gridPoint;
  },

  clearHighlights() {
    d3.selectAll('#grid .highlight, #grid .gridpoint, #grid .guideline').remove();
    this.componentFacingSelection = null;
  },
  clearComponentHighlights() {
    d3.selectAll('#grid .highlight, #grid .component-guideline').remove();
    this.componentFacingSelection = null;
  },
  highlightComponentToPlaceOrSelect(gridPoint) {
    if (this.highlightComponentToSelect()) {
      return;
    }
    // no component to select, let's highlight one to place.
    this.highlightComponentToPlace(gridPoint);
  },

  highlightComponentToPlace(gridPoint) {
    if (this.currentComponentType === 'window_definitions') {
      this.highlightWindow(gridPoint);
    } else if (this.currentComponentType === 'daylighting_control_definitions') {
      this.highlightDaylightingControl(gridPoint);
    } else if (this.currentComponentType === 'door_definitions') {
      this.highlightDoor(gridPoint);
    } else {
      throw new Error(`unrecognized componentType: ${this.currentComponentType}`);
    }
  },

  highlightWindow(gridPoint) {
    const
      rwuPoint = this.gridPointToRWU(gridPoint),
      loc = snapWindowToEdge(
        this.snapMode,
        this.spaceEdges, rwuPoint,
        this.currentComponentDefinition, this.spacing * 2, this.spacing,
      );

    if (!loc) { return; }

    if (
      this.currentComponentDefinition.window_definition_mode !== 'Single Window' &&
      _.filter(this.windowCenterLocs(rwuPoint), { edge_id: loc.edge_id })
        .filter(w => w.window_definition_mode !== 'Single Window')
        .length
    ) {
      // We only want to allow selecting edge-long windows, not replacing with
      // other edge-long windows, since that could be confusing:
      // "Am I selecting or replacing that one?"
      return;
    }
    d3.select('#grid svg')
      .append('g')
      .classed('highlight', true)
      .selectAll('.window')
      .data([{
        ...loc,
        window_definition_mode: this.currentComponentDefinition.window_definition_mode,
        width: this.currentComponentDefinition.width,
        spacing: this.currentComponentDefinition.window_spacing,
        texture: this.currentComponentDefinition.texture,
      }])
      .call(this.drawWindow);
    this.highlightWindowGuideline(loc);
  },
  highlightDoor(gridPoint) {
    const
      rwuPoint = this.gridPointToRWU(gridPoint),
      loc = snapWindowToEdge(
        this.snapMode,
        this.spaceEdges, rwuPoint,
        this.currentComponentDefinition, this.spacing * 2, this.spacing,
      );

    if (!loc) { return; }

    d3.select('#grid svg')
      .append('g')
      .classed('highlight', true)
      .selectAll('.window')
      .data([{
        ...loc,
        window_definition_mode: null,
        windowOrDoor: 'door',
        width: this.currentComponentDefinition.width,
        texture: this.currentComponentDefinition.texture,
      }])
      .call(this.drawWindow);
    this.highlightWindowGuideline(loc);
  },
  highlightWindowGuideline(loc) {
    d3.select('#grid svg')
      .append('g')
      .classed('guideline', true)
      .selectAll('.window-guideline')
      .data([loc])
      .call(this.drawWindowGuideline);
  },
  highlightDaylightingControl(gridPoint) {
    const
      rwuPoint = this.gridPointToRWU(gridPoint),
      loc = snapToVertexWithinFace(
        this.snapMode,
        this.spaceFaces, rwuPoint,
        this.spacing,
      );
    if (!loc) { return; }
    d3.select('#grid svg')
      .append('g')
      .classed('highlight', true)
      .selectAll('.daylighting-control')
      .data([loc])
      .call(this.drawDaylightingControl);

    this.highlightDaylightingControlGuideline(loc);
  },
  highlightDaylightingControlGuideline(loc) {
    const
      face = _.find(this.denormalizedGeometry.faces, { id: loc.face_id }),
      windows = this.windowsOnFace(face),
      nearestEdge = findClosestWindow(windows, loc) || findClosestEdge(face.edges, loc);
    d3.select('#grid svg')
      .append('g')
      .classed('guideline', true)
      .selectAll('.daylighting-control-guideline')
      .data([{ loc, nearestEdge }])
      .call(this.drawDaylightingControlGuideline);
  },

  /*
  * called on mousemove events, shows the user what geometry will be created by clicking at the current mouse location by
  * drawing a guide rectangle or a guideline between the last point drawn and the guidepoint
  */
  drawGuideLines(e, guidePoint) {
    if (!this.points.length) { return; }

    // remove expired guideline paths and text
    this.eraseGuidelines();

    let guidelinePoints, guidelinePaths;

    // if the polygon tool is active, draw a line connecting the last point in the polygon to the guide point
    // if the rectangle or eraser tool is active, infer a rectangle from the first point that was drawn and the guide point
    if (this.currentTool === 'Polygon') {
      guidelinePoints = [guidePoint, this.points[this.points.length - 1]];
      guidelinePaths = [guidelinePoints];
    } else if (this.currentTool === 'Rectangle' || this.currentTool === 'Eraser') {
      guidelinePoints = [
        this.points[0],
        { x: guidePoint.x, y: this.points[0].y },
        guidePoint,
        { x: this.points[0].x, y: guidePoint.y },
        this.points[0],
      ];

      guidelinePaths = [
        [guidelinePoints[0], guidelinePoints[1]],
        [guidelinePoints[1], guidelinePoints[2]],
      ];
    }

    const
      guidelineArea = this.currentTool === 'Polygon' ? [...this.points, guidePoint, this.points[0]] : guidelinePoints,
      guidelinePolys = [guidelineArea, this.points],
      svg = d3.select('#grid svg');

    // render a guideline or rectangle
    svg.selectAll('.guideline-line')
    .append('path')
    .datum(guidelinePoints)
    .attr('fill', 'none')
    .classed('guideline guideline-line', true)
    .attr('vector-effect', 'non-scaling-stroke')
    .attr('data-transform-plz', '')
    .attr('d', d3.line().x(d => this.rwuToGrid(d.x, 'x'))
                        .y(d => this.rwuToGrid(d.y, 'y')))
    .lower();

    // render unfinished area polygon(s)
    svg.selectAll('.guideline-area')
    .data(guidelinePolys)
    .enter()
    .append('polygon')
    .attr('points', d => d.map(p =>
        [this.rwuToGrid(p.x, 'x'), this.rwuToGrid(p.y, 'y')]
        .join(','),
      ).join(' '))
    .classed('guideline guideline-area guideLine', true)
    .attr('vector-effect', 'non-scaling-stroke')
    .attr('data-transform-plz', '')
    .attr('fill', () => {
      if (this.currentTool === 'Eraser') { return 'none'; }
      if (this.currentSpace) { return this.currentSpace.color; }
      if (this.currentShading) { return this.currentShading.color; }
      return null;
    });

    // don't render area/distance when erasing
    if (this.currentTool === 'Eraser') { return; }

    // render gridline distance(s)
    svg.selectAll('.guideline-text')
    .data(guidelinePaths)
    .enter()
    .append('text')
    .attr('x', d => this.rwuToGrid(d[0].x, 'x') + (this.rwuToGrid(d[1].x, 'x') - this.rwuToGrid(d[0].x, 'x')) / 2)
    .attr('y', d => this.rwuToGrid(d[0].y, 'y') + (this.rwuToGrid(d[1].y, 'y') - this.rwuToGrid(d[0].y, 'y')) / 2)
    .attr('dx', -1.25 * (this.transform.k > 1 ? 1 : this.transform.k) + 'em')
    .attr('data-transform-plz', '')
    .text((d) => {
      const dist = this.distanceBetweenPoints(d[0], d[1]);
      return dist ? dist.toFixed(2) : '';
    })
    .classed('guideline guideline-text guideline-dist', true)
    .attr('font-family', 'sans-serif')
    .attr('fill', 'red')
    .style('font-size', '1em');

    if (guidelineArea.length > 3) {
      const
        areaPoints = guidelineArea.map((p) => {
          const x = p.x, y = p.y;
          return { x, y, X: x, Y: y };
        }),
        { x, y, area } = this.polygonLabelPosition(areaPoints),
        areaTextNoUnits = area ? area.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : '',
        areaText = `${areaTextNoUnits} ${this.units === 'ip' ? 'ft' : 'm'}²`;

      if (x === null || y === null) {
        // either polygon has 0 area or something went wrong --> don't draw area text
        return;
      }

      // render unfinished area #
      svg.append('text')
      .attr('x', this.rwuToGrid(x, 'x'))
      .attr('y', this.rwuToGrid(y, 'y'))
      .text(areaText)
      .classed('guideline guideline-text guideline-area-text guideLine', true)
      .attr('data-transform-plz', '')
      .attr('text-anchor', 'middle')
      .attr('font-family', 'sans-serif')
      .attr('fill', 'red')
      .style('font-size', '1em')
      .raise();
    }

    d3.selectAll('.vertical, .horizontal').lower();
  },
  /*
  * Erase any drawn guidelines
  */
  eraseGuidelines() {
    d3.selectAll('#grid .guideline').remove();
  },
  /*
  * Handle escape key presses to cancel current drawing operation
  */
  escapeAction(e) {
    if (e.code === 'Escape' || e.which === 27) {
      this.points = [];
      this.clearHighlights();
      d3.selectAll('#grid .point-path').remove();
    }
  },
  // ****************** SAVING FACES ****************** //
  /*
  * The origin of the polygon being drawn was clicked, create a polygon face from all points on the grid
  * translate the points into RWU and save the face for the selected space or shading
  */
  savePolygonFace() {
    this.clearHighlights();
    d3.selectAll('#grid .point-path').remove();

    const payload = {
      points: [...this.points],
    };

    if (this.currentSpace) {
      payload.model_id = this.currentSpace.id;
    } else if (this.currentShading) {
      payload.model_id = this.currentShading.id;
    }

    this.$store.dispatch('geometry/createFaceFromPoints', payload);

    // clear points from the grid
    this.points = [];
  },

  /*
  * create a rectangular face from the two points on the grid
  * save the rectangle as a face for the selected space or shading
  */
  saveRectangularFace() {
    this.clearHighlights();
    d3.selectAll('#grid .point-path').remove();

    // infer 4 corners of the rectangle based on the two points that have been drawn
    const payload = {};

    payload.points = [
      this.points[0],
      { x: this.points[1].x, y: this.points[0].y },
      this.points[1],
      { x: this.points[0].x, y: this.points[1].y },
    ];

    if (this.currentSpace) {
      payload.model_id = this.currentSpace.id;
    } else if (this.currentShading) {
      payload.model_id = this.currentShading.id;
    }
    this.$store.dispatch('geometry/createFaceFromPoints', payload);

    // clear points from the grid
    this.points = [];
  },

  // ****************** ERASING FACES ****************** //
  /*
  * called when 2 points have been created on the grid and the eraser tool is active
  * infer a rectangular eraser selection based on two points on the grid
  * remove the intersection of all geometry on the current story with the eraser selection
  */
  eraseRectangularSelection() {
    // infer 4 corners of the rectangle based on the two points that have been drawn
    this.clearHighlights();
    d3.selectAll('#grid .point-path').remove();

    const payload = {
      points: [
        this.points[0],
        { x: this.points[1].x, y: this.points[0].y },
        this.points[1],
        { x: this.points[0].x, y: this.points[1].y },
      ],
    };

    this.$store.dispatch('geometry/eraseSelection', payload);

    // clear points from the grid
    this.points = [];
  },


  // ****************** d3 RENDERING ****************** //
  /*
  * render points for the face being drawn, connect them with a guideline
  */
  drawPoints() {
    // remove expired points and guidelines
    d3.selectAll('#grid .point-path').remove();

    // draw points
    const pointPath = d3.select('#grid svg')
    .selectAll('ellipse.point-path').data(this.points);

    pointPath.merge(
      pointPath.enter().append('ellipse').attr('class', 'point-path'),
    )
    .classed('origin', (d, ix) => ix === 0)
    .attr('data-transform-plz', '')
    .attr('cx', d => this.rwuToGrid(d.x, 'x'))
    .attr('cy', d => this.rwuToGrid(d.y, 'y'))
    .attr('rx', (d, ix) => (ix === 0 ? 7 : 2))
    .attr('ry', (d, ix) => (ix === 0 ? 7 : 2))
    .attr('vector-effect', 'non-scaling-stroke')
    .attr('fill', (d, ix) => (ix === 0 ? 'none' : ''));

    // connect the points for the face being drawn with a line
    d3.select('#grid svg').append('path').attr('class', 'point-path')
    .datum(this.points)
    .attr('fill', 'none')
    .attr('vector-effect', 'non-scaling-stroke')
    .attr('data-transform-plz', '')
    .attr('d', d3.line().x(d => this.rwuToGrid(d.x, 'x')).y(d => this.rwuToGrid(d.y, 'y')))
    // prevent edges from overlapping points - interferes with click events
    .lower();

    // keep grid lines under polygon edges
    d3.selectAll('.vertical, .horizontal').lower();
  },
  registerDrag() {
    const polygons = d3.select('#grid svg').selectAll('polygon');

    this.deregisterD3Events(polygons);
    if (this.currentTool === 'Select') {
      this.registerSelectEvents(polygons);
    } else if (this.currentTool === 'Fill') {
      this.registerFillEvents(polygons);
    }
  },
  deregisterD3Events(polygons) {
    polygons
      .on('.drag', null)
      .on('click', null);
  },

  registerFillEvents(polygons) {
    polygons.on('click', (d) => {
      if (this.currentSpace || this.currentShading) {
        this.points = [...d.points];
        this.savePolygonFace();
      }
    });
  },

  registerSelectEvents(polygons) {
    // store total drag offset (grid units)
    let startX, startY;

    // polygon drag handler
    const drag = d3.drag()
      .on('start', (d) => {
        [startX, startY] = d3.mouse(this.$refs.grid);
        if (d.previous_story) { return; }
        // if a face on the current story is clicked while the Select tool is active
        // lookup its corresponding model (space/shading) and select it
        this.currentSubSelection = modelHelpers.modelForFace(this.$store.state.models, d.face_id);
      })
      .on('drag', (d) => {
        if (d.previous_story) { return; }

        const [currX, currY] = d3.mouse(this.$refs.grid);
        d3.select(`#poly-${d.face_id}`)
          .attr('transform', () => `translate(${currX - startX}, ${currY - startY})`);
      })
      .on('end', (d) => {
        if (d.previous_story) { return; }

        // when the drag is finished, update the face in the store with the total offset in RWU
        const [endX, endY] = d3.mouse(this.$refs.grid);
        this.$store.dispatch('geometry/moveFaceByOffset', {
          face_id: d.face_id,
          dx: this.gridToRWU(endX, 'x') - this.gridToRWU(startX, 'x'),
          dy: this.gridToRWU(endY, 'y') - this.gridToRWU(startY, 'y'),
        });
      });
    polygons.call(drag);
  },
  /*
  * render saved faces as polygons
  * handle clicks to select faces
  */
  drawPolygons() {
    this.recalcScales();
    // remove expired polygons
    let poly = d3.select('#grid svg .polygons').selectAll('g.poly')
      .data(this.polygons, d => d.face_id);

    poly.exit().remove();
    const polyEnter = poly.enter().append('g').attr('class', 'poly');
    polyEnter.append('polygon');
    polyEnter.append('text').attr('class', 'polygon-text');
    polyEnter.append('g').attr('class', 'windows');
    polyEnter.append('g').attr('class', 'doors');
    polyEnter.append('g').attr('class', 'daylighting-controls');

    // draw polygons
    poly = polyEnter
      .merge(poly)
      .classed('current', d => d.current)
      .classed('previousStory', d => d.previous_story)
      .classed('poly', true)
      .attr('data-model-type', d => d.modelType)
      .attr('id', p => `poly-${p.face_id}`)
      .attr('transform', null);

    poly.select('polygon')
      .attr('id', d => `face-${d.face_id}`)
      .attr('points', d => d.points.map(p => [this.rwuToGrid(p.x, 'x'), this.rwuToGrid(p.y, 'y')].join(',')).join(' '))
      .attr('fill', d => d.color)
      .attr('vector-effect', 'non-scaling-stroke');

    // add label
    poly.select('text')
      .attr('id', p => `text-${p.face_id}`)
      .attr('x', p => this.rwuToGrid(p.labelPosition.x, 'x'))
      .attr('y', p => this.rwuToGrid(p.labelPosition.y, 'y'))
      .text(p => p.name)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .attr('font-family', 'sans-serif')
      .attr('fill', 'red')
      .classed('polygon-text', true);

    poly.select('.windows')
      .selectAll('.window')
      .data(d => d.windows)
      .call(this.drawWindow);

    poly.select('.doors')
      .selectAll('.window')
      .data(d => d.doors)
      .call(this.drawWindow);

    poly.select('.daylighting-controls')
      .selectAll('.daylighting-control')
      .data(d => d.daylighting_controls)
      .call(this.drawDaylightingControl);

    this.registerDrag();

    // render the selected model's face above the other polygons so that the border is not obscured
    poly.order();
  },
  drawWalls() {
    d3.select('#grid svg .walls').selectAll('.wall')
      .data(this.walls, d => d.id)
      .call(this.drawWall);
  },
  drawImages() {
    d3.select('#grid svg .images').selectAll('.image-group')
      .data(this.images, d => d.id)
      .call(this.drawImage);
  },

  draw({ zoomEnd } = {}) {
    this.transformAtLastRender = { ...this.transform };
    d3.selectAll('[data-transform-plz]')
      .attr('transform', '');

    this.drawPolygons();
    this.drawWalls();
    this.drawImages();
    this.raiseOrLowerImages();

    const redrawPoints = zoomEnd && this.points.length > 0;
    if (redrawPoints) {
      this.highlightSnapTarget();
      this.drawPoints();
    }
  },
  // ****************** SNAPPING TO EXISTING GEOMETRY ****************** //
  /*
  * given a point in grid units, find the closest vertex or edge within its snap tolerance
  * if the grid is active and no vertex or edge is within the snap tolerance, returns the closest grid point
  * if the grid is inactive, returns the or the location of the point
  */
  findSnapTarget(gridPoint, options = {}) {
    const { edge_component: snapOnlyToEdges } = options;
    // translate grid point to real world units to check for snapping targets
    const rwuPoint = {
      x: this.gridToRWU(gridPoint.x, 'x'),
      y: this.gridToRWU(gridPoint.y, 'y'),
    };
    if (this.snapMode === 'grid-strict') {
      return this.strictSnapTargets(rwuPoint)[0];
    }

    if (this.snapMode === 'grid-verts-edges') {
      const realPoint = this.gridPointToRWU(gridPoint);
      const targets = [
        ...vertexSnapTargets(this.currentStoryGeometry.vertices, this.spacing, realPoint),
        ...this.snappingEdgeData(realPoint),
        ...gridSnapTargets(this.spacing, realPoint),
        ...this.polygonOriginPoint(),
      ].map(
        (target) => {
          const penaltyFactor = (
            target.type === 'edge' ? 1.4 : 1.0
          );
          return ({
            ...target,
            dist: penaltyFactor * distanceBetweenPoints(target, realPoint),
            dx: realPoint.x - target.x,
            dy: realPoint.y - target.y,
          });
        });

      const orderedTargets = _.orderBy(targets, ['dist', 'origin', 'type'], ['asc', 'asc', 'desc']);
      return orderedTargets[0] || {
        type: 'gridpoint',
        ...realPoint,
      };
    }
    // if snapping only to edges (placing edge components, return either the snapping edge or original point)
    if (snapOnlyToEdges) {
      const snappingEdge = this.snappingEdgeData(rwuPoint);
      return snappingEdge[0] || {
        type: 'gridpoint',
        ...rwuPoint,
      };
    }
    // if a snappable vertex exists, don't check for edges
    const snappingVertex = this.snappingVertexData(rwuPoint);
    if (snappingVertex) { return snappingVertex; }

    const snappingEdge = this.snappingEdgeData(rwuPoint);
    if (snappingEdge.length > 0) { return snappingEdge[0]; }

    // grid is active and no vertices or edges are within snapping range, calculate the closest grid point to snap to
    if (this.gridVisible) {
      // spacing between ticks in grid units
      const xTickSpacing = this.rwuToGrid(this.spacing + this.min_x, 'x'),
      // yTickSpacing = this.rwuToGrid(this.spacing + this.min_y, 'y');
        yTickSpacing = this.rwuToGrid(this.max_y - this.spacing, 'y'); // inverted y axis

      // round point RWU coordinates to nearest gridline, adjust by grid offset, add 0.5 grid units to account for width of gridlines
      const snapTarget = {
        type: 'gridpoint',
        x: this.round(gridPoint.x, xTickSpacing) - 0.5,
        y: this.round(gridPoint.y, yTickSpacing) - 0.5,
      };

      // pick closest point
      snapTarget.x = Math.abs(gridPoint.x - (snapTarget.x - xTickSpacing)) > Math.abs(gridPoint.x - snapTarget.x) ? snapTarget.x : snapTarget.x - xTickSpacing;
      snapTarget.y = Math.abs(gridPoint.y - (snapTarget.y - yTickSpacing)) > Math.abs(gridPoint.y - snapTarget.y) ? snapTarget.y : snapTarget.y - yTickSpacing;

      return snapTarget;
    }
    // if grid is not active, check if we can snap to an angle
    else if (this.points.length) {
      const snappableAngles = [-180, -90, 0, 90, 180];
      const lastPoint = this.points[this.points.length - 1];
      // angle between last point drawn and mouse (degrees)
      const thetaDeg = Math.atan2(lastPoint.y - gridPoint.y, lastPoint.x - gridPoint.x)
      * (180 / Math.PI);

      // snap to -180, -90, 0, 90, 180
      var snapCoords;
      snappableAngles.some((angle) => {
        // check if gridpoint is within snap tolerance of a vertical or horizontal angle
        if (Math.abs(thetaDeg - angle) < this.$store.getters['project/angleTolerance']) {
          // only take the x or y value from the rotated point
          // we don't want to preserve the original radius
          if (angle === -180 || angle === 0 || angle === 180) {
            // horizontal snap - use original x value and adjust y
            return {
              x: gridPoint.x,
              y: this.rotatePoint(lastPoint, gridPoint, angle - thetaDeg).y,
            };
          } else if (angle === -90 || angle === 90) {
            // vertical snap - use original y value and adjust x
            return {
              x: this.rotatePoint(lastPoint, gridPoint, angle - thetaDeg).x,
              y: gridPoint.y,
            };
          }
        }
      });

      if (snapCoords) {
        return {
          type: 'gridpoint',
          ...snapCoords,
        };
      }
    }

    // nothing to snap to, just return the location of the point
    return {
      type: 'gridpoint',
      ...gridPoint
    };
  },

  polygonOriginPoint() {
    if (this.points.length >= 3 && this.currentTool === 'Polygon') {
      // convert the polygon origin from grid units to real world units before adding it as a snappable vertex
      return [{
        ...this.points[0],
        origin: true, // set a flag to mark the origin
        type: 'vertex',
      }];
    }
    return [];
  },

  strictSnapTargets(location) {
    const snappableVertices = [
      ...this.currentStoryGeometry.vertices,
      ...(this.previousStoryGeometry ? this.previousStoryGeometry.vertices : []),
      ...this.polygonOriginPoint(),
    ];

    return snapTargets(snappableVertices, this.spacing, location);
  },
  /*
  * given a point in RWU, look up the closest snappable vertex
  * if the vertex is within the snap tolerance of the point, return the coordinates of the vertex in grid units
  * and the distance from the vertex to the point
  */
  snappingVertexData(point) {
    // build a list of vertices (in RWU) available for snapping
    // deep copy all vertices on the current story
    let snappableVertices = [...this.currentStoryGeometry.vertices];

    // TODO: conditionally combine this list with vertices from the next story down if it is visible
    if (this.previousStoryGeometry) {
      snappableVertices = snappableVertices.concat(JSON.parse(JSON.stringify(this.previousStoryGeometry.vertices)));
    }

    // if the polygon tool is active and the polygon being drawn has at least 3 existing points allow snapping to the origin of the polygon
    if (this.points.length >= 3 && this.currentTool === 'Polygon') {
      // convert the polygon origin from grid units to real world units before adding it as a snappable vertex
      snappableVertices.push({
        ...this.points[0],
        origin: true, // set a flag to mark the origin
      });
    }

    if (this.points.length === 1 && this.currentTool === 'Rectangle') {
      snappableVertices = snappableVertices.concat(
        geometryHelpers.syntheticRectangleSnaps(
          snappableVertices,
          this.points[0],
          point),
      );
    }

    if (!snappableVertices.length) { return null; }

    // find the vertex closest to the point being tested
    const nearestVertex = snappableVertices.reduce((a, b) => {
      const aDist = this.distanceBetweenPoints(a, point);
      const bDist = this.distanceBetweenPoints(b, point);
      return aDist < bDist ? a : b;
    });

    // return the nearest vertex if it is within the snap tolerance of the point
    if (this.distanceBetweenPoints(nearestVertex, point) < this.$store.getters['project/snapTolerance']) {
      return {
        ...nearestVertex,
        type: 'vertex',
      };
    }
  },

  /*
  * given a point in RWU, look up the closest snappable edge
  * if the projection of the point to the edge is within the snap tolerance of the point, return the edge and coordinates of the projection in grid units
  * and the distance from the projection to the point
  */
  snappingEdgeData(point) {
    // build a list of edges (in RWU) available for snapping
    // deep copy all vertices on the current story
    let snappableEdges = [...this.currentStoryGeometry.edges];

    // TODO: conditionally combine this list with edges from the next story down if it is visible
    if (this.previousStoryGeometry) {
      snappableEdges = snappableEdges.concat(this.previousStoryGeometry.edges.map(e => ({
        ...e,
        previous_story: true,
      })));
    }

    if (snappableEdges.length === 0) { return []; }

    // find the edge closest to the point being tested
    const distyEdges = _.map(
      snappableEdges, (edge) => {
        const
          aStoryGeometry = edge.previous_story ? this.previousStoryGeometry : this.currentStoryGeometry,
          // look up vertices associated with edges
          aV1 = geometryHelpers.vertexForId(edge.v1, aStoryGeometry),
          aV2 = geometryHelpers.vertexForId(edge.v2, aStoryGeometry),
          // project point being tested to each edge
          aProjection = projectionOfPointToLine(point, { p1: aV1, p2: aV2 }),

          // look up distance between projection and point being tested
          aDist = distanceBetweenPoints(aProjection, point);
        return {
          ...edge,
          projection: aProjection,
          dist: aDist,
          v1Coords: aV1,
          V2Coords: aV2,
        };
      });
    const nearestEdge = _.minBy(distyEdges, 'dist');

    // // look up vertices associated with nearest edge
    // const nearestEdgeStoryGeometry = nearestEdge.previous_story ? this.previousStoryGeometry : this.currentStoryGeometry;
    // const nearestEdgeV1 = geometryHelpers.vertexForId(nearestEdge.v1, nearestEdgeStoryGeometry);
    // const nearestEdgeV2 = geometryHelpers.vertexForId(nearestEdge.v2, nearestEdgeStoryGeometry);
    // // take the projection of the cursor to the edge
    // // check if the angle of the segment defined by the cursor and projection is < the angle snap tolerance
    // const snappableAngles = [-180, -90, 0, 90, 180];
    // // angle between projection and mouse (degrees)
    // const thetaDeg = Math.atan2(point.y - nearestEdge.projection.y, point.x - nearestEdge.projection.x)
    // * (180 / Math.PI);

    // // if the original projection is within the snap tolerance of one of the snapping angles
    // // adjust the projection so that it is exactly at the snap angle
    // // snap to -180, -90, 0, 90, 180
    // snappableAngles.some((angle) => {
    //   // if the original projection is within the snap tolerance of one of the snapping angles
    //   // adjust the projection so that it is exactly at the snap angle
    //   if (Math.abs(thetaDeg - angle) < this.$store.getters['project/angleTolerance']) {
    //     // infer a line defining the desired projection
    //     var adjustedProjectionP1;
    //     var adjustedProjectionP2;
    //     if (angle === 180 || angle === 0 || angle === -180) {
    //       adjustedProjectionP1 = { x: point.x - (2 * nearestEdge.dist), y: point.y }
    //       adjustedProjectionP2 = { x: point.x + (2 * nearestEdge.dist), y: point.y }
    //     } else if (angle === 90 || angle === -90) {
    //       adjustedProjectionP1 = { x: point.x, y: point.y - (2 * nearestEdge.dist) }
    //       adjustedProjectionP2 = { x: point.x, y: point.y + (2 * nearestEdge.dist) }
    //     }
    //     // adjust the projection to be the intersection of the desired projection line and the nearest edge
    //     if (geometryHelpers.ptsAreCollinear(adjustedProjectionP1, nearestEdgeV1, adjustedProjectionP2)) {
    //       projection = nearestEdgeV1;
    //     } else if (geometryHelpers.ptsAreCollinear(adjustedProjectionP1, nearestEdgeV2, adjustedProjectionP2)) {
    //       projection = nearestEdgeV2;
    //     } else {
    //       projection = geometryHelpers.intersectionOfLines(adjustedProjectionP1, adjustedProjectionP2, nearestEdgeV1, nearestEdgeV2);
    //     }
    //     return true;
    //   }
    //   return false;
    // });

    // return data for the edge if the projection is within the snap tolerance of the point
    if (nearestEdge.dist < this.$store.getters['project/snapTolerance']) {
      return [{
        snappingEdge: nearestEdge,
        dist: nearestEdge.dist,
        type: 'edge',
        // projection and snapping edge vertices translated into grid coordinates (to display snapping point and highlight edges)
        projection: nearestEdge.projection,
        v1GridCoords: nearestEdge.v1Coords,
        v2GridCoords: nearestEdge.V2Coords,
        x: nearestEdge.projection.x,
        y: nearestEdge.projection.y,
      }];
    }
    return [];
  },

  // ****************** SNAPPING HELPERS ****************** //
  /*
  * returns the distance between two points
  */
  distanceBetweenPoints (p1, p2) {
    const dx = Math.abs(p1.x - p2.x),
    dy = Math.abs(p1.y - p2.y);
    return Math.sqrt((dx * dx) + (dy * dy));
  },

  /*
  * round a number n to the nearest x
  */
  round (n, x) {
    var result,
    sign = n < 0 ? -1 : 1;
    n = Math.abs(n);
    if (n % x < x / 2) {
      result = n - (n % x);
    } else {
      result = n + x - (n % x);
    }
    // handle negatives
    result *= sign;
    return result
  },
  rotatePoint (center, point, angle) {
    const radians = angle * Math.PI / 180.0,
    cos = Math.cos(radians),
    sin = Math.sin(radians),
    dX = point.x - center.x,
    dY = point.y - center.y;

    return {
      x: cos * dX - sin * dY + center.x,
      y: sin * dX + cos * dY + center.y
    };
  },

  resolveBounds() {
    /*
    After calling resolveBounds:
     - (min_x, max_x) x  (min_y, max_y) will have the same aspect ratio
     as width x height.
     - (min_x, max_x) is the same or a smaller interval
     - (min_y, max_y) is the same or a smaller interval
    */
    let
      currXExtent = [this.min_x, this.max_x],
      currYExtent = [this.min_y, this.max_y];
    const plusMargin = ([i, s]) => {
      const d = (s - i) / 20;
      return [i - d, s + d];
    };
    if (this.visibleVerts.length) {
      currXExtent = plusMargin(d3.extent(this.allVertices, d => d.x));
      currYExtent = plusMargin(d3.extent(this.allVertices, d => d.y));
    }
    const
      width = this.$refs.gridParent.clientWidth,
      height = this.$refs.gridParent.clientHeight,
      { xExtent, yExtent } = fitToAspectRatio(
        currXExtent,
        currYExtent,
        width / height,
        'expand',
      );

    this.dimensions = {
      min_x: xExtent[0],
      max_x: xExtent[1],
      min_y: yExtent[0],
      max_y: yExtent[1],
    };
    _.defer(() => {
      window.eventBus.$emit('boundsResolved');
    });
  },
  nullTransform() {
    d3.select(this.$refs.grid).call(this.zoomBehavior.transform, d3.zoomIdentity);
  },
  // ****************** GRID ****************** //
  renderGrid() {
    const
      w = this.$refs.gridParent.clientWidth,
      h = this.$refs.gridParent.clientHeight;

    this.resolveBounds();
    // scaleX amd scaleY are used during drawing to translate from px to RWU given the current grid dimensions in rwu
    this.$store.dispatch('application/setScaleX', {
      scaleX: {
        pixels: w,
        rwuRange: [this.min_x, this.max_x],
      },
    });

    this.$store.dispatch('application/setScaleY', {
      scaleY: {
        pixels: h,
        rwuRange: [this.min_y, this.max_y],
      },
    });

    this.calcGrid();

    // It took me some time to figure out why this line is necessary. It fixes a problem
    // that sometimes appears when resizing the window. Here's a screenshot of what
    // it can look like without that line:
    // https://trello-attachments.s3.amazonaws.com/58d428743111af1d0a20cf28/59a225fd10e0a9d23fc0e1b2/30ea2c37407fe148a397295b748b6015/capture.png
    // When it looks that way it's because the zoomXScale's range has not been updated to
    // reflect the new clientWidth. reloadGridAndScales() updates the zoomXScale's range,
    // but the axes don't re-render until the next zoom event. We use nullTransform()
    // to force this to happen immediately.
    this.nullTransform();

    this.draw()
  },
  reloadGridAndScales() {
    this.zoomXScale = null;
    this.zoomYScale = null;
    this.resolveBounds();
    this.renderGrid();
  },
  recalcScales() {
    const
      width = this.$refs.gridParent.clientWidth,
      height = this.$refs.gridParent.clientHeight;

    this.xScale = d3.scaleLinear()
      .domain([this.min_x, this.max_x])
      .range([0, width]);
    this.yScale = d3.scaleLinear()
      .domain([this.min_y, this.max_y])
      .range([height, 0]); // inverted y axis

    // only copy once, or else zoom behavior is exponential
    this.zoomXScale = this.zoomXScale || this.xScale.copy();
    this.zoomYScale = this.zoomYScale || this.yScale.copy();
  },
  calcGrid() {
    this.recalcScales();
    const
      width = this.$refs.gridParent.clientWidth,
      height = this.$refs.gridParent.clientHeight;
    const
      svg = d3.select('#grid svg'),
      // keep font size and stroke width visually consistent
      strokeWidth = 1,
      fontSize = '14px';

    svg.attr('height', height)
      .attr('width', width);
    this.axis.x = svg.selectAll('g.axis--x')
      .data([undefined]);

    this.axis.x = this.axis.x.merge(
      this.axis.x.enter().append('g').attr('class', 'axis axis--x'),
    )
    .attr('stroke-width', strokeWidth)
    .style('font-size', fontSize)
    .style('display', this.gridVisible ? 'inline' : 'none');

    this.axis.y = svg.selectAll('g.axis--y')
      .data([undefined]);

    this.axis.y = this.axis.y.merge(
      this.axis.y.enter().append('g').attr('class', 'axis axis--y'),
    )
    .attr('class', 'axis axis--y')
    .attr('stroke-width', strokeWidth)
    .style('font-size', fontSize)
    .style('display', this.gridVisible ? 'inline' : 'none');

    // now that the axis g tags exist, call axis_generator on them.
    this.updateGrid();

    // configure zoom behavior in rwu
    this.zoomBehavior = d3.zoom()
    .scaleExtent([0, Infinity])
     .on('zoom', () => {
       const transform = d3.event.transform;
       // update stored transform for grid hiding, etc.
       this.transform = { ...transform };

       // create updated copies of the scales based on the zoom transformation
       // the transformed scales are only used to obtain the new rwu grid dimensions and redraw the axes
       // NOTE: don't change the original scale or you'll get exponential growth
       const
         newScaleX = transform.rescaleX(this.zoomXScale),
         newScaleY = transform.rescaleY(this.zoomYScale);

      const xDomain = newScaleX.domain();
      const yDomain = newScaleY.domain();
      this.dimensions = {
        min_x: xDomain[0],
        max_x: xDomain[1],
        min_y: yDomain[0],
        max_y: yDomain[1],
      };

       this.axis_generator.x.scale(newScaleX);
       this.axis_generator.y.scale(newScaleY);
       this.updateGrid();

       // axis padding
       this.padTickY(-12);

       // apply the zoom transform to image and polygon <g> tags.
       // (more efficient than a full re-render)
       this.translateEntities();
       this.clearComponentHighlights();
     })
     .on('end', () => {
       // redraw the saved geometry
       this.draw({ zoomEnd: true });
     });

    svg.call(this.zoomBehavior);
    svg
      .on('mousemove', this.handleMouseMove)
      .on('click', this.gridClicked);
  },
  transformTo(t) {
    d3.select(this.$refs.grid)
      .call(this.zoomBehavior.transform, t);
  },
  zoomBy(factor) {
    const newScale = this.transform.k * factor;
    d3.select(this.$refs.grid)
      .transition()
      .duration(400)
      .call(this.zoomBehavior.transform, d3.zoomIdentity.scale(newScale));
  },
  zoomToFit() {
    const
      width = this.$refs.grid.clientWidth,
      height = this.$refs.grid.clientHeight;

    if (!this.allVertices.length) {
      return;
    }

    const
      xExtent = d3.extent(this.allVertices, d => this.zoomXScale(d.x)),
      yExtent = d3.extent(this.allVertices, d => this.zoomYScale(d.y)),
      dx = xExtent[1] - xExtent[0],
      dy = yExtent[1] - yExtent[0],
      x = (xExtent[0] + xExtent[1]) / 2,
      y = (yExtent[0] + yExtent[1]) / 2,
      scale = 0.9 / Math.max(dx / width, dy / height),
      translate = [width / 2 - scale * x, height / 2 - scale * y],
      svg = d3.select('#grid svg'),
      transform = d3.zoomIdentity.translate(...translate).scale(scale);

    svg.call(this.zoomBehavior.transform, transform);
  },
  scaleTo(scale) {
    const
      width = this.$refs.grid.clientWidth,
      height = this.$refs.grid.clientHeight,
      x = (this.zoomXScale(this.max_x) + this.zoomXScale(this.min_x)) / 2,
      y = (this.zoomYScale(this.max_y) + this.zoomYScale(this.min_y)) / 2,
      translate = [width / 2 - scale * x, height / 2 - scale * y];
    d3.select(this.$refs.grid)
      .call(this.zoomBehavior.transform, d3.zoomIdentity
          .translate(...translate)
          .scale(scale));
  },
  translateEntities() {
    // During a zoom, we don't do a full re-render because it would fire many
    // times and slow down the event loop. Instead, we do a visual
    // transformation, to keep the elements in the correct position on the page
    //
    // It used to be just .images and .polygons that needed to be translated
    // but, now that mid-draw artifacts can persist through a zoom or pan, we
    // needed to add them as well. Rather than listing all the selectors for
    // anyone who might want to be translated, we use [data-transform-plz] to
    // let elements opt-in and say "I would like to be translated when the user
    // pans, plz".

    d3.selectAll('[data-transform-plz]')
      .attr('transform', transformDiff(this.transformAtLastRender, d3.event.transform));
  },
  showOrHideAxes() {
    this.axis.x.style('visibility', this.gridVisible ? 'visible' : 'hidden');
    this.axis.y.style('visibility', this.gridVisible ? 'visible' : 'hidden');
  },
  updateGrid() {
    if (!this.axis.x || !this.axis.y) {
      // not yet initialized
      return;
    }
    const
      width = this.$refs.gridParent.clientWidth,
      height = this.$refs.gridParent.clientHeight,
      rwuWidth = this.max_x - this.min_x,
      rwuHeight = this.max_y - this.min_y,
      xTicks = ticksInRange(this.min_x, this.max_x, this.spacing),
      yTicks = ticksInRange(this.min_y, this.max_y, this.spacing);

    this.reduceTicks = yTicks.length > 250 || xTicks.length > 250;

    this.axis_generator.x = this.axis_generator.x || d3.axisBottom(this.xScale);
    this.axis_generator.x
      .tickSize(height)
      .tickPadding(-20)
      .tickFormat(this.reduceTicks ? _.identity : this.formatTickX.bind(this, Math.floor(10 * (width / height))));

    this.axis_generator.y = this.axis_generator.y || d3.axisRight(this.yScale);
    this.axis_generator.y
      .tickSize(width)
      .tickPadding(-25)
      .tickFormat(this.reduceTicks ? _.identity : this.formatTickY.bind(this, 10));

    if (this.reduceTicks) {
      this.axis_generator.x
        .tickValues(null)
        .ticks(5 * (rwuWidth / rwuHeight));
      this.axis_generator.y
        .tickValues(null)
        .ticks(5);
    } else {
      this.axis_generator.x
        .ticks(null)
        .tickValues(xTicks);
      this.axis_generator.y
        .ticks(null)
        .tickValues(yTicks);
    }
    // update the number of ticks to display based on the post zoom real world unit height and width
    this.axis.y.call(this.axis_generator.y);
    this.axis.x.call(this.axis_generator.x);
  },

  // ****************** SCALING FUNCTIONS ****************** //

  /*
  * take a rwu value (from the datastore), find the corresponding coordinates in the svg grid
  */
  rwuToGrid (rwu, axis) {
    let scale;
    if (axis === 'x') {
      scale = this.xScale;
    } else if (axis === 'y') {
      scale = this.yScale;
    }
    return scale(rwu);
  },

  /*
  * take a grid value (from some point already rendered to the grid) and translate it into RWU for persistence to the datastore
  */
  gridToRWU(gridValue, axis) {
    let scale;
    if (axis === 'x') {
      scale = this.xScale;
    } else if (axis === 'y') {
      scale = this.yScale;
    }
    const result = scale.invert(gridValue);
    // prevent floating point inaccuracies in stored numbers
    return (Math.round(result * 100000000000))/100000000000;
  },

  gridPointToRWU(pt) {
    return {
      x: this.gridToRWU(pt.x, 'x'),
      y: this.gridToRWU(pt.y, 'y'),
    };
  },

  rwuPointToGrid(pt) {
    return {
      x: this.rwuToGrid(pt.x, 'x'),
      y: this.rwuToGrid(pt.y, 'y'),
    };
  },

  /*
  * determine label x,y for given polygon
  */
  polygonLabelPosition(pointsIn) {
    const
      points = [pointsIn.map(p => [p.x, p.y])],
      area = Math.abs(Math.round(geometryHelpers.areaOfSelection(pointsIn))), // calculate area in RWU, not grid units
      [x, y] = area ? polylabel(points, 1.0) : [null, null];

    return { x, y, area };
  },

  /*
  * Format tick labels to maintain legibility
  */
  formatTickX (maxTicks, val) {
    const rangeX = this.max_x - this.min_x,
    spacing = this.spacing,
    spacingScaled = Math.ceil((rangeX / maxTicks) / spacing) * spacing;

    return (spacingScaled === 0 || val % spacingScaled === 0) ? val : '';
  },
  formatTickY (maxTicks, val) {
    const rangeY = this.max_y - this.min_y,
    spacing = this.spacing,
    spacingScaled = Math.ceil((rangeY / maxTicks) / spacing) * spacing;

    return (spacingScaled === 0 || val % spacingScaled === 0) ? val : '';
  },
  /*
  * Adjust padding to ensure full label is visible
  */
  padTickY (paddingPerDigit) {
    let min = Math.abs(this.min_y),
    max = Math.abs(this.max_y),
    numDigits = (min < max ? max : min).toFixed(0).length,
    yPadding = paddingPerDigit * numDigits;

    this.axis.y.call(this.axis_generator.y.tickPadding(yPadding));
  }
};
