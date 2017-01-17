<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<div id="canvas">
    <svg ref="grid" @click="addPoint" :viewBox="viewbox" preserveAspectRatio="none"></svg>
</div>
</template>

<script>
import methods from './methods'
import { mapState } from 'vuex'
export default {
    name: 'canvas',
    data () {
        return {
            points: [], // points for the polygon currently being drawn
            rectangleOrigin: null,

        };
    },
    // recalculate and draw the grid when the window resizes
    mounted () {
        this.drawGrid();
        window.addEventListener('resize', this.drawGrid);
    },
    beforeDestroy () {
        window.removeEventListener('resize', this.drawGrid)
    },
    computed: {
        ...mapState({
            gridVisible: state => state.project.grid.visible,

            currentMode: state => state.application.currentSelections.mode,

            currentSpace: state => state.application.currentSelections.space,

            // scale functions translate the pixel coordinates of a location on the screen into RWU coordinates to use within the SVG's grid system
            scaleX: state => state.application.scale.x,
            scaleY: state => state.application.scale.y,

            // the spacing in RWU between gridlines - one square in the grid will be x_spacing x y_spacing
            x_spacing: state => state.project.grid.x_spacing,
            y_spacing: state => state.project.grid.y_spacing,

            // mix_x, min_y, max_x, and max_y bound the portion of the canvas (in RWU) that is currently visible to the user
            min_x: state => state.project.view.min_x,
            min_y: state => state.project.view.min_y,
            max_x: state => state.project.view.max_x,
            max_y: state => state.project.view.max_y,

            // SVG viewbox is the portion of the svg grid (in RWU) that is currently visible to the user given the min_x, min_y, max_x, and max_y boundaries
            viewbox: state => {
                return state.project.view.min_x + ' ' + // x
                state.project.view.min_y + ' ' + // y
                (state.project.view.max_x - state.project.view.min_x) + ' ' + // width
                (state.project.view.max_y - state.project.view.min_y); // height
            }
        }),
        // map all faces for the current story to polygons
        polygons () {
            return this.$store.getters['application/currentStoryGeometry'].faces.map((face) => {
                // obtain a set of vertices for each face by taking the first vertex from each edge (direction matters here)
                return {
                    face_id: face.id,
                    points: face.edges.map((edgeRef) => {
                        // look up the edge referenced by the face
                        const edge = this.$store.getters['application/currentStoryGeometry'].edges.find((e) => {
                            return e.id === edgeRef.edge_id;
                        });
                        // look up the vertex associated with p1 unless the edge reference on the face is reversed
                        const vertexId = edgeRef.reverse ? edge.p2 : edge.p1;
                        return this.$store.getters['application/currentStoryGeometry'].vertices.find((v) => {
                            return v.id === vertexId;
                        })
                    })
                }
            });
        },
    },
    watch: {
        gridVisible () { this.drawGrid(); },
        // reset points if drawing mode changes
        currentMode () {
            this.rectangleOrigin = null;
            this.points = [];

        },
        // if the  dimensions or spacing of the grid is altered, redraw it
        viewbox () {
            this.drawGrid();
            this.drawPoints();
        },
        x_spacing () { this.drawGrid(); },
        y_spacing () { this.drawGrid(); },

        currentSpace() { this.drawPolygons(); },
        polygons () { this.drawPolygons(); },
        points () { this.drawPoints(); }
    },
    methods: methods
}

</script>
<style lang="scss" scoped>
@import "./../../scss/config";
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
