// OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
// (1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
// (2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
// (3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
// (4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

const d3 = require('d3');
import geometryHelpers from './../../store/modules/geometry/helpers.js'
import modelHelpers from './../../store/modules/models/helpers.js'

export default {
    // ****************** USER INTERACTION EVENTS ****************** //
    /*
    * When a mousemove event is triggered on the grid and
    * the 'Rectangle' or 'Polygon' tool is active and a space or shading is selected or the 'Eraser' tool is active
    * look up the snap target for the location of the event, highlight it, and render a guide point
    * if there is no snap target, use the event location
    */
    highlightSnapTarget (e) {
        // only highlight snap targets in drawing modes when a space or shading has been selected
        if (this.currentTool !== 'Eraser' && ((this.currentTool !== 'Rectangle' && this.currentTool !== 'Polygon') || (!this.currentSpace && !this.currentShading))) { return; }

        // unhighlight expired snap targets
        d3.selectAll('#grid .highlight, #grid .gridpoint').remove();

        // location of the mouse in grid units
        const gridPoint = {
            x: this.pxToGrid(e.offsetX, 'x'),
            y: this.pxToGrid(e.offsetY, 'y')
        };

        const snapTarget = this.findSnapTarget(gridPoint);

        // render a line and point showing which geometry would be created with a click at this location
        var guidePoint = snapTarget.type === 'edge' ? snapTarget.projection : snapTarget;
        this.drawGuideLines(e, guidePoint);

        // if snapping to an edisting edge or radius, draw a larger point, if snapping to the grid or just displaying the location of the pointer, create a small point
        if (snapTarget.type === 'edge' || snapTarget.type === 'vertex') {
            d3.select('#grid svg')
                .append('ellipse')
                .attr('cx', guidePoint.x, 'x')
                .attr('cy', guidePoint.y, 'y')
                .attr('rx', this.calcRadius(5, 'x'))
                .attr('ry', this.calcRadius(5, 'y'))
                .classed('highlight', true)
                .attr('vector-effect', 'non-scaling-stroke');
        } else {
            d3.select('#grid svg')
                .append('ellipse')
                .attr('cx', guidePoint.x)
                .attr('cy', guidePoint.y)
                .attr('rx', this.calcRadius(2, 'x'))
                .attr('ry', this.calcRadius(2, 'y'))
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

    /*
    * called on mousemove events, shows the user what geometry will be created by clicking at the current mouse location by
    * drawing a guide rectangle or a guideline between the last point drawn and the guidepoint
    */
    drawGuideLines (e, guidePoint) {
        if (!this.points.length) { return; }

        // remove expired guideline paths
        d3.selectAll('#grid .guideline').remove();

        var guidelinePoints;

        // if the polygon tool is active, draw a line connecting the last point in the polygon to the guide point
        // if the rectangle or eraser tool is active, infer a rectangle from the first point that was drawn and the guide point
        if (this.currentTool === 'Polygon') {
            guidelinePoints = [guidePoint, this.points[this.points.length - 1]];
        } else if (this.currentTool === 'Rectangle' || this.currentTool === 'Eraser') {
            guidelinePoints = [
                this.points[0],
                { x: guidePoint.x, y: this.points[0].y },
                guidePoint,
                { x: this.points[0].x, y: guidePoint.y },
                this.points[0]
            ];
        }

        // render a guideline or rectangle
        d3.select('#grid svg').append('path')
            .datum(guidelinePoints)
            .attr('fill', 'none')
            .classed('guideline', true)
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('d', d3.line()
                .x((d) => { return d.x; })
                .y((d) => { return d.y; }))
            .lower();

        d3.selectAll('.vertical, .horizontal').lower();
    },

    /*
    * When a click event is triggered on the grid and the 'Eraser' tool is being used or
    * the 'Rectangle' or 'Polygon' tool is being used and a space or shading is selected
    * look up the snap target for the location of the event and create a new point with its coordinates
    * if there is no snap target, use the event location
    */
    addPoint (e) {
        // if no space or shading is selected, disable drawing
        if (this.currentTool !== 'Eraser' &&
            ((this.currentTool !== 'Rectangle' && this.currentTool !== 'Polygon') || (!this.currentSpace && !this.currentShading))
        ) { return; }

        if (this.currentTool === 'Select') {
            this.$store.dispatch('application/setCurrentSpace', { 'space': null });
            this.$store.dispatch('application/setCurrentShading', { 'shading': null });
        }

        const gridPoint = {
                x: this.pxToGrid(e.offsetX, 'x'),
                y: this.pxToGrid(e.offsetX, 'y')
            },
            // location of the mouse in real world units
            rwuPoint = {
                x: this.pxToGrid(e.offsetX, 'x'),
                y: this.pxToGrid(e.offsetX, 'y')
            };
        // // translate click event coordinates into RWU
        var point = {
            x: this.pxToGrid(e.offsetX, 'x'),
            y: this.pxToGrid(e.offsetY, 'y')
        };

        /*
        * check for snapping - if the click happened within the tolerance range of a
        * vertex: reuse that vertex on the face being created
        * edge: create a new vertex at the projection from the click location to the edge,
        *     set a flag to split the edge at the new vertex
        * origin of polygon: close the polygon being drawn
        */
        var snapTarget = this.findSnapTarget(rwuPoint);
        if (snapTarget) {
            if (snapTarget.type === 'vertex') {
                // if the snapTarget is the origin of the face being drawn in Polygon mode, close the face
                if (snapTarget.origin && this.currentTool === 'Polygon') {
                    // store the points in the polygon as a face
                    this.savePolygonFace();
                    return;
                }
                // data store will detect that the new point already has an id value
                // will save a reference to the existing vertex on the new face instead of creating a new vertex
                point = snapTarget;
            } else if (snapTarget.type === 'edge') {
                // create a vertex on the edge at the location closest to the mouse event (projection)
                point = snapTarget.projection;
                // mark the point so that the edge will be split during face creation
                point.splittingEdge = snapTarget.snappingEdge;
            }
        }
        // if no snapTarget was found and the grid is visible snap to the grid
        else if (this.gridVisible) {
            const xAdjustment = +this.xAxis.select('.tick').attr('transform').replace('translate(', '').replace(')', '').split(',')[0],
                yAdjustment = +this.yAxis.select('.tick').attr('transform').replace('translate(', '').replace(')', '').split(',')[1];

            const xTickSpacing = this.rwuToGrid(this.spacing + this.min_x, 'x'),
                yTickSpacing = this.rwuToGrid(this.spacing + this.min_y, 'y');

            // round point RWU coordinates to nearest gridline
            snapTarget = {
                type: 'vertex',
                x: round(point.x, this.rwuToGrid(this.spacing + this.min_x, 'x')) + xAdjustment,
                y: round(point.y, this.rwuToGrid(this.spacing + this.min_y, 'y')) + yAdjustment
            };

            snapTarget.x = Math.abs(point.x - (snapTarget.x - xTickSpacing)) >  Math.abs(point.x - snapTarget.x) ? snapTarget.x : snapTarget.x - xTickSpacing;
            snapTarget.y = Math.abs(point.y - (snapTarget.y - yTickSpacing)) >  Math.abs(point.y - snapTarget.y) ? snapTarget.y : snapTarget.y - yTickSpacing;

            point.x = snapTarget.x;
            point.y = snapTarget.y;
        }

        // if we are in polygon mode and the snapped gridpoint is within the tolerance zone of the origin of the face being drawn, close the face
        if (this.points[0] && this.currentTool === 'Polygon') {
            const distToOrigin = Math.sqrt(
                Math.pow(Math.abs(point.x - this.points[0].x), 2) +
                Math.pow(Math.abs(point.y - this.points[0].y), 2)
            );

            if (distToOrigin < this.$store.getters['project/snapTolerance']) {
                // store the points in the polygon as a face
                this.savePolygonFace();
                return;
            }
        }

        // store the point
        if (this.currentTool === 'Rectangle' || this.currentTool === 'Polygon' || this.currentTool === 'Eraser') {
            this.points.push(point);
        }

        // create a rectangular face if two points have been drawn to the grid in rectangle tool
        if ((this.currentTool === 'Rectangle' || this.currentTool === 'Eraser') && this.points.length === 2) {
            this.currentTool === 'Rectangle' ? this.saveRectuangularFace() : this.eraseRectangularSelection();
        }
    },

    // ****************** SAVING FACES ****************** //
    /*
    * create a rectangular face from the two points on the grid
    * save the rectangle as a face for the selected space or shading
    */
    saveRectuangularFace () {
        // infer 4 corners of the rectangle based on the two points that have been drawn
        const payload = {
            points: [
                this.points[0],
                { x: this.points[1].x, y: this.points[0].y },
                this.points[1],
                { x: this.points[0].x, y: this.points[1].y }
            ]
        };

        if (this.currentSpace) {
            payload.space = this.currentSpace;
        } else if (this.currentShading) {
            payload.shading = this.currentShading;
        }

        // scale points to RWU
        payload.points = payload.points.map(p => ({
            x: this.gridToRWU(p.x, 'x'),
            y: this.gridToRWU(p.y, 'y')
        }));
        this.$store.dispatch('geometry/createFaceFromPoints', payload);
        this.points = [];
    },

    /*
    * create a polygon face from all points on the grid
    * save the face for the selected space or shading
    */
    savePolygonFace () {
        const payload = {
            points: this.points
        };
        if (this.currentSpace) {
            payload.space = this.currentSpace;
        } else if (this.currentShading) {
            payload.shading = this.currentShading;
        }

        payload.points = payload.points.map(p => ({
            x: this.gridToRWU(p.x, 'x'),
            y: this.gridToRWU(p.y, 'y')
        }));

        this.$store.dispatch('geometry/createFaceFromPoints', payload);
        this.points = [];
    },


    // ****************** ERASING FACES ****************** //
    /*
    * cut out a rectangular selection based on the two points on the grid
    * save the rectangle as a face for the selected space or shading
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

        this.$store.dispatch('geometry/eraseSelection', payload);
        this.points = [];
    },


    // ****************** d3 RENDERING ****************** //
    /*
    * render points for the face being created
    */
    drawPoints () {
        // remove expired points
        d3.selectAll('#grid ellipse').remove();

        // draw points
        d3.select('#grid svg')
            .selectAll('ellipse').data(this.points)
            .enter().append('ellipse')
            .attr('cx', (d, i) => { return d.x; })
            .attr('cy', (d, i) => { return d.y; })
            .attr('rx', this.calcRadius(2, 'x'))
            .attr('ry', this.calcRadius(2, 'y'))
            .attr('vector-effect', 'non-scaling-stroke');

        // connect the points with a guideline
        this.connectGridPoints();

        // when the first point in the polygon is clicked, close the shape
        d3.select('#grid svg').select('ellipse')
            .attr('rx', this.calcRadius(7, 'x'))
            .attr('ry', this.calcRadius(7, 'y'))
            .classed('origin', true) // apply custom CSS for origin of polygons
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('fill', 'none');
    },

    /*
    * render a line connecting all points for the face being drawn
    */
    connectGridPoints () {
        // remove expired paths
        d3.selectAll('#grid path').remove();

        // draw edges
        d3.select('#grid svg').append('path')
            .datum(this.points)
            .attr('fill', 'none')
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('d', d3.line()
                .x((d) => { return d.x; })
                .y((d) => { return d.y; }))
            // prevent edges from overlapping points - interferes with click events
            .lower();

        // keep grid lines under polygon edges
        d3.selectAll('.vertical, .horizontal').lower();
    },

    /*
    * render saved faces
    */
    drawPolygons () {
        // remove expired polygons
        d3.select('#grid svg').selectAll('polygon').remove();

        // draw polygons
        d3.select('#grid svg').selectAll('polygon')
            .data(this.polygons).enter()
            .append('polygon')
            .on('click', (d) => {
                if (this.currentTool === 'Select') {
                    d3.event.stopPropagation();
                    const model = modelHelpers.modelForFace(this.$store.state.models, d.face_id);
                    if (model.type === 'space') {
                        this.$store.dispatch('application/setCurrentSpace', { 'space': model });
                    } else if (model.type === 'shading') {
                        this.$store.dispatch('application/setCurrentShading', { 'shading': model });
                    }
                }
            })
            .attr('points', (d, i) => {
                var pointsString = '';
                d.points.forEach((p) => {
                    p = {
                        x: this.rwuToGrid(p.x, 'x'),
                        y: this.rwuToGrid(p.y, 'y')
                    };
                    pointsString += (p.x + ',' + p.y + ' ');
                });
                return pointsString;
            })
            .attr('class', (d, i) => {
                if (this.currentSpace && d.face_id === this.currentSpace.face_id) { return 'currentSpace'; }
                if (this.currentShading && d.face_id === this.currentShading.face_id) { return 'currentShading'; }
            })
            .attr('fill', d => d.color)
            .attr('vector-effect', 'non-scaling-stroke');



        // remove expired points and guidelines
        d3.selectAll('#grid path').remove();
        d3.selectAll('#grid ellipse').remove();
    },

    // ****************** SNAPPING TO EXISTING GEOMETRY ****************** //
    /*
    * given a point in grid units, finds the closest vertex or edge within its snap tolerance
    * if no vertex or edge is within the snap tolerance, returns the closest grid point or the location of the event if the grid is inactive
    * snapTarget is returned in grid coordinates
    */
    findSnapTarget (gridPoint) {
        const rwuPoint = {
            x: this.gridToRWU(gridPoint.x, 'x'),
            y: this.gridToRWU(gridPoint.y, 'y')
        };
        // if a vertex exists within the snap tolerance, don't check for edges
        const snappingVertex = this.snappingVertexData(rwuPoint);
        if (snappingVertex) {
            return snappingVertex;
        }

        const snappingEdge = this.snappingEdgeData(rwuPoint);
        if (snappingEdge) {
            return snappingEdge;
        }

        // no vertices or edges are within range, snap to the grid or return location of the event in grid coordinates
        if (!this.gridVisible) {
            return {
                type: 'gridpoint',
                ...gridPoint
            };
        } else {
            // offset of the first gridline on each axis
            const xOffset = +this.xAxis.select('.tick').attr('transform').replace('translate(', '').replace(')', '').split(',')[0],
                yOffset = +this.yAxis.select('.tick').attr('transform').replace('translate(', '').replace(')', '').split(',')[1],

                // spacing between ticks in grid units
                xTickSpacing = this.rwuToGrid(this.spacing + this.min_x, 'x'),
                yTickSpacing = this.rwuToGrid(this.spacing + this.min_y, 'y');

            // round point RWU coordinates to nearest gridline, adjust by grid offset
            const snapTarget = {
                type: 'gridpoint',
                x: round(gridPoint.x, this.rwuToGrid(this.spacing + this.min_x, 'x')) + xOffset,
                y: round(gridPoint.y, this.rwuToGrid(this.spacing + this.min_y, 'y')) + yOffset
            };

            snapTarget.x = Math.abs(gridPoint.x - (snapTarget.x - xTickSpacing)) > Math.abs(gridPoint.x - snapTarget.x) ? snapTarget.x : snapTarget.x - xTickSpacing;
            snapTarget.y = Math.abs(gridPoint.y - (snapTarget.y - yTickSpacing)) > Math.abs(gridPoint.y - snapTarget.y) ? snapTarget.y : snapTarget.y - yTickSpacing;

            return snapTarget;
        }
    },

    /*
    * given a point in RWU, look up the closest vertex that is available for snapping in the grid
    * if the vertex is within the snap tolerance of the point, return the coordinates of the vertex in grid units
    * and the distance from the vertex to the point
    */
    snappingVertexData (point) {
        // build a list of vertices (in RWU) available for snapping
        // deep copy all vertices on the current story
        var snappableVertices = JSON.parse(JSON.stringify(this.currentStoryGeometry.vertices));

        // TODO: conditionally combine this list with vertices from the next story down if it is visible
        // if (this.previousStoryVisible) { snappableVertices = snappableVertices.concat(JSON.parse(JSON.stringify(previousStoryVertices))); }

        // allow snapping to the origin of the polygon (to close the face)
        // if the polygon tool is active and the polygon being drawn has at least 3 existing points
        if (this.points.length >= 3 && this.currentTool === 'Polygon') {
            // convert the polygon origin from grid units to real world units before adding it as a snappable vertex
            snappableVertices.push({
                x: this.gridToRWU(this.points[0].x, 'x'),
                y: this.gridToRWU(this.points[0].y, 'y'),
                origin: true // set a flag to mark the origin
            });
        }

        // find the vertex closest to the point being tested
        if (!snappableVertices.length) { return; }
        const nearestVertex = snappableVertices.reduce((a, b) => {
            const aDist = this.distanceBetweenPoints(a, point),
                bDist = this.distanceBetweenPoints(b, point);
            return aDist < bDist ? a : b;
        });

        // check that the nearest vertex is within the snap tolerance of the point
        if (this.distanceBetweenPoints(nearestVertex, point) < this.$store.getters['project/snapTolerance']) {
            return {
                x: this.rwuToGrid(nearestVertex.x, 'x'),
                y: this.rwuToGrid(nearestVertex.y, 'y'),
                origin: nearestVertex.origin,
                type: 'vertex'
            };
        }
    },

    /*
    * given a point in RWU, look up the closest edge that is available for snapping in the grid
    * if the projection of the point to the edge is within the snap tolerance of the point
    * return the edge and coordinates of the projection in grid units
    * and the distance from the vertex to the point
    */
    snappingEdgeData (point) {
        // build a list of edges (in RWU) available for snapping
        // deep copy all vertices on the current story
        var snappableEdges = JSON.parse(JSON.stringify(this.currentStoryGeometry.edges));

        // TODO: conditionally combine this list with edges from the next story down if it is visible
        // if (this.previousStoryVisible) { snappableEdges = snappableEdges.concat(JSON.parse(JSON.stringify(previousStoryEdges))); }

        // find the edge closest to the point being tested
        if (!snappableEdges.length) { return; }
        const nearestEdge = snappableEdges.reduce((a, b) => {
            // look up vertices associated with edges
            const aV1 = geometryHelpers.vertexForId(a.v1, this.currentStoryGeometry),
                aV2 = geometryHelpers.vertexForId(a.v2, this.currentStoryGeometry),

                bV1 = geometryHelpers.vertexForId(b.v1, this.currentStoryGeometry),
                bV2 = geometryHelpers.vertexForId(b.v2, this.currentStoryGeometry);

            // project point being tested to each edge
            const aProjection = geometryHelpers.projectToEdge(point, aV1, aV2).projection,
                bProjection = geometryHelpers.projectToEdge(point, bV1, bV2).projection;

            // look up distance between projection and point being tested
            const aDist = this.distanceBetweenPoints(aProjection, point),
                bDist = this.distanceBetweenPoints(bProjection, point);

            // return data for the edge with the closest projection to the point being tested
            return aDist < bDist ? a : b;
        });

        // look up vertices associated with nearest edge
        const nearestEdgeV1 = geometryHelpers.vertexForId(nearestEdge.v1, this.currentStoryGeometry),
            nearestEdgeV2 = geometryHelpers.vertexForId(nearestEdge.v2, this.currentStoryGeometry),
            // project point being tested to nearest edge
            projection = geometryHelpers.projectToEdge(point, nearestEdgeV1, nearestEdgeV2).projection,
            // look up distance between projection and point being tested
            dist = this.distanceBetweenPoints(projection, point);

        // check that the projection of the test point to the nearest edge is within the snap tolerance of the point
        if (dist < this.$store.getters['project/snapTolerance']) {
            return {
                snappingEdge: nearestEdge,
                dist: nearestEdge.dist,
                type: 'edge',
                // projection and snapping edge vertices translated into grid coordinates (to display snapping point)
                projection: { x: this.rwuToGrid(projection.x, 'x'), y: this.rwuToGrid(projection.y, 'y') },
                v1GridCoords: { x: this.rwuToGrid(nearestEdgeV1.x, 'x'), y: this.rwuToGrid(nearestEdgeV1.y, 'y') },
                v2GridCoords: { x: this.rwuToGrid(nearestEdgeV2.x, 'x'), y: this.rwuToGrid(nearestEdgeV2.y, 'y') }
            }
        }
    },

    // ****************** GRID ****************** //
    calcGrid () {
        // save the original scale values, calculate new scales in the zoom handler based on these
        // recalculating new scales from the already updated scales results in exponential growth
        this.originalScales = {
            x: d3.scaleLinear()
                .domain([0, this.$refs.grid.clientWidth])
                .range([this.min_x, this.max_x]),
            y: d3.scaleLinear()
                .domain([0, this.$refs.grid.clientHeight])
                .range([this.min_y, this.max_y])
        };

        const zoomScaleX = d3.scaleLinear()
                .domain([this.min_x, this.max_x])
                .range([this.min_x, this.max_x]),
            zoomScaleY = d3.scaleLinear()
                .domain([this.min_y, this.max_y])
                .range([this.min_y, this.max_y]);

        // scaleX amd scaleY are used during drawing to translate from px to RWU given the current grid dimensions in rwu
        // these are updated in the zoom handler
        this.scaleX = this.originalScales.x;
        this.scaleY = this.originalScales.y;

        var svg = d3.select('#grid svg'),
            // rwu dimensions (coordinates used within grid)
            rwuHeight = this.max_y - this.min_y,
            rwuWidth = this.max_x - this.min_x;

        const tickCount = rwuHeight / this.spacing,
            aspectRatio = rwuWidth / rwuHeight;

        // generator functions for axes
        const xAxisGenerator = d3.axisBottom(zoomScaleX)
                // calculate number of horizontal ticks based on the aspect ratio of the svg element and the real world unit height
                .ticks(tickCount * aspectRatio) // number of ticks (multiplied by width to height ratio)
                .tickSize(rwuHeight) // length of tick marks (full height of grid in rwu coming up from x axis)
                .tickPadding(this.scaleY(-20)), // padding between axisBottom and tick text (20px translated to rwu)
            yAxisGenerator = d3.axisRight(zoomScaleY)
                .ticks(tickCount) // number of ticks
                .tickSize(rwuWidth) // length of tick marks (full width of grid in rwu coming up from y axis)
                .tickPadding(this.scaleX(-20)); // padding between axisRight and tick text (20px translated to rwu)

        this.xAxis = svg.append('g')
            .attr('class', 'axis axis--x')
            // .style('font-size', '20')
            .attr('stroke-width', this.scaleY(1))
            .call(xAxisGenerator);
        this.yAxis = svg.append('g')
            .attr('class', 'axis axis--y')
            // .style('font-size', '20')
            .attr('stroke-width', this.scaleX(1))
            .call(yAxisGenerator);


        // configure zoom behavior in rwu
        const zoomBehavior = d3.zoom()
            .extent([[0, 0], [rwuWidth, rwuHeight]])
            // scale must be between .5 * original bounds and 2 * original bounds
            // .scaleExtent([.5, 10])
            // allow panning by 20 rwu in any direction
            // .translateExtent([[-20, -20], [rwuWidth + 20, rwuHeight + 20]])
            .on('zoom', () => {
                // NOTE: don't change the original scale or you'll get exponential growth
                // x = d3.event.transform.rescaleX(x)
                // y = d3.event.transform.rescaleX(y)


                // create updated copies of the scales based on the zoom transformation
                const newScaleX = d3.event.transform.rescaleX(this.originalScales.x),
                    newScaleY = d3.event.transform.rescaleY(this.originalScales.y);

                [this.min_x, this.max_x] = newScaleX.domain();
                [this.min_y, this.max_y] = newScaleY.domain();

                // this.scaleX = newScaleX;
                // this.scaleY = newScaleY;

                const scaledRwuHeight = newScaleY.domain()[0] - newScaleY.domain()[1],
                    scaledRwuWidth = newScaleX.domain()[0] - newScaleX.domain()[1]

                // update the number of ticks to display based on the post zoom real world unit height and width
                this.yAxis.call(yAxisGenerator.ticks(-tickCount * (scaledRwuHeight / rwuHeight)));
                this.xAxis.call(xAxisGenerator.ticks(-tickCount * aspectRatio * (scaledRwuWidth / rwuWidth)));

                // create transformed copies of the scales and apply them to the axes
                this.xAxis.call(xAxisGenerator.scale(newScaleX));
                this.yAxis.call(yAxisGenerator.scale(newScaleY));
                // rescale the saved geometry
                this.drawPolygons();
                // d3.select('#grid svg').selectAll('polygon').attr('transform', d3.event.transform)

            });

        svg.call(zoomBehavior);
    },

    // ****************** SCALING FUNCTIONS ****************** //
    /*
    * take a pixel value (from a mouse event), find the corresponding real world units (for snapping to saved geometry in RWU)
    */
    pxToRWU (px, axis) {
        if (axis === 'x') {
            const currentScaleX = d3.scaleLinear()
                    .domain([0, this.$refs.grid.clientWidth])
                    .range([this.min_x, this.max_x]);
            return currentScaleX(px);
        } else if (axis === 'y') {
            const currentScaleY = d3.scaleLinear()
                   .domain([0, this.$refs.grid.clientHeight])
                   .range([this.min_y, this.max_y]);
            return currentScaleY(px);
        }
    },
    /*
    * take a pixel value (from a mouse event), find the corresponding coordinates in the svg grid
    */
    pxToGrid (px, axis) {
        if (axis === 'x') {
            return this.originalScales.x(px);
        } else if (axis === 'y') {
            return this.originalScales.y(px);
        }
    },

    /*
    * take a rwu value (from the datastore), find the corresponding coordinates in the svg grid
    */
    rwuToGrid (rwu, axis) {
        if (axis === 'x') {
            const currentScaleX = d3.scaleLinear()
                    .domain([0, this.$refs.grid.clientWidth])
                    .range([this.min_x, this.max_x]),
                pxValue = currentScaleX.invert(rwu);
            return this.pxToGrid(pxValue, axis);
        } else if (axis === 'y') {
            const currentScaleY = d3.scaleLinear()
                   .domain([0, this.$refs.grid.clientHeight])
                   .range([this.min_y, this.max_y]),
                pxValue = currentScaleY.invert(rwu);
            return this.pxToGrid(pxValue, axis);
        }
    },

    /*
    * take a grid value (from some point already rendered to the grid) and translate it into RWU for persistence to the datastore
    */
    gridToRWU (gridValue, axis) {
        if (axis === 'x') {
            const currentScaleX = d3.scaleLinear()
                    .domain([0, this.$refs.grid.clientWidth])
                    .range([this.min_x, this.max_x]),
                pxValue = this.originalScales.x.invert(gridValue);
            return currentScaleX(pxValue);
        } else if (axis === 'y') {
            const currentScaleY = d3.scaleLinear()
                   .domain([0, this.$refs.grid.clientHeight])
                   .range([this.min_y, this.max_y]),
                pxValue = this.originalScales.y.invert(gridValue);
            return currentScaleY(pxValue);
        }
    },


    /*
    * calc point radius, adjusting by the minimum x and y values for the grid to prevent stretched points
    */
    calcRadius (pxRad, axis) {
        var r;
        if (axis === 'x') {
            r = this.originalScales.x(pxRad)  ;
        } else if (axis === 'y') {
            r = this.originalScales.y(pxRad)  ;
        }

        return r;
    },

    distanceBetweenPoints (p1, p2) {
        const dx = Math.abs(p1.x - p2.x),
            dy = Math.abs(p1.y - p2.y);
        return Math.sqrt((dx * dx) + (dy * dy));
    }
}

function round (point, spacing) {
    var result,
        sign = point < 0 ? -1 : 1;
    point = Math.abs(point);
    if (point % spacing < spacing / 2) {
        result = point - (point % spacing);
    } else {
        result = point + spacing - (point % spacing);
    }
    // handle negatives
    result *= sign;
    // floating point precision
    return Math.round(result * 10000000000000) / 10000000000000;
}
