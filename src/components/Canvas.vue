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
            // array of polygons drawn - going to be synced with navigation and displayed
            polygons: [],
            // space being drawn
            points: []
        };
    },
    computed: {
        // scales are used to translate pixel values obtained by clicking the grid into real world units used to map points to the grid
        scaleX () {
            return this.$store.state.application.scale.x;
        },
        scaleY () {
            return this.$store.state.application.scale.y;
        },
        // the spacing in RWU between gridlines
        x_spacing () {
            return this.$store.state.grid.x_spacing;
        },
        y_spacing () {
            return this.$store.state.grid.y_spacing;
        },

        // mix_x, min_y, max_x, and max_y are the grid dimensions in real world units
        min_x() {
            return this.$store.state.view.min_x;
        },
        min_y() {
            return this.$store.state.view.min_y;
        },
        max_x() {
            return this.$store.state.view.max_x;
        },
        max_y() {
            return this.$store.state.view.max_y;
        },
        viewbox: function() {
            return this.$store.state.view.min_x + ' ' +
                this.$store.state.view.min_y + ' ' +
                (this.$store.state.view.max_x - this.$store.state.view.min_x ) + ' ' +
                (this.$store.state.view.max_y - this.$store.state.view.min_y);
        }
    },
    // if the window changes size, redraw the grid
    mounted: function() {
        this.drawGrid();
        window.addEventListener('resize', this.drawGrid);
    },
    beforeDestroy: function () {
        window.removeEventListener('resize', this.drawGrid)
    },
    watch: {
        // if the real world unit dimensions or scales of the grid are altered, redraw it
        viewbox: function() {
            this.drawGrid();
        },
        x_spacing: function() {
            this.drawGrid();
        },
        y_spacing: function() {
            this.drawGrid();
        },
        // when a space is added, draw all polygons
        polygons: function() { this.drawPolygons(); },
        // when a point is added, draw all points
        points: function() { this.drawPoints(); }
    },
    methods: {
        addPoint: function(e) {
            var x = round(Math.max(2, Math.min(this.$refs.grid.clientWidth - 2, e.offsetX)), this.x_spacing),
                y = round(Math.max(2, Math.min(this.$refs.grid.clientHeight - 2, e.offsetY)), this.y_spacing);

            // the point is stored in RWU
            this.points.push({
                x: this.scaleX(x),
                y: this.scaleY(y)
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
                .attr('cx', (d, i) => {
                    return d.x;
                })
                .attr('cy', (d, i) => {
                    return d.y;
                })
                .attr('vector-effect', 'non-scaling-stroke')
                .attr('rx', this.scaleX(2) - this.min_x)
                .attr('ry', this.scaleY(2) - this.min_y);

            //connect the points with a guideline
            this.drawPolygonEdges();

            // set a click listener for the first point in the polynomial, when it is clicked close the shape
            d3.select('#canvas svg').select('ellipse')
                .on('click', () => {
                    // create the shape - triggers this.drawPolygons()
                    this.polygons.push({ points: this.points });

                    this.$store.commit('createFaceFromPoints', {
                        points: this.points
                    });

                    // clear points, prevent a new point from being created by this click event
                    d3.event.stopPropagation();
                    this.points = [];
                })
                // styles for the first point in the polygon
                .classed('origin', true)
                .attr('vector-effect', 'non-scaling-stroke')
                .attr('rx', this.scaleX(7) - this.min_x)
                .attr('ry', this.scaleY(7) - this.min_y);
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
        drawRects: function(e) {
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
        },
        drawGrid: function() {
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

            // draw the grid
            var svg = d3.select('#canvas svg')
                .attr('height', this.$refs.grid.clientHeight)
                .attr('width', this.$refs.grid.clientWidth);
            svg.selectAll('line').remove();

            // lines are drawn in RWU
            svg.selectAll('.vertical')
                .data(d3.range(1, this.$refs.grid.clientWidth / this.x_spacing))
                .enter().append('line')
                .attr('class', 'vertical')
                .attr('stroke-width', this.scaleX(1) - this.min_x)
                .attr('x1', (d) => { return this.scaleX(d * this.x_spacing); })
                .attr('y1', this.min_y)
                .attr('x2', (d) => { return this.scaleX(d * this.x_spacing); })
                .attr('y2', this.scaleY(this.$refs.grid.clientHeight));

            svg.selectAll('.horizontal')
                .data(d3.range(1, this.$refs.grid.clientHeight / this.y_spacing))
                .enter().append('line')
                .attr('class', 'horizontal')
                .attr('stroke-width', this.scaleY(1) - this.min_y)
                .attr('x1', this.min_x)
                .attr('y1', (d) => { return this.scaleY(d * this.y_spacing); })
                .attr('x2', this.scaleX(this.$refs.grid.clientWidth))
                .attr('y2', (d) => { return this.scaleY(d * this.y_spacing); });
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
