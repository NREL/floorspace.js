<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<div id="canvas">
    <svg ref="grid" @click="addPoint" @mousemove="highlightSnapTarget" :viewBox="viewbox" preserveAspectRatio="none" id="svgcanvas"></svg>
</div>
</template>

<script>
import methods from './methods'
import { mapState } from 'vuex'
import helpers from './../../store/modules/geometry/helpers.js'
export default {
    name: 'canvas',
    data () {
        return {
            points: [], // points for the face currently being drawn
            isDragging: false // boolean - if a drag event is happening
        };
    },
    mounted () {
        this.calcScales();
        this.drawGridLines();
        this.setBackground();
        this.drawPolygons();

        // recalculate scales when the window resizes
        window.addEventListener('resize', this.calcScales);

        const mousedownHandler = (e) => {
                this.isDragging = false;
                this.$refs.grid.addEventListener('mouseup', mouseupHandler);
                this.$refs.grid.addEventListener('mousemove', mousemoveHandler);
            },
            mousemoveHandler = (e) => {
                if (this.isDragging) {
                    const dx = this.scaleX(e.movementX),
                        dy  = this.scaleY(e.movementY);
                        
                    this.min_x -= dx;
                    this.max_x -= dx;
                    this.min_y -= dy;
                    this.max_y -= dy;

                    this.drawGridLines();
                } else {
                    this.points = [];
                    this.isDragging = true;
                }
            },
            mouseupHandler = (e) => {
                this.$refs.grid.removeEventListener('mousemove', mousemoveHandler);
                this.$refs.grid.removeEventListener('mouseup', mouseupHandler);
                if (this.isDragging) {
                    this.points = [];

                    this.drawGridLines();
                    this.drawPolygons();
                    setTimeout(() => {
                        this.isDragging = false;
                    })
                }
            };
        this.$refs.grid.addEventListener('mousedown', mousedownHandler);
    },
    beforeDestroy () {
        window.removeEventListener('resize', this.calcScales);
    },
    computed: {
        ...mapState({
            currentMode: state => state.application.currentSelections.mode,

            currentSpace: state => state.application.currentSelections.space,
            currentShading: state => state.application.currentSelections.shading,
            currentStory: state => state.application.currentSelections.story,

            gridVisible: state => state.project.grid.visible,

            // the spacing in RWU between gridlines - one square in the grid will be x_spacing x y_spacing
            x_spacing: state => state.project.grid.x_spacing,
            y_spacing: state => state.project.grid.y_spacing,

            // scale functions translate the pixel coordinates of a location on the screen into RWU coordinates to use within the SVG's grid system
            scaleX: state => state.application.scale.x,
            scaleY: state => state.application.scale.y,

            // mix_x, min_y, max_x, and max_y bound the portion of the canvas (in RWU) that is currently visible to the user and define the viewbox
            // min_x: state => state.project.view.min_x,
            // min_y: state => state.project.view.min_y,
            // max_x: state => state.project.view.max_x,
            // max_y: state => state.project.view.max_y,

            // SVG viewbox is the portion of the svg grid (in RWU) that is currently visible to the user
            viewbox: state => {
                return state.project.view.min_x + ' ' + // x
                    state.project.view.min_y + ' ' + // y
                    (state.project.view.max_x - state.project.view.min_x) + ' ' + // width
                    (state.project.view.max_y - state.project.view.min_y); // height
            },

            mapVisible: state => state.project.map.visible,
            latitude: state => state.project.map.latitude,
            longitude: state => state.project.map.longitude,
            zoom: state => state.project.map.zoom,

            imageVisible: state => state.application.currentSelections.story.imageVisible,
            images: state => state.models.images
        }),
        // mix_x, min_y, max_x, and max_y are the grid dimensions in real world units
        min_x: {
            get () { return this.$store.state.project.view.min_x; },
            set (val) { this.$store.dispatch('project/setViewMinX', { min_x: val }); }
        },
        min_y: {
            get () { return this.$store.state.project.view.min_y; },
            set(val) { this.$store.dispatch('project/setViewMinY', { min_y: val }); }
        },
        max_x: {
            get () { return this.$store.state.project.view.max_x; },
            set (val) { this.$store.dispatch('project/setViewMaxX', { max_x: val }); }
        },
        max_y: {
            get () { return this.$store.state.project.view.max_y;  },
            set (val) { this.$store.dispatch('project/setViewMaxY', { max_y: val  }); }
        },

        currentStoryGeometry () { return this.$store.getters['application/currentStoryGeometry']; },
        mapUrl () {
            return "https://maps.googleapis.com/maps/api/staticmap?center=" +
                this.latitude + "," + this.longitude + "&zoom=" + this.zoom +
                "&size=600x300&key=AIzaSyBHevuNXeCuPXkiV3hq-pFKZSdSFLX6kF0"
        },
        backgroundSrc () {
            const image = this.images.find(image => image.id === this.currentStory.image_id);
            return image ? image.src : "";
        },
        /*
        * map all faces for the current story to polygon representations (sets of ordered points) for d3 to render
        */
        polygons () {
            return this.currentStoryGeometry.faces.map((face) => {
                return {
                    face_id: face.id,
                    points: face.edgeRefs.map((edgeRef) => {
                        const edge = helpers.edgeForId(edgeRef.edge_id, this.currentStoryGeometry),
                            // look up the vertex associated with v1 unless the edge reference on the face is reversed
                            nextVertexId = edgeRef.reverse ? edge.v2 : edge.v1;
                        return helpers.vertexForId(nextVertexId, this.currentStoryGeometry);
                    })
                };
            });
        },
    },
    watch: {
        gridVisible () { this.drawGridLines(); },

        mapVisible () { this.setBackground(); },
        imageVisible () { this.setBackground(); },
        mapUrl () { this.setBackground(); },
        backgroundSrc () { this.setBackground(); },

        x_spacing () { this.calcScales(); },
        y_spacing () { this.calcScales(); },
        viewbox () {
            this.calcScales();
            this.drawGridLines();
            this.drawPoints();
        },

        currentMode () { this.points = [];},

        currentSpace() {
            this.points = [];
            this.drawPolygons();
        },
        currentShading() {
            this.points = [];
            this.drawPolygons();
        },
        polygons () { this.drawPolygons(); },
        points () {
            this.drawPoints();
        }
    },
    methods: methods
}

</script>
<style lang="scss" scoped>
@import "./../../scss/config";
// styles for dynamically created d3 elements go into src/scss/partials/d3.scss
#canvas {
    background-color: $gray-darkest;
    svg {
        background-size: cover;
        background-repeat: no-repeat;
        height: 100%;
        width: 100%;
    }
}
</style>
