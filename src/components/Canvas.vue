<template>
    <svg id="canvas" @click="addSpace"></svg>
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
            currentRect: null
        }
    },
    mounted: function() {
        // set the svg selection
        this.svg = d3.select('svg');

        // TODO: implement JSON loads from external source
        this.spaces.push(new rectSpace(10, 20, 50, 30));
        this.spaces.push(new rectSpace(100, 200, 10, 30));
    },

    watch: {
        // whenever question changes, this function will run
        spaces: function () {
            this.drawSpaces();
        }
    },
    methods: {
        addSpace: function(e) {
            // if (this.currentRect) {
            //     // already in progress, draw the endpoint
            //     this.endpoint = {
            //         x:
            //     }
            // } else {
                var origin = this.svg.append('circle');
                origin.attr('cx', e.offsetX)
                    .attr('cy', e.offsetY)
                    .attr('r', 5);
                this.currentRect = {
                    origin: {
                        x: e.offsetX,
                        y: e.offsetY
                    }
                };
            //}


        },
        drawSpaces: function() {
            console.log('drawSpaces');
            this.svg.selectAll('rect')
                .data(this.spaces).enter()
                .append('rect')
                .attr('x', (d, i) => {
                    console.log('test');
                    return d.origin.x;
                })
                .attr('y', (d, i) => {
                    return d.origin.x;
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


function rectSpace(x=0, y=0, h=0, w=0) {
    return {
        origin: {
            x: x,
            y: y
        },
        size: {
            height: h,
            width: w
        }
    };
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
svg {
    height: 100%;
    width: 100%;
    background-color: white;
}
</style>
