<template>
    <div id="canvas">
        <div id="zoom">
            <span>+</span>
            <span>-</span>
        </div>
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
            currentRect: null,
            points: []
        }
    },
    mounted: function() {
        // set the svg selection
        this.svg = d3.select('svg');
    },

    watch: {
        spaces: function () {
            this.drawSpaces();
        },
        points: function () {
            this.drawSpaces();
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
        // rendering
        drawSpaces: function() {
            this.drawPoints();
            this.drawPolygonSpaces();
           // this.drawRectSpaces();
        },
        drawPoints: function() {
            console.log('drawPoints', JSON.stringify(this.points));
            let points = this.svg.selectAll('circle');
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
                .attr('fill', 'black')
                .attr('stroke', 'black')

            // remove expired points
            points.data(this.points).exit().remove();

            // first point in a polygon
            let firstPoint = this.svg.select('circle')
                .on('click', () => {
                    this.spaces.push({
                        points: this.points
                    });
                    this.points = [];
                    console.log(d3.event);
                    console.log(JSON.stringify(this.points));
                    d3.event.stopPropagation();
                })
                .on('mouseenter', () => {
                    firstPoint.attr('fill', 'white');
                })
                .on('mouseleave', () => {
                    firstPoint.attr('fill', 'gray');
                });
        },
        drawPolygonSpaces: function() {
            this.svg.selectAll('polygon')
                .data(this.spaces).enter()
                .append('polygon')
                .attr('points', (d, i) => {
                    var pointsString = "";
                    d.points.forEach((p) => {
                        pointsString += (p.x + ',' + p.y + ' ');
                    });
                    return pointsString;
                });
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
