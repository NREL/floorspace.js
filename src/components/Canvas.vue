<template>
    <div id="canvas">

        <svg @click="addPoint"></svg>
    </div>
</template>

<script>
var d3 = require('d3');
export default {
    name: 'canvas',
    data() {
        return {
            // d3 svg selection
            svg: {},
            // array of spaces drawn
            spaces: [],
            // space being drawn
            points: []
        }
    },
    mounted: function() {
        // set the svg selection
        this.svg = d3.select('svg');
    },

    watch: {
        spaces: function () {
            this.drawPolygonSpaces();
        },
        points: function () {
            this.drawPoints();
        }
    },
    methods: {
        addPoint: function(e) {
            let point = {
                x: e.offsetX,
                y: e.offsetY
            };
            this.points.push(point);
        },

        drawPoints: function() {
            let points = this.svg.selectAll('circle');
            this.drawPolygonEdges();

            // draw new points
            points.data(this.points).enter()
                .append('circle')
                .attr('cx', (d, i) => {
                    return d.x;
                })
                .attr('cy', (d, i) => {
                    return d.y;
                })
                .attr('r', 5)
                .attr('fill', (d, i) => {
                    return i ? 'black' : 'gray';
                })
                .attr('stroke', 'black')

            // remove expired points
            points.data(this.points).exit().remove();

            // first point in a polygon
            let firstPoint = this.svg.select('circle')
                //close the shape
                .on('click', () => {
                    this.spaces.push({
                        points: this.points
                    });
                    // prevent a new point from being created when the shape is closed
                    d3.event.stopPropagation();
                    this.points = [];
                })
                .on('mouseenter', () => {
                    firstPoint.attr('fill', 'white');
                })
                .on('mouseleave', () => {
                    firstPoint.attr('fill', 'gray');
                });
        },
        drawPolygonEdges: function() {
            var line = d3.line()
                .x(function(d) {
                    return d.x;
                })
                .y(function(d) {
                    return d.y;
                });

            this.svg.append("path")
                .datum(this.points)
                .attr("fill", "none")
                .attr("stroke", 'red')
                .attr("stroke-width", "2")
                .attr("d", line);
        },
        drawPolygonSpaces: function() {
            // draw a polygon for each space
            this.svg.selectAll('polygon')
                .data(this.spaces).enter()
                .append('polygon')
                .attr('points', (d, i) => {
                    var pointsString = "";
                    d.points.forEach((p) => {
                        pointsString += (p.x + ',' + p.y + ' ');
                    });
                    return pointsString;
                })
                .attr('stroke', 'red')
                .attr("stroke-width", "2");

            //remove expired guidelines
            d3.selectAll("path").remove();
        },
        drawRectSpaces: function(e) {
            this.svg.selectAll('rect')
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
        }
    }
}




</script>
<style lang="scss" scoped>
@import "./../scss/config";
#canvas {
    background-color: $gray-darkest;
    svg {
        height: 100%;
        width: 100%;
    }
}
</style>
