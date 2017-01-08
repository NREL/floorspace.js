<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
    <div id="canvas">
        <svg ref="grid" @click="addPoint" viewBox="0 0 1000 1000" preserveAspectRatio="none"></svg>
    </div>
</template>

<script>
var d3 = require('d3');
//var this.scaleX, this.scaleY;
export default {
    name: 'canvas',
    data: function() {
        return {
            gridResolution: 20,
            // array of spaces drawn - going to be synced with navigation and displayed
            spaces: [],
            // space being drawn
            points: []
        };
    },
    computed: {
        scaleX () {
            return this.$store.state.application.scale.x;
        },
        scaleY () {
            return this.$store.state.application.scale.y;
        }
    },
    mounted: function() {
        this.drawGrid();
        window.addEventListener('resize', this.drawGrid);
    },
    beforeDestroy: function () {
        window.removeEventListener('resize', this.drawGrid)
    },
    watch: {
        // when a space is added, draw all spaces
        spaces: function() { this.drawPolygonSpaces(); },
        // when a point is added, draw all points
        points: function() { this.drawPoints(); }
    },
    methods: {
        addPoint: function(e) {
            var x = round(Math.max(2, Math.min(this.$refs.grid.clientWidth - 2, e.offsetX)), this.gridResolution),
                y = round(Math.max(2, Math.min(this.$refs.grid.clientHeight - 2, e.offsetY)), this.gridResolution);

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
                .attr('rx', this.scaleX(2))
                .attr('ry', this.scaleY(2));

            //connect the points with a guideline
            this.drawPolygonEdges();

            // set a click listener for the first point in the polynomial, when it is clicked close the shape
            d3.select('#canvas svg').select('ellipse')
                .on('click', () => {
                    // create the shape - triggers this.drawPolygonSpaces()
                    this.spaces.push({ points: this.points });

                    this.$store.commit('createFaceFromPoints', {
                        points: this.points
                    });

                    // clear points, prevent a new point from being created by this click event
                    d3.event.stopPropagation();
                    this.points = [];
                })
                // styles for the first point in the polygon
                .classed('origin', true)
                .attr('rx', this.scaleX(7))
                .attr('ry', this.scaleY(7));
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
                .attr("stroke-width", "1")
                .attr("d", line)
                // prevent overlapping the points - screws up click events
                .lower();

            // keep grid lines under polygon edges
            d3.selectAll('.vertical, .horizontal').lower();
        },
        drawPolygonSpaces: function() {
            // draw a polygon for each space
            d3.select('#canvas svg').selectAll('polygon')
                .data(this.spaces).enter()
                .append('polygon')
                .attr('points', (d, i) => {
                    var pointsString = "";
                    d.points.forEach((p) => {
                        pointsString += (p.x + ',' + p.y + ' ');
                    });
                    return pointsString;
                })
                .attr("stroke-width", "1");

            //remove expired points and guidelines
            d3.selectAll("#canvas path").remove();
            d3.selectAll('#canvas ellipse').remove();
        },
        drawRectSpaces: function(e) {
            d3.select('#canvas svg').selectAll('rect')
                .data(this.rectSpaces).enter()
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

            svg.selectAll('.vertical')
                .data(d3.range(1, this.$refs.grid.clientWidth / this.gridResolution))
                .enter().append('line')
                .attr('class', 'vertical')
                .attr('x1', (d) => { return this.scaleX(d * this.gridResolution); })
                .attr('y1', 0)
                .attr('x2', (d) => { return this.scaleX(d * this.gridResolution); })
                .attr('y2', this.scaleY(this.$refs.grid.clientHeight));

            svg.selectAll('.horizontal')
                .data(d3.range(1, this.$refs.grid.clientHeight / this.gridResolution))
                .enter().append('line')
                .attr('class', 'horizontal')
                .attr('x1', 0)
                .attr('y1', (d) => { return this.scaleY(d * this.gridResolution); })
                .attr('x2', this.scaleX(this.$refs.grid.clientWidth))
                .attr('y2', (d) => { return this.scaleY(d * this.gridResolution); });
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
