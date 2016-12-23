<template>
<div id="canvas">
<h1>{{ msg }}</h1>
<svg></svg>
</div>
</template>

<script>
import d3 from 'd3'
export default {
name: 'canvas',
data () {
return {
msg: 'Welcome to GeoSketch'
}
},
mounted: function() {
var svg = d3.select('svg')
.append('rect')
.attr('x', '100')
.attr('y', '100')
.attr('height', '100')
.attr('width', '100')
}
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
