<template>
    <div id="canvas">
        <svg @click="addPoint"></svg>
    </div>
</template>

<script>
var d3 = require('d3');
export default {
    name: 'canvas',
    data: function() {
        return {
            // array of spaces drawn - going to be synced with navigation and displayed
            spaces: [],
            // space being drawn
            points: []
        };
    },
    watch: {
        // when a space is added, draw all spaces
        spaces: function() { this.drawPolygonSpaces(); },
        // when a point is added, draw all points
        points: function() { this.drawPoints(); }
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
            // draw new points
            d3.select('svg').selectAll('circle').data(this.points).enter()
                .append('circle')
                .attr('cx', (d, i) => {
                    return d.x;
                })
                .attr('cy', (d, i) => {
                    return d.y;
                })
                .attr('r', 2);

            //connect the points with a guideline
            this.drawPolygonEdges();

            // set a click listener for the first point in the polynomial, when it is clicked close the shape
            d3.select('svg').select('circle')
                .on('click', () => {
                    // create the shape - triggers this.drawPolygonSpaces()
                    this.spaces.push({ points: this.points });
                    // clear points, prevent a new point from being created by this click event
                    d3.event.stopPropagation();
                    this.points = [];
                })
                // styles for the first point in the polygon
                .classed('origin', true)
                .attr('r', 5);
        },
        drawPolygonEdges: function() {
            // remove expired paths
            d3.selectAll("path").remove();

            var line = d3.line()
                .x((d) => { return d.x; })
                .y((d) => { return d.y; });

            d3.select('svg').append("path")
                .datum(this.points)
                .attr("fill", "none")
                .attr("stroke-width", "1")
                .attr("d", line)
                // prevent overlapping the points - screws up click events
                .lower();
        },
        drawPolygonSpaces: function() {
            // draw a polygon for each space
            d3.select('svg').selectAll('polygon')
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
            d3.selectAll("path").remove();
            d3.selectAll('circle').remove();
        },
        drawRectSpaces: function(e) {
            d3.select('svg').selectAll('rect')
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
// we can't style the dynamically created d3 elements here, put those styles in the scss folder
#canvas {
    background-color: $gray-darkest;
    svg {
        height: 100%;
        width: 100%;
    }
}
</style>
