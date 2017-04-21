<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<div id="grid"  :style="{ 'pointer-events': (currentMode === 'images' || currentTool === 'Map') ? 'none': 'all' }">
    <img v-for="(image, index) in images" :ref="'image-' + index" :src="image.src" :image-id="image.id" :style="imagesStyles(image)">
    <svg ref="grid" @click="addPoint" @mousemove="highlightSnapTarget" :viewBox="viewbox" preserveAspectRatio="none" id="svg-grid"></svg>
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
        this.max_y = (this.$refs.grid.clientHeight/this.$refs.grid.clientWidth) * this.max_x;

        this.calcScales();
        this.drawGridLines();
        this.drawPolygons();

        this.originalScales = {
            x: this.scaleX,
            y: this.scaleY
        };

        this.$refs.grid.addEventListener('mousedown', this.panStart);
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

            // the spacing in RWU between gridlines - one square in the grid will be x_spacing x y_spacing
            x_spacing: state => state.project.grid.x_spacing,
            y_spacing: state => state.project.grid.y_spacing,

            // scale functions translate the pixel coordinates of a location on the screen into RWU coordinates to use within the SVG's grid system
            scaleX: state => state.application.scale.x,
            scaleY: state => state.application.scale.y,

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

            images: state => state.application.currentSelections.story.images
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

        x_spacing () {
            this.calcScales();
            this.drawGridLines();
        },
        y_spacing () {
            this.calcScales();
            this.drawGridLines();
        },
        viewbox () {
            this.calcScales();
            this.drawGridLines();
            this.drawPoints();
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
        },

        images () {
            var grid = document.querySelector('#grid');
            this.$nextTick(() => {
                var images = document.querySelectorAll('#grid img');
                for (var i = 0; i < images.length; i++) {
                    const imageEl = images[i],
                        image = this.images.find(i => i.id === imageEl.getAttribute('image-id'));
                    if (!imageEl.hasDragListener) {
                        imageEl.hasDragListener = true;
                        var startPosition;
                        imageEl.addEventListener("dragstart", (e) => {
                            setTimeout(() => { imageEl.style.visibility = "hidden"; });
                            startPosition = {
                                x: image.x - this.scaleX(e.clientX - imageEl.getBoundingClientRect().left),
                                y: image.y - this.scaleY(e.clientY - imageEl.getBoundingClientRect().top)
                            };
                            return false;
                        }, false);

                        imageEl.addEventListener("dragend", (e) => {
                            var endPosition = this.getEventRWU(e);
                            imageEl.style.visibility = "visible";
                            this.$store.dispatch('models/updateImageWithData', {
                                image: image,
                                x: startPosition.x + endPosition.x,
                                y: startPosition.y + endPosition.y
                            });
                            return false;
                        }, false);
                    }
                }
            });
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
