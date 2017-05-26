<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<div id="grid" :style="{ 'pointer-events': (currentTool === 'Drag' || currentTool === 'Map') ? 'none': 'all' }">
    <svg ref="grid" @mousedown="gridClicked" @mousemove="highlightSnapTarget" preserveAspectRatio="none" id="svg-grid"></svg>
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
    data() {
        return {
            original_bounds: {
                min_x: null,
                min_y: null,
                max_x: null,
                max_y: null,
                pxWidth: null,
                pxHeight: null
            },
            axis: {
                x: null,
                y: null,
            },
            axis_generator: {
                x: null,
                y: null
            },
            points: [] // points for the face currently being drawn
        };
    },
    mounted() {
        // initialize the y dimensions in RWU based on the aspect ratio of the grid on the screen
        this.max_y = (this.$refs.grid.clientHeight / this.$refs.grid.clientWidth) * this.max_x;

        this.original_bounds = {
            min_x: this.min_x,
            min_y: this.min_y,
            max_x: this.max_x,
            max_y: this.max_y,
            pxWidth: this.$refs.grid.clientWidth,
            pxHeight: this.$refs.grid.clientHeight
        };

        this.calcGrid();
        this.drawPolygons();

        this.$refs.grid.addEventListener('reloadGrid', this.reloadGrid);
        // recalculate the grid when the window resizes
        // const _this = this;
        // window.addEventListener('resize', () => {
        //     _this.max_y = _this.original_bounds.max_y * (_this.$refs.grid.clientHeight / _this.original_bounds.pxHeight);
        //     _this.max_x = _this.original_bounds.max_x * (_this.$refs.grid.clientWidth / _this.original_bounds.pxWidth);
        //
        //     _this.reloadGrid();
        // });

        // watch escape to cancel current drawing action
        window.addEventListener('keyup',this.escapeAction);
    },
    beforeDestroy () {
        this.$refs.grid.removeEventListener('reloadGrid', this.reloadGrid);
        // window.removeEventListener('resize', this.resize());
        window.removeEventListener('keyup', this.escapeAction);
    },
    computed: {
        ...mapState({
            currentMode: state => state.application.currentSelections.mode,
            currentTool: state => state.application.currentSelections.tool,

            currentSpace: state => state.application.currentSelections.space,
            currentShading: state => state.application.currentSelections.shading,
            currentStory: state => state.application.currentSelections.story,

            previousStoryVisible: state => state.project.previous_story.visible,

            gridVisible: state => state.project.grid.visible,

            spacing: state => state.project.grid.spacing,

            // pixels to real world units, these are initialized in calcGrid based on the grid pixel dimensions and then never changed
            scaleX: state => state.application.scale.x,
            scaleY: state => state.application.scale.y
        }),

        // grid dimensions in real world units
        min_x: {
            get() { return this.$store.state.project.view.min_x; },
            set(val) { this.$store.dispatch('project/setViewMinX', { min_x: val }); }
        },
        min_y: {
            get() { return this.$store.state.project.view.min_y; },
            set(val) { this.$store.dispatch('project/setViewMinY', { min_y: val }); }
        },
        max_x: {
            get() { return this.$store.state.project.view.max_x; },
            set(val) { this.$store.dispatch('project/setViewMaxX', { max_x: val }); }
        },
        max_y: {
            get() { return this.$store.state.project.view.max_y; },
            set(val) { this.$store.dispatch('project/setViewMaxY', { max_y: val }); }
        },

        currentStoryGeometry() {
            return this.$store.getters['application/currentStoryGeometry'];
        },

        previousStory () {
            const currentStoryNumber = this.$store.state.models.stories.findIndex(s => s.id === this.$store.state.application.currentSelections.story.id);
            if (currentStoryNumber > 0) {
                return this.$store.state.models.stories[currentStoryNumber - 1];
            }
        },
        previousStoryGeometry() {
            if (this.previousStory) {
                return this.$store.state.geometry.find(g => g.id === this.previousStory.geometry_id);
            }
        },
        previousStoryPolygons() {
            if (this.previousStoryVisible && this.previousStoryGeometry) {
                return this.previousStoryGeometry.faces.map((face) => {
                    // look up the model (space or shading) associated with the face
                    const model = modelHelpers.modelForFace(this.$store.state.models, face.id),
                        polygon = {
                            face_id: face.id,
                            color: model.color,
                            points: face.edgeRefs.map((edgeRef) => {
                                const edge = geometryHelpers.edgeForId(edgeRef.edge_id, this.previousStoryGeometry),
                                    // use the vertex associated with v1 unless the edge reference on the face is reversed
                                    nextVertexId = edgeRef.reverse ? edge.v2 : edge.v1;
                                return geometryHelpers.vertexForId(nextVertexId, this.previousStoryGeometry);
                            }),
                            previous_story: true
                        };

                    // if the model is a space, set the polygon's color based on the current mode
                    if (model.type === 'space') {
                        switch (this.currentMode) {
                            case 'thermal_zones':
                                const thermal_zone = modelHelpers.libraryObjectWithId(this.$store.state.models, model.thermal_zone_id)
                                polygon.color = thermal_zone ? thermal_zone.color : applicationHelpers.config.palette.neutral;
                                break;
                            case 'space_types':
                                const space_type = modelHelpers.libraryObjectWithId(this.$store.state.models, model.space_type_id)
                                polygon.color = space_type ? space_type.color : applicationHelpers.config.palette.neutral;
                                break;
                            case 'building_units':
                                const building_unit = modelHelpers.libraryObjectWithId(this.$store.state.models, model.building_unit_id)
                                polygon.color = building_unit ? building_unit.color : applicationHelpers.config.palette.neutral;
                                break;
                        }
                    }

                    return polygon;
                });
            }
            return [];
        },


        /*
         * map all faces for the current story to polygon representations (sets of ordered points) for d3 to render
         */
        polygons() {
            var polygons = this.currentStoryGeometry.faces.map((face) => {
                // look up the model (space or shading) associated with the face
                const model = modelHelpers.modelForFace(this.$store.state.models, face.id),
                    polygon = {
                        face_id: face.id,
                        name: model.name,
                        color: model.color,
                        points: face.edgeRefs.map((edgeRef) => {
                            const edge = geometryHelpers.edgeForId(edgeRef.edge_id, this.currentStoryGeometry),
                                // use the vertex associated with v1 unless the edge reference on the face is reversed
                                nextVertexId = edgeRef.reverse ? edge.v2 : edge.v1;
                            return geometryHelpers.vertexForId(nextVertexId, this.currentStoryGeometry);
                        })
                    };

                // if the model is a space, set the polygon's color based on the current mode
                if (model.type === 'space') {
                    switch (this.currentMode) {
                        case 'thermal_zones':
                            const thermal_zone = modelHelpers.libraryObjectWithId(this.$store.state.models, model.thermal_zone_id)
                            polygon.color = thermal_zone ? thermal_zone.color : applicationHelpers.config.palette.neutral;
                            break;
                        case 'space_types':
                            const space_type = modelHelpers.libraryObjectWithId(this.$store.state.models, model.space_type_id)
                            polygon.color = space_type ? space_type.color : applicationHelpers.config.palette.neutral;
                            break;
                        case 'building_units':
                            const building_unit = modelHelpers.libraryObjectWithId(this.$store.state.models, model.building_unit_id)
                            polygon.color = building_unit ? building_unit.color : applicationHelpers.config.palette.neutral;
                            break;
                    }
                }

                return polygon;
            });
            return this.previousStoryPolygons ? this.previousStoryPolygons.concat(polygons) : polygons;
        },
    },
    watch: {
        // TODO: method for when new view dimensions are imported or the px dimensions change

        gridVisible() {
            this.updateGrid();
        },
        spacing() {
            this.updateGrid();
        },

        currentTool() {
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
        currentMode() {
            this.drawPolygons();
        },
        polygons() {
            this.drawPolygons();
        },
        points() {
            this.drawPoints();
        }
    },
    methods: methods
}
</script>
<style lang="scss" scoped>@import "./../../scss/config";
// styles for dynamically created d3 elements go into src/scss/partials/d3.scss
#grid {
    button {
        position: absolute;
        z-index: 1000;
    }
    img {
        position: absolute;
    }

    svg {
        background-size: cover;
        background-repeat: no-repeat;
        height: 100%;
        left: 0;
        top: 0;
        position: absolute;
        width: 100%;
        z-index: 2;
    }
}
</style>
