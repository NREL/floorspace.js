<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<div id="grid" :style="{ 'pointer-events': (currentTool === 'Drag' || currentTool === 'Map') ? 'none': 'all' }">
    <svg ref="grid" @click="addPoint" @mousemove="(currentTool === 'Rectangle' || currentTool === 'Polygon') ? highlightSnapTarget($event) : null" preserveAspectRatio="none" id="svg-grid"></svg>
</div>
</template>

<script>
import methods from './methods'
import { mapState } from 'vuex'
import geometryHelpers from './../../store/modules/geometry/helpers.js'
import modelHelpers from './../../store/modules/models/helpers.js'
import applicationHelpers from './../../store/modules/application/helpers.js'
export default {
    name: 'grid',
    data () {
        return {
            originalScales: {},
            points: [], // points for the face currently being drawn
            isDragging: false // boolean - if a drag event is happening
        };
    },
    mounted () {
        this.max_y = (this.$refs.grid.clientHeight / this.$refs.grid.clientWidth) * this.max_x;

        // set viewbox on svg in rwu so drawing coordinates are in rwu and not pixels
        this.$refs.grid.setAttribute('viewBox', `0 0 ${this.max_x - this.min_x} ${this.max_y - this.min_y}`);

        this.calcGrid();


        this.drawGridLines();
        this.drawPolygons();
        // this.$refs.grid.addEventListener('mousedown', this.panStart);

        // recalculate scales when the window resizes
        window.addEventListener('resize', this.calcScales);
    },
    beforeDestroy () {
        window.removeEventListener('resize', this.calcScales);
    },
    computed: {
        ...mapState({

            currentMode: state => state.application.currentSelections.mode,
            currentTool: state => state.application.currentSelections.tool,

            currentSpace: state => state.application.currentSelections.space,
            currentShading: state => state.application.currentSelections.shading,
            currentStory: state => state.application.currentSelections.story,

            gridVisible: state => state.project.grid.visible,

            spacing: state => state.project.grid.spacing,

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
            zoom: state => state.project.map.zoom
        }),
        scaleX: {
            get () { return this.$store.state.application.scale.x; },
            set (val) {
                console.log("update scaleX with domain:", val.domain()[0], val.domain()[1]);
                this.$store.dispatch('application/setScaleX', { scaleX: val }); }
        },
        scaleY: {
            get () { return this.$store.state.application.scale.y; },
            set (val) {
                console.log("update scaleY with domain:", val.domain()[0], val.domain()[1]);
                this.$store.dispatch('application/setScaleY', { scaleY: val }); }
        },

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

        /*
        * map all faces for the current story to polygon representations (sets of ordered points) for d3 to render
        */
        polygons () {
            return this.currentStoryGeometry.faces.map((face) => {
                const faceModel = modelHelpers.modelForFace(this.$store.state.models, face.id);
                if (!faceModel) {debugger}
                var color = faceModel.color, object;
                if (faceModel.type === 'space' && this.currentMode === 'thermal_zones') {
                    object = modelHelpers.libraryObjectWithId(this.$store.state.models, faceModel.thermal_zone_id)
                    color = object ? object.color : applicationHelpers.config.palette.neutral;
                } else if (faceModel.type === 'space' && this.currentMode === 'space_types') {
                    object = modelHelpers.libraryObjectWithId(this.$store.state.models, faceModel.space_type_id)
                    color = object ? object.color : applicationHelpers.config.palette.neutral;
                } else if (faceModel.type === 'space' && this.currentMode === 'building_units') {
                    object = modelHelpers.libraryObjectWithId(this.$store.state.models, faceModel.building_unit_id)
                    color = object ? object.color : applicationHelpers.config.palette.neutral;
                } else {
                    color = faceModel.color;
                }

                return {
                    face_id: face.id,
                    // TODO: lookup the story/space/shading associated with the face
                    color: color,
                    points: face.edgeRefs.map((edgeRef) => {
                        const edge = geometryHelpers.edgeForId(edgeRef.edge_id, this.currentStoryGeometry),
                            // look up the vertex associated with v1 unless the edge reference on the face is reversed
                            nextVertexId = edgeRef.reverse ? edge.v2 : edge.v1;
                        return geometryHelpers.vertexForId(nextVertexId, this.currentStoryGeometry);
                    })
                };
            });
        },
    },
    watch: {
        gridVisible () { this.drawGridLines(); },

        spacing () {
            this.calcScales();
            this.drawGridLines();
        },
        viewbox () {
            // this.calcScales();
            // this.drawGridLines();
            // this.drawPoints();
        },

        currentTool () {
            this.points = [];
        },

        currentSpace() {
            this.points = [];
            this.drawPolygons();
        },
        currentShading() {
            this.points = [];
            this.drawPolygons();
        },
        currentMode () { this.drawPolygons(); },
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
#grid {

    img {
        position: absolute;
    }

    svg {
        background-size: cover;
        background-repeat: no-repeat;
        height: 100%;
        left:0;
        top: 0;
        position: absolute;
        width: 100%;
        z-index: 2;
    }
}
</style>
