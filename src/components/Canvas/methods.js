const d3 = require('d3');
import helpers from './../../store/modules/geometry/helpers.js'

export default {
    calcSnap (e) {
        d3.selectAll('#canvas .snap').remove();
        var point;
        if (e.clientX === e.offsetX) {
            // when the user hovers over certain SVG child nodes, event locations are incorrect
            // adjust the offset value by the position of the canvas
            point = {
                x: this.scaleX(e.offsetX - this.$refs.grid.getBoundingClientRect().left),
                y: this.scaleY(e.offsetY - this.$refs.grid.getBoundingClientRect().top)
            };
        } else {
            point = {
                x: this.scaleX(e.offsetX),
                y: this.scaleY(e.offsetY)
            };
        }

        const vertex = this.snappingVertex(point);
        if (vertex) {
            d3.select('#canvas svg')
                .append('ellipse')
                .attr('cx', vertex.x)
                .attr('cy', vertex.y)
                .attr('rx', this.scaleX(5) - this.min_x)
                .attr('ry', this.scaleY(5) - this.min_y)
                .classed('snap', true)
                .attr('vector-effect', 'non-scaling-stroke');
            return;
        }

        const snappingEdge = this.snappingEdge(point);
        if (snappingEdge) {
            d3.select('#canvas svg')
                .append('line')
                .attr('x1', snappingEdge.v1.x)
                .attr('y1', snappingEdge.v1.y)
                .attr('x2', snappingEdge.v2.x)
                .attr('y2', snappingEdge.v2.y)
                .attr('stroke-width', 1)
                .classed('snap', true)
                .attr('vector-effect', 'non-scaling-stroke');

            d3.select('#canvas svg')
                .append('ellipse')
                .attr('cx', snappingEdge.scalar.x)
                .attr('cy', snappingEdge.scalar.y)
                .attr('rx', this.scaleX(2) - this.min_x)
                .attr('ry', this.scaleY(2) - this.min_y)
                .classed('snap', true)
                .attr('vector-effect', 'non-scaling-stroke');
        }
    },
    // handle a click on the canvas
    addPoint (e) {
        // subtract min % spacing to account for grid rounding offsets created by adjusted minimums
        const xAdjustment = this.min_x % this.x_spacing,
            yAdjustment = this.min_y % this.y_spacing;

        // obtain RWU coordinates of click event
        var point = {
            x: this.scaleX(e.offsetX),
            y: this.scaleY(e.offsetY)
        };

        var vertex = this.snappingVertex(point);
        var edge = this.snappingEdge(point);
        if (vertex) {
            // the point will have an id property and be a copy of an existing vertex
            // data store wil handle this by saving a reference to the existing vertex on the new face
            point = vertex;
        } else if (edge) {
            // the point will have an id property and be a copy of an existing vertex
            // data store wil handle this by saving a reference to the existing vertex on the new face
            point = edge.scalar;
            // mark the point so that the edge will be split on face creation
            point.splittingEdge = edge.edge;

        } else if (this.gridVisible) {
            // round point to nearest gridline if the grid is visible
            point.x = round(this.scaleX(e.offsetX) - xAdjustment, this.x_spacing) + xAdjustment;
            point.y = round(this.scaleY(e.offsetY) - yAdjustment, this.y_spacing) + yAdjustment;
        }

        if (this.currentMode === 'Rectangle' && this.points.length) {
            // if a rectangle is in progress, close the rectangle and convert it to a polygon
            this.$store.dispatch('geometry/createFaceFromPoints', {
                points: [
                    this.points[0],
                    {
                        x: point.x,
                        y: this.points[0].y
                    },
                    point,
                    {
                        x: this.points[0].x,
                        y: point.y
                    }
                ]
            });
            // clear the points in progress
            this.points = [];
        } else if (this.currentMode === 'Rectangle' || this.currentMode === 'Polygon') {
            // store the point
            this.points.push(point);
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
    },

    drawPoints () {
        // remove expired points
        d3.selectAll('#canvas ellipse').remove();

        // draw points
        d3.select('#canvas svg')
            .selectAll('ellipse').data(this.points)
            .enter().append('ellipse')
            .attr('cx', (d, i) => { return d.x; })
            .attr('cy', (d, i) => { return d.y; })
            .attr('rx', this.scaleX(2) - this.min_x)
            .attr('ry', this.scaleY(2) - this.min_y)
            .attr('vector-effect', 'non-scaling-stroke');

        // connect the points with a guideline
        this.drawPolygonEdges();

        // Polygon Origin
        d3.select('#canvas svg').select('ellipse')
            // set a click listener for the first point in the polygon, when it is clicked close the shape
            .on('click', () => {
                // create a face in the data store from the points
                this.$store.dispatch('geometry/createFaceFromPoints', {
                    points: this.points
                });
                // clear points, prevent a new point from being created by this click event
                d3.event.stopPropagation();
                this.points = [];
            })
            .attr('rx', this.scaleX(7) - this.min_x)
            .attr('ry', this.scaleY(7) - this.min_y)
            .classed('origin', true) // apply custom CSS for origin of polygons
            .attr('vector-effect', 'non-scaling-stroke');
    },
    drawPolygonEdges () {
        // remove expired paths
        d3.selectAll('#canvas path').remove();

        // draw edges
        d3.select('#canvas svg').append('path')
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
    drawPolygons () {
        // remove expired polygons
        d3.select('#canvas svg').selectAll('polygon').remove();

        // draw polygons
        d3.select('#canvas svg').selectAll('polygon')
            .data(this.polygons).enter()
            .append('polygon')
            .attr('points', (d, i) => {
                var pointsString = '';
                d.points.forEach((p) => {
                    pointsString += (p.x + ',' + p.y + ' ');
                });
                return pointsString;
            })
            .attr('class', (d, i) => {
                if (d.face_id === this.currentSpace.face_id) { return 'currentSpace'; }
            })
            .attr('vector-effect', 'non-scaling-stroke');

        // remove expired points and guidelines
        d3.selectAll('#canvas path').remove();
        d3.selectAll('#canvas ellipse').remove();
    },
    drawGrid () {
        // update scales with new grid boundaries
        this.$store.dispatch('application/setScaleX', {
            scaleX: d3.scaleLinear()
                .domain([0, this.$refs.grid.clientWidth])
                .range([this.min_x, this.max_x])
        });

        this.$store.dispatch('application/setScaleY', {
            scaleY: d3.scaleLinear()
                .domain([0, this.$refs.grid.clientHeight])
                .range([this.min_y, this.max_y])
        });

        var svg = d3.select('#canvas svg');
        svg.selectAll('line').remove();

        // redraw the grid if the grid is visible
        if (!this.$store.state.project.grid.visible) { return; }

        // lines are drawn in RWU
        svg.selectAll('.vertical')
            .data(d3.range(this.min_x / this.x_spacing, this.max_x / this.x_spacing))
            .enter().append('line')
            .attr('x1', (d) => { return d * this.x_spacing; })
            .attr('x2', (d) => { return d * this.x_spacing; })
            .attr('y1', this.min_y)
            .attr('y2', this.scaleY(this.$refs.grid.clientHeight))
            .attr('class', 'vertical')
            .attr('vector-effect', 'non-scaling-stroke');

        svg.selectAll('.horizontal')
            .data(d3.range(this.min_y / this.y_spacing, this.max_y / this.y_spacing))
            .enter().append('line')
            .attr('x1', this.min_x)
            .attr('x2', this.scaleX(this.$refs.grid.clientWidth))
            .attr('y1', (d) => { return d * this.y_spacing; })
            .attr('y2', (d) => { return d * this.y_spacing; })
            .attr('class', 'horizontal')
            .attr('vector-effect', 'non-scaling-stroke');

        d3.selectAll('.vertical, .horizontal').lower();
    },

    // return the set of vertices within the tolerance zone of a location
    snappingVertex (point) {
        const snappingCandidates = this.$store.getters['application/currentStoryGeometry'].vertices.filter((v) => {
            const dx = Math.abs(v.x - point.x),
                dy = Math.abs(v.y - point.y);
            return (dx < this.$store.getters['project/snapTolerance'] && dy < this.$store.getters['project/snapTolerance']);
        });

        if (snappingCandidates.length > 1) {
            return snappingCandidates.reduce((a, b) => {
                const aDx = Math.abs(a.x - point.x),
                    aDy = Math.abs(a.y - point.y),
                    bDx = Math.abs(b.x - point.x),
                    bDy = Math.abs(b.y - point.y);
                return aDx * aDy <= bDx * bDy ? a : b;
            });
        }

        return snappingCandidates[0];
    },
    // find the closest edge within the tolerance zone of a point
    snappingEdge (point) {
        const geometry = this.$store.getters['application/currentStoryGeometry'];

        // find the edges within the tolerance zone of a location
        const snappingCandidates = geometry.edges.map((e) => {
            const v1 = helpers.vertexForId(e.v1, geometry),
                v2 = helpers.vertexForId(e.v2, geometry);

            if (!v1 || !v2) { debugger; }
            
            const edgeResult = helpers.projectToEdge(point, v1, v2);
            return edgeResult ? {
                dist: edgeResult.dist,
                scalar: edgeResult.scalar,
                edge: e,
                v1: v1,
                v2: v2
            } : null;
        }).filter((eR) => {
            return eR && eR.dist < this.$store.getters['project/snapTolerance'];
        });
        if (snappingCandidates.length > 1) {
            return snappingCandidates.reduce((a, b) => {
                return a.dist <= b.dist ? a : b;
            });
        }

        return snappingCandidates[0];
    }
}
