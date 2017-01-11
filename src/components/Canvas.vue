<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
    <div id="canvas">
        <svg ref="grid" @click="addPoint" :viewBox="viewbox" preserveAspectRatio="none"></svg>
    </div>
</template>

<script>
var d3 = require('d3');
export default {
    name: 'canvas',
    data: function() {
        return {
            polygons: [], // array of polygons drawn
            points: [] // points for the polygon currently being drawn
        };
    },
    // recalculate and draw the grid when the window resizes
    mounted: function() {
        this.drawGrid();
        window.addEventListener('resize', this.drawGrid);
    },
    beforeDestroy: function () {
        window.removeEventListener('resize', this.drawGrid)
    },
    computed: {
        // scale functions translate the pixel coordinates of a location on the screen into RWU coordinates to use within the SVG's grid system
        scaleX () { return this.$store.state.application.scale.x; },
        scaleY () { return this.$store.state.application.scale.y; },

        // the spacing in RWU between gridlines - one square in the grid will be x_spacing x y_spacing
        x_spacing () { return this.$store.state.grid.x_spacing; },
        y_spacing () { return this.$store.state.grid.y_spacing; },

        // mix_x, min_y, max_x, and max_y bound the portion of the canvas (in RWU) that is currently visible to the user
        min_x() { return this.$store.state.view.min_x; },
        min_y() { return this.$store.state.view.min_y; },
        max_x() { return this.$store.state.view.max_x; },
        max_y() { return this.$store.state.view.max_y; },

        // SVG viewbox is the portion of the svg grid (in RWU) that is currently visible to the user given the min_x, min_y, max_x, and max_y boundaries
        viewbox: function() {
            return this.$store.state.view.min_x + ' ' + // x
                this.$store.state.view.min_y + ' ' + // y
                (this.$store.state.view.max_x - this.$store.state.view.min_x ) + ' ' + // width
                (this.$store.state.view.max_y - this.$store.state.view.min_y); // height
        }
    },
    watch: {
        // if the  dimensions or spacing of the grid is altered, redraw it
        viewbox () { this.drawGrid(); },
        x_spacing () { this.drawGrid(); },
        y_spacing () { this.drawGrid(); },

        polygons: function() { this.drawPolygons(); },
        points: function() { this.drawPoints(); }
    },
    methods: {
        addPoint: function(e) {
            // the point is stored in RWU
            this.points.push({
                x: round(this.scaleX(e.offsetX), this.x_spacing),
                y: round(this.scaleY(e.offsetY), this.y_spacing)
            });

            function round(p, n) {
                return p % n < n / 2 ? p - (p % n) : p + n - (p % n);
            }
        },

        drawPoints: function() {
            // draw new points
            d3.select('#canvas svg')
                .selectAll('ellipse').data(this.points)
                .enter().append('ellipse')
                .attr('cx', (d, i) => { return d.x; })
                .attr('cy', (d, i) => { return d.y; })
                .attr('rx', this.scaleX(2) - this.min_x)
                .attr('ry', this.scaleY(2) - this.min_y)
                .attr('vector-effect', 'non-scaling-stroke');

            //connect the points with a guideline
            this.drawPolygonEdges();

            // set a click listener for the first point in the polynomial, when it is clicked close the shape
            d3.select('#canvas svg').select('ellipse')
                .on('click', () => {
                    // create the polygon - triggers this.drawPolygons()
                    this.polygons.push({ points: this.points });

                    // create a face in the data store from the points
                    this.$store.commit('createFaceFromPoints', {
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
        drawPolygonEdges: function() {
            // remove expired paths
            d3.selectAll("#canvas path").remove();

            var line = d3.line()
                .x((d) => { return d.x; })
                .y((d) => { return d.y; });

            d3.select('#canvas svg').append("path")
                .datum(this.points)
                .attr("fill", "none")
                .attr('vector-effect', 'non-scaling-stroke')
                .attr("d", line)
                // prevent overlapping the points - screws up click events
                .lower();

            // keep grid lines under polygon edges
            d3.selectAll('.vertical, .horizontal').lower();
        },
        drawPolygons: function() {
            // draw a polygon for each space
            d3.select('#canvas svg').selectAll('polygon')
                .data(this.polygons).enter()
                .append('polygon')
                .attr('points', (d, i) => {
                    var pointsString = "";
                    d.points.forEach((p) => {
                        pointsString += (p.x + ',' + p.y + ' ');
                    });
                    return pointsString;
                })
                .attr('vector-effect', 'non-scaling-stroke');

            //remove expired points and guidelines
            d3.selectAll("#canvas path").remove();
            d3.selectAll('#canvas ellipse').remove();
        },
        drawGrid: function() {
            // update scales with new grid boundaries
            this.$store.commit('setScaleX', {
                scaleX: d3.scaleLinear()
                    .domain([0, this.$refs.grid.clientWidth])
                    .range([this.$store.state.view.min_x, this.$store.state.view.max_x])
            });

            this.$store.commit('setScaleY', {
                scaleY: d3.scaleLinear()
                    .domain([0, this.$refs.grid.clientHeight])
                    .range([this.$store.state.view.min_y, this.$store.state.view.max_y])
            });

            // redraw the grid
            var svg = d3.select('#canvas svg');
            svg.selectAll('line').remove();

            // lines are drawn in RWU
            svg.selectAll('.vertical')
                .data(d3.range(0, (this.$store.state.view.max_x - this.$store.state.view.min_x) / this.x_spacing))
                .enter().append('line')
                .attr('x1', (d) => { return d * this.x_spacing + this.$store.state.view.min_x; })
                .attr('x2', (d) => { return d * this.x_spacing + this.$store.state.view.min_x; })
                .attr('y1', this.min_y)
                .attr('y2', this.scaleY(this.$refs.grid.clientHeight))
                .attr('class', 'vertical')
                .attr('vector-effect', 'non-scaling-stroke');

            svg.selectAll('.horizontal')
                .data(d3.range(1, (this.$store.state.view.max_y - this.$store.state.view.min_y) / this.y_spacing))
                .enter().append('line')
                .attr('x1', this.min_x)
                .attr('x2', this.scaleX(this.$refs.grid.clientWidth))
                .attr('y1', (d) => { return d * this.y_spacing + this.$store.state.view.min_y; })
                .attr('y2', (d) => { return d * this.y_spacing + this.$store.state.view.min_y; })
                .attr('class', 'horizontal')
                .attr('vector-effect', 'non-scaling-stroke');

            d3.selectAll('.vertical, .horizontal').lower();
        }
    }
}

</script>
<style lang="scss" scoped>
@import "./../scss/config";
// we can't style the dynamically created d3 elements here, put those styles in the scss folder
#canvas {
    background-color: $gray-darkest;
    svg {
        height: 100%;
        width: 100%;
        .horizontal, .vertical {
            fill: gray;
        }
    }
}
</style>

<!-- drawRects: function(e) {
    d3.select('#canvas svg').selectAll('rect')
        .data(this.rects).enter()
        .append('rect')
        .attr('x', (d, i) => {
            return d.origin.x;
        })
        .attr('y', (d, i) => {
            return d.origin.y;
        })
        .attr('width', (d, i) => {
            return d.size.width;
        })
        .attr('height', (d, i) => {
            return d.size.height;
        });
}, -->
