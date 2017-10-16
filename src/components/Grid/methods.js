// OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
// (1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
// (2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
// (3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
// (4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

const d3 = require('d3');
const polylabel = require('polylabel');
import _ from 'lodash';
import { snapTargets, snapWindowToEdge, snapToVertexWithinFace, findClosestEdge, findClosestWindow } from './snapping';
import geometryHelpers, { distanceBetweenPoints } from './../../store/modules/geometry/helpers';
import modelHelpers from './../../store/modules/models/helpers';
import { ResizeEvents } from '../../components/Resize';

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
      if (this.currentComponentType === 'window_definitions') {
        this.placeWindow();
      } else if (this.currentComponentType === 'daylighting_control_definitions') {
        this.placeDaylightingControl();
      }
    }
    if (this.currentTool === 'Remove Component') {
      this.removeComponent();
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
  removeComponent() {
    const
      gridCoords = d3.mouse(this.$refs.grid),
      gridPoint = { x: gridCoords[0], y: gridCoords[1] },
      rwuPoint = this.gridPointToRWU(gridPoint),
      component = _.minBy(this.allComponentInstanceLocs, ci => distanceBetweenPoints(ci, rwuPoint)),
      distToComp = component && distanceBetweenPoints(component, rwuPoint);
    if (!component || distToComp > this.spacing * 2) {
      return;
    }
    const payload = { story_id: this.currentStory.id, object: { id: component.id } };
    if (component.type === 'window') {
      this.$store.dispatch('models/destroyWindow', payload);
    } else if (component.type === 'daylighting_control') {
      this.$store.dispatch('models/destroyDaylightingControl', payload);
    } else {
      console.error(`unrecognized component to remove: ${component}`);
    }
  },
  placeWindow() {
    const
      gridCoords = d3.mouse(this.$refs.grid),
      gridPoint = { x: gridCoords[0], y: gridCoords[1] },
      rwuPoint = this.gridPointToRWU(gridPoint),
      loc = snapWindowToEdge(
        this.snapMode,
        this.spaceEdges, rwuPoint,
        this.currentComponentDefinition.width, this.spacing * 2, this.spacing,
      );

    if (!loc) { return; }

    const payload = {
      story_id: this.currentStory.id,
      edge_id: loc.edge_id,
      window_defn_id: this.currentComponentDefinition.id,
      alpha: loc.alpha,
    };
    this.$store.dispatch('models/createWindow', payload);
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
      daylighting_control_defn_id: this.currentComponentDefinition.id,
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
    var newPoint = snapTarget.type === 'edge' ? snapTarget.projection : snapTarget;
    this.points.push(newPoint);
    // if the Rectangle or Eraser tool is active and two points have been drawn (to define a rectangle)
    // complete the corresponding operation for the tool
    if (this.currentTool === 'Eraser' && this.points.length === 2) { this.eraseRectangularSelection(); }
    if (this.currentTool === 'Rectangle' && this.points.length === 2) { this.saveRectuangularFace(); }
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
    const gridCoords = d3.mouse(this.$refs.grid),
      gridPoint = { x: gridCoords[0], y: gridCoords[1] };

    if (this.currentTool === 'Place Component' && this.currentComponentDefinition) {
      this.highlightComponent(gridPoint);
      return;
    }

    const snapTarget = this.findSnapTarget(gridPoint);

    // render a line and point showing which geometry would be created with a click at this location
    const guidePoint = snapTarget.type === 'edge' ? snapTarget.projection :
      snapTarget;

    const ellipsePoint = snapTarget.synthetic ? snapTarget.originalPt : guidePoint;
    this.drawGuideLines(e, guidePoint);


    // if snapping to an edisting edge or radius, draw a larger point, if snapping to the grid or just displaying the location of the pointer, create a small point
    if (snapTarget.type === 'edge' || snapTarget.type === 'vertex') {
      d3.select('#grid svg')
      .append('ellipse')
      .attr('cx', ellipsePoint.x, 'x')
      .attr('cy', ellipsePoint.y, 'y')
      .attr('rx', 5)
      .attr('ry', 5)
      .classed('highlight', true)
      .attr('vector-effect', 'non-scaling-stroke');
    } else {
      d3.select('#grid svg')
      .append('ellipse')
      .attr('cx', ellipsePoint.x)
      .attr('cy', ellipsePoint.y)
      .attr('rx', 2)
      .attr('ry', 2)
      .classed('gridpoint', true)
      .attr('vector-effect', 'non-scaling-stroke');
    }

    // in drawing modes, highlight edges that would be snapped to
    if (snapTarget.type === 'edge' && this.currentTool !== 'Eraser') {
      d3.select('#grid svg')
      .append('line')
      .attr('x1', snapTarget.v1GridCoords.x)
      .attr('y1', snapTarget.v1GridCoords.y)
      .attr('x2', snapTarget.v2GridCoords.x)
      .attr('y2', snapTarget.v2GridCoords.y)
      .attr('stroke-width', 1)
      .classed('highlight', true)
      .attr('vector-effect', 'non-scaling-stroke');
    }
  },

  clearHighlights() {
    d3.selectAll('#grid .highlight, #grid .gridpoint, #grid .guideline').remove();
  },


  highlightComponent(gridPoint) {
    if (this.currentComponentType === 'window_definitions') {
      this.highlightWindow(gridPoint);
    } else {
      this.highlightDaylightingControl(gridPoint);
    }
  },

  highlightWindow(gridPoint) {
    const
      rwuPoint = this.gridPointToRWU(gridPoint),
      loc = snapWindowToEdge(
        this.snapMode,
        this.spaceEdges, rwuPoint,
        this.currentComponentDefinition.width, this.spacing * 2, this.spacing,
      );

    if (!loc) { return; }
    d3.select('#grid svg')
      .append('g')
      .classed('highlight', true)
      .selectAll('.window')
      .data([loc])
      .call(this.drawWindow.highlight(true));

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
  drawGuideLines (e, guidePoint) {
    if (!this.points.length) { return; }

    // remove expired guideline paths and text
    this.eraseGuidelines();

    var guidelinePoints, guidelinePaths;

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
        this.points[0]
      ];

      guidelinePaths = [
        [guidelinePoints[0],guidelinePoints[1]],
        [guidelinePoints[1],guidelinePoints[2]]
      ];
    }

    const guidelineArea = this.currentTool === 'Polygon' ? [...this.points, guidePoint, this.points[0]] : guidelinePoints,
    guidelinePolys = [guidelineArea,this.points],
    svg = d3.select('#grid svg');

    // render a guideline or rectangle
    svg.selectAll('.guideline-line')
    .append('path')
    .datum(guidelinePoints)
    .attr('fill', 'none')
    .classed('guideline guideline-line', true)
    .attr('vector-effect', 'non-scaling-stroke')
    .attr('d', d3.line().x(d => d.x).y(d => d.y))
    .lower();

    // render unfinished area polygon(s)
    svg.selectAll('.guideline-area')
    .data(guidelinePolys)
    .enter()
    .append('polygon')
    .attr('points',d => d.map(p => [p.x,p.y].join(",")).join(" "))
    .classed('guideline guideline-area guideLine',true)
    .attr('vector-effect', 'non-scaling-stroke')
    .attr('fill', () => {
      if (this.currentTool === 'Eraser') { return 'none'; }
      else if (this.currentSpace) { return this.currentSpace.color; }
      else if (this.currentShading) { return this.currentShading.color; }
    });

    // don't render area/distance when erasing
    if (this.currentTool === 'Eraser') { return; }

    // render gridline distance(s)
    svg.selectAll('.guideline-text')
    .data(guidelinePaths)
    .enter()
    .append('text')
    .attr('x', d => d[0].x + (d[1].x - d[0].x)/2)
    .attr('y', d => d[0].y + (d[1].y - d[0].y)/2)
    .attr('dx', - 1.25 * (this.transform.k > 1 ? 1 : this.transform.k) + "em")
    .text(d => {
      const dist = this.distanceBetweenPoints(
        {
          x: this.gridToRWU(d[0].x, 'x'),
          y: this.gridToRWU(d[0].y, 'y'),
        },
        {
          x: this.gridToRWU(d[1].x, 'x'),
          y: this.gridToRWU(d[1].y, 'y'),
        });

      return dist ? dist.toFixed(2) : '';
    })
    .classed('guideline guideline-text guideline-dist',true)
    .attr("font-family", "sans-serif")
    .attr("fill", "red")
    .style("font-size","1em");

    if (guidelineArea.length > 3) {
      let areaPoints = guidelineArea.map(p => {
        let x = this.gridToRWU(p.x,'x'),
        y = this.gridToRWU(p.y,'y');

        return { x, y, X: x, Y: y };
      }),
      { x, y, area } = this.polygonLabelPosition(areaPoints),
      areaText = area ? area.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"): "";
      areaText += ` ${this.units}²`;

      if (x === null || y === null) {
        // either polygon has 0 area or something went wrong --> don't draw area text
        return;
      }

      // render unfinished area #
      svg.append('text')
      .attr('x', this.rwuToGrid(x, 'x'))
      .attr('y', this.rwuToGrid(y, 'y'))
      .text(areaText)
      .classed('guideline guideline-text guideline-area-text guideLine',true)
      .attr("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .attr("fill", "red")
      .style("font-size","1em")
      .raise();
    }

    d3.selectAll('.vertical, .horizontal').lower();
  },
  /*
  * Erase any drawn guidelines
  */
  eraseGuidelines () {
    d3.selectAll('#grid .guideline').remove();
  },
  /*
  * Handle escape key presses to cancel current drawing operation
  */
  escapeAction (e) {
    if (e.code === 'Escape' || e.which === 27) {
      this.points = [];
    }
  },
  // ****************** SAVING FACES ****************** //
  /*
  * The origin of the polygon being drawn was clicked, create a polygon face from all points on the grid
  * translate the points into RWU and save the face for the selected space or shading
  */
  savePolygonFace() {
    const payload = {
      // translate grid points from grid units to RWU
      points: this.points.map(p => ({
        x: this.gridToRWU(p.x, 'x'),
        y: this.gridToRWU(p.y, 'y'),
      })),
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
  saveRectuangularFace () {
    // infer 4 corners of the rectangle based on the two points that have been drawn
    const payload = {};

    // translate points from grid units to RWU
    payload.points = [
      this.points[0],
      { x: this.points[1].x, y: this.points[0].y },
      this.points[1],
      { x: this.points[0].x, y: this.points[1].y }
    ].map(p => ({
      x: this.gridToRWU(p.x, 'x'),
      y: this.gridToRWU(p.y, 'y')
    }));

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
  eraseRectangularSelection () {
    // infer 4 corners of the rectangle based on the two points that have been drawn
    const payload = {
      points: [
        this.points[0],
        { x: this.points[1].x, y: this.points[0].y },
        this.points[1],
        { x: this.points[0].x, y: this.points[1].y }
      ]
    };

    // translate points from grid units to RWU
    payload.points = payload.points.map(p => ({
      x: this.gridToRWU(p.x, 'x'),
      y: this.gridToRWU(p.y, 'y')
    }));

    this.$store.dispatch('geometry/eraseSelection', payload);

    // clear points from the grid
    this.points = [];
  },


  // ****************** d3 RENDERING ****************** //
  /*
  * render points for the face being drawn, connect them with a guideline
  */
  drawPoints () {
    // remove expired points and guidelines
    d3.selectAll('#grid .point-path').remove();

    // draw points
    d3.select('#grid svg')
    .selectAll('ellipse').data(this.points)
    .enter().append('ellipse')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('rx', 2)
    .attr('ry', 2)
    .attr('vector-effect', 'non-scaling-stroke');

    // apply custom CSS for origin of polygons
    d3.select('#grid svg').select('ellipse').attr('class', 'point-path')
    .attr('rx', 7)
    .attr('ry', 7)
    .classed('origin', true)
    .attr('vector-effect', 'non-scaling-stroke')
    .attr('fill', 'none');

    // connect the points for the face being drawn with a line
    d3.select('#grid svg').append('path').attr('class', 'point-path')
    .datum(this.points)
    .attr('fill', 'none')
    .attr('vector-effect', 'non-scaling-stroke')
    .attr('d', d3.line().x(d => d.x).y(d => d.y))
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
        this.points = d.points.map(p => ({
          x: this.rwuToGrid(p.x, 'x'),
          y: this.rwuToGrid(p.y, 'y'),
        }));
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
    polyEnter.append('g').attr('class', 'daylighting-controls');

    // draw polygons
    poly = polyEnter
      .merge(poly)
    .attr('class', (d) => {
      if ((this.currentSpace && d.face_id === this.currentSpace.face_id) ||
      (this.currentShading && d.face_id === this.currentShading.face_id)) { return 'current'; }
      if (d.previous_story) { return 'previousStory'; }
      return null;
    })
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
      .call(this.drawWindow.highlight(false));

    poly.select('.daylighting-controls')
      .selectAll('.daylighting-control')
      .data(d => d.daylighting_controls)
      .call(this.drawDaylightingControl);

    this.registerDrag();

    // render the selected model's face above the other polygons so that the border is not obscured
    d3.select('.current').raise();
  },
  drawImages() {
    d3.select('#grid svg .images').selectAll('.image-group')
      .data(this.images, d => d.id)
      .call(this.drawImage);
  },

  draw() {
    this.transformAtLastRender = { ...this.transform };
    d3.selectAll('#grid svg .images, #grid svg .polygons')
      .attr('transform', '');

    this.drawPolygons();
    this.drawImages();
    this.raiseOrLowerImages();
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
      const gridSnap = this.strictSnapTargets(rwuPoint)[0];
      return {
        ...gridSnap,
        x: this.rwuToGrid(gridSnap.x, 'x'),
        y: this.rwuToGrid(gridSnap.y, 'y'),
      };
    }

    if (event.shiftKey) {
      // disable snapping when shift is held down
      return {
        type: 'gridpoint',
        ...gridPoint,
      };
    }

    // if snapping only to edges (placing edge components, return either the snapping edge or original point)
    if (snapOnlyToEdges) {
      const snappingEdge = this.snappingEdgeData(rwuPoint);
      return snappingEdge || {
        type: 'gridpoint',
        ...gridPoint,
      };
    }
    // if a snappable vertex exists, don't check for edges
    const snappingVertex = this.snappingVertexData(rwuPoint);
    if (snappingVertex) { return snappingVertex; }

    const snappingEdge = this.snappingEdgeData(rwuPoint);
    if (snappingEdge) { return snappingEdge; }

    // grid is active and no vertices or edges are within snapping range, calculate the closest grid point to snap to
    if (this.gridVisible) {
      // offset of the first gridline on each axis
      const xOffset = +this.axis.x.select('.tick').attr('transform').replace('translate(', '').replace(')', '').split(',')[0],
      yOffset = +this.axis.y.select('.tick').attr('transform').replace('translate(', '').replace(')', '').split(',')[1],

      // spacing between ticks in grid units
      xTickSpacing = this.rwuToGrid(this.spacing + this.min_x, 'x'),
      // yTickSpacing = this.rwuToGrid(this.spacing + this.min_y, 'y');
      yTickSpacing = this.rwuToGrid(this.max_y - this.spacing, 'y'); // inverted y axis

      // round point RWU coordinates to nearest gridline, adjust by grid offset, add 0.5 grid units to account for width of gridlines
      const snapTarget = {
        type: 'gridpoint',
        x: this.round(gridPoint.x, this.rwuToGrid(this.spacing + this.min_x, 'x')) + xOffset - 0.5,
        y: this.round(gridPoint.y, this.rwuToGrid(this.max_y - this.spacing, 'y')) + yOffset - 0.5
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

  strictSnapTargets(location) {
    const snappableVertices = [
      ...this.currentStoryGeometry.vertices,
      ...(this.previousStoryGeometry ? this.previousStoryGeometry.vertices : []),
    ];

    if (this.points.length >= 3 && this.currentTool === 'Polygon') {
      // convert the polygon origin from grid units to real world units before adding it as a snappable vertex
      snappableVertices.push({
        x: this.gridToRWU(this.points[0].x, 'x'),
        y: this.gridToRWU(this.points[0].y, 'y'),
        origin: true, // set a flag to mark the origin
      });
    }

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
        x: this.gridToRWU(this.points[0].x, 'x'),
        y: this.gridToRWU(this.points[0].y, 'y'),
        origin: true, // set a flag to mark the origin
      });
    }

    if (this.points.length === 1 && this.currentTool === 'Rectangle') {
      snappableVertices = snappableVertices.concat(
        geometryHelpers.syntheticRectangleSnaps(
          snappableVertices,
          {
            x: this.gridToRWU(this.points[0].x, 'x'),
            y: this.gridToRWU(this.points[0].y, 'y'),
          },
          point),
      );
    }

    if (!snappableVertices.length) { return; }

    // find the vertex closest to the point being tested
    const nearestVertex = snappableVertices.reduce((a, b) => {
      const aDist = this.distanceBetweenPoints(a, point);
      const bDist = this.distanceBetweenPoints(b, point);
      return aDist < bDist ? a : b;
    });

    // return the nearest vertex if it is within the snap tolerance of the point
    if (this.distanceBetweenPoints(nearestVertex, point) < this.$store.getters['project/snapTolerance']) {
      const retval = {
        ...nearestVertex,
        x: this.rwuToGrid(nearestVertex.x, 'x'),
        y: this.rwuToGrid(nearestVertex.y, 'y'),
        type: 'vertex',
      };
      if (retval.synthetic) {
        retval.originalPt.x = this.rwuToGrid(retval.originalPt.x, 'x');
        retval.originalPt.y = this.rwuToGrid(retval.originalPt.y, 'y');
      }
      return retval;
    }
  },

  /*
  * given a point in RWU, look up the closest snappable edge
  * if the projection of the point to the edge is within the snap tolerance of the point, return the edge and coordinates of the projection in grid units
  * and the distance from the projection to the point
  */
  snappingEdgeData (point) {
    // build a list of edges (in RWU) available for snapping
    // deep copy all vertices on the current story
    var snappableEdges = [...this.currentStoryGeometry.edges];

    // TODO: conditionally combine this list with edges from the next story down if it is visible
    if (this.previousStoryGeometry) {
      snappableEdges = snappableEdges.concat(JSON.parse(JSON.stringify(this.previousStoryGeometry.edges.map(e => ({
        ...e,
        previous_story: true
      })))));
    }

    if (!snappableEdges.length) { return; }

    // find the edge closest to the point being tested
    const nearestEdge = snappableEdges.reduce((a, b) => {
      const aStoryGeometry = a.previous_story ? this.previousStoryGeometry : this.currentStoryGeometry,
      bStoryGeometry = b.previous_story ? this.previousStoryGeometry : this.currentStoryGeometry,
      // look up vertices associated with edges
      aV1 = geometryHelpers.vertexForId(a.v1, aStoryGeometry),
      aV2 = geometryHelpers.vertexForId(a.v2, aStoryGeometry),

      bV1 = geometryHelpers.vertexForId(b.v1, bStoryGeometry),
      bV2 = geometryHelpers.vertexForId(b.v2, bStoryGeometry),

      // project point being tested to each edge
      aProjection = geometryHelpers.projectionOfPointToLine(point, { p1: aV1, p2: aV2 }),
      bProjection = geometryHelpers.projectionOfPointToLine(point, { p1: bV1, p2: bV2 }),

      // look up distance between projection and point being tested
      aDist = geometryHelpers.distanceBetweenPoints(aProjection, point),
      bDist = geometryHelpers.distanceBetweenPoints(bProjection, point);

      // return data for the edge with the closest projection to the point being tested
      return aDist < bDist ? a : b;
    });

    // look up vertices associated with nearest edge
    const nearestEdgeStoryGeometry = nearestEdge.previous_story ? this.previousStoryGeometry : this.currentStoryGeometry;
    const nearestEdgeV1 = geometryHelpers.vertexForId(nearestEdge.v1, nearestEdgeStoryGeometry);
    const nearestEdgeV2 = geometryHelpers.vertexForId(nearestEdge.v2, nearestEdgeStoryGeometry);

    // project point being tested to nearest edge
    var projection = geometryHelpers.projectionOfPointToLine(point, { p1: nearestEdgeV1, p2: nearestEdgeV2 });

    // look up distance between projection and point being tested
    const dist = this.distanceBetweenPoints(projection, point);
    // take the projection of the cursor to the edge
    // check if the angle of the segment defined by the cursor and projection is < the angle snap tolerance
    const snappableAngles = [-180, -90, 0, 90, 180];
    // angle between projection and mouse (degrees)
    const thetaDeg = Math.atan2(point.y - projection.y, point.x - projection.x)
    * (180 / Math.PI);

    // if the original projection is within the snap tolerance of one of the snapping angles
    // adjust the projection so that it is exactly at the snap angle
    // snap to -180, -90, 0, 90, 180
    snappableAngles.some((angle) => {
      // if the original projection is within the snap tolerance of one of the snapping angles
      // adjust the projection so that it is exactly at the snap angle
      if (Math.abs(thetaDeg - angle) < this.$store.getters['project/angleTolerance']) {
        // infer a line defining the desired projection
        var adjustedProjectionP1;
        var adjustedProjectionP2;
        if (angle === 180 || angle === 0 || angle === -180) {
          adjustedProjectionP1 = { x: point.x - (2 * dist), y: point.y }
          adjustedProjectionP2 = { x: point.x + (2 * dist), y: point.y }
        } else if (angle === 90 || angle === -90) {
          adjustedProjectionP1 = { x: point.x, y: point.y - (2 * dist) }
          adjustedProjectionP2 = { x: point.x, y: point.y + (2 * dist) }
        }
        // adjust the projection to be the intersection of the desired projection line and the nearest edge
        if (geometryHelpers.ptsAreCollinear(adjustedProjectionP1, nearestEdgeV1, adjustedProjectionP2)) {
          projection = nearestEdgeV1;
        } else if (geometryHelpers.ptsAreCollinear(adjustedProjectionP1, nearestEdgeV2, adjustedProjectionP2)) {
          projection = nearestEdgeV2;
        } else {
          projection = geometryHelpers.intersectionOfLines(adjustedProjectionP1, adjustedProjectionP2, nearestEdgeV1, nearestEdgeV2);
        }
        return true;
      }
      return false;
    });

    // return data for the edge if the projection is within the snap tolerance of the point
    if (dist < this.$store.getters['project/snapTolerance']) {
      return {
        snappingEdge: nearestEdge,
        dist: nearestEdge.dist,
        type: 'edge',
        // projection and snapping edge vertices translated into grid coordinates (to display snapping point and highlight edges)
        projection: { x: this.rwuToGrid(projection.x, 'x'), y: this.rwuToGrid(projection.y, 'y') },
        v1GridCoords: { x: this.rwuToGrid(nearestEdgeV1.x, 'x'), y: this.rwuToGrid(nearestEdgeV1.y, 'y') },
        v2GridCoords: { x: this.rwuToGrid(nearestEdgeV2.x, 'x'), y: this.rwuToGrid(nearestEdgeV2.y, 'y') }
      }
    }
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
    const
      width = this.$refs.grid.clientWidth,
      height = this.$refs.grid.clientHeight,
      xSpan = this.max_x - this.min_x,
      ySpan = this.max_y - this.min_y,
      xAccordingToY = ySpan * (width / height),
      yAccordingToX = xSpan * (height / width),
      xDiff = xAccordingToY - xSpan,
      yDiff = yAccordingToX - ySpan;

    if (xDiff < 0) {
      this.min_x -= xDiff / 2;
      this.max_x += xDiff / 2;
    } else {
      this.min_y -= yDiff / 2;
      this.max_y += yDiff / 2;
    }
  },
  nullTransform() {
    d3.select(this.$refs.grid).call(this.zoomBehavior.transform, d3.zoomIdentity);
  },
  // ****************** GRID ****************** //
  renderGrid() {
    const
      w = this.$refs.grid.clientWidth,
      h = this.$refs.grid.clientHeight;

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
      width = this.$refs.grid.clientWidth,
      height = this.$refs.grid.clientHeight;
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
      width = this.$refs.grid.clientWidth,
      height = this.$refs.grid.clientHeight;

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
    .scaleExtent([0.02, 200])
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

       [this.min_x, this.max_x] = newScaleX.domain();
       [this.min_y, this.max_y] = newScaleY.domain(); // inverted y axis

       this.axis_generator.x.scale(newScaleX);
       this.axis_generator.y.scale(newScaleY);
       this.clearHighlights();
       this.updateGrid();

       // axis padding
       this.padTickY(-12);

       // apply the zoom transform to image and polygon <g> tags.
       // (more efficient than a full re-render)
       this.translateEntities();
     })
     .on('end', () => {
       // redraw the saved geometry
       this.draw();
     });

    svg.call(this.zoomBehavior);
    svg
      .on('mousemove', this.handleMouseMove)
      .on('click', this.gridClicked);
  },
  translateEntities() {
    d3.selectAll('#grid svg .images, #grid svg .polygons')
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
      width = this.$refs.grid.clientWidth,
      height = this.$refs.grid.clientHeight,
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
