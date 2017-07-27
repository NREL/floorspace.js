<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <div id="grid" :style="{ 'pointer-events': (currentTool === 'Drag' || currentTool === 'Map') ? 'none': 'auto' }">
    <svg ref="grid" preserveAspectRatio="none" id="svg-grid"></svg>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { throttle, debounce } from '../../utilities';
import methods from './methods';
import geometryHelpers from './../../store/modules/geometry/helpers';
import modelHelpers from './../../store/modules/models/helpers';
import applicationHelpers from './../../store/modules/application/helpers';
import { ResizeEvents } from '../../components/Resize';

const d3 = require('d3');

export default {
  name: 'grid',
  data() {
    return {
      points: [], // points for the face currently being drawn
      original_bounds: {
        min_x: null,
        min_y: null,
        max_x: null,
        max_y: null,
        pxWidth: null,
        pxHeight: null,
      },
      axis: {
        x: null,
        y: null,
      },
      axis_generator: {
        x: null,
        y: null,
      },
      transform: {
        x: 0,
        y: 0,
        k: 1, // relative (to window after resize) zoom
        kAbs: 1, // absolute zoom
      },
      handleMouseMove: null, // placeholder --> overwritten in mounted()
      forceGridHide: false,
    };
  },
  mounted() {
    // throttle/debounce event handlers
    this.handleMouseMove = throttle(this.highlightSnapTarget, 100);
    this.renderGrid = debounce(this.renderGrid, 5);

    // add event listeners
    this.$refs.grid.addEventListener('reloadGrid', this.renderGrid);
    this.$refs.grid.addEventListener('click', this.gridClicked);
    this.$refs.grid.addEventListener('mousemove', this.handleMouseMove);

    window.addEventListener('keyup', this.escapeAction);
    window.addEventListener('resize', this.renderGrid);

    ResizeEvents.$on('resize-resize', this.renderGrid);

    // render grid first time
    this.renderGrid();
  },
  beforeDestroy() {
    this.$refs.grid.removeEventListener('reloadGrid', this.renderGrid);
    this.$refs.grid.removeEventListener('click', this.gridClicked);
    this.$refs.grid.removeEventListener('mousemove', this.handleMouseMove);

    window.removeEventListener('keyup', this.escapeAction);
    window.removeEventListener('resize', this.renderGrid);

    ResizeEvents.$off('resize-resize', this.renderGrid);
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
      units: state => state.project.config.units,
      spacing: state => state.project.grid.spacing,
      // pixels to real world units, these are initialized in calcGrid based on the grid pixel dimensions and then never changed
      scaleX: state => state.application.scale.x,
      scaleY: state => state.application.scale.y,
    }),
    ...mapGetters({
      currentStoryGeometry: 'application/currentStoryGeometry',
    }),

    // grid dimensions in real world units
    min_x: {
      get() { return this.$store.state.project.view.min_x; },
      set(val) { this.$store.dispatch('project/setViewMinX', { min_x: val }); },
    },
    min_y: {
      get() { return this.$store.state.project.view.min_y; },
      set(val) { this.$store.dispatch('project/setViewMinY', { min_y: val }); },
    },
    max_x: {
      get() { return this.$store.state.project.view.max_x; },
      set(val) { this.$store.dispatch('project/setViewMaxX', { max_x: val }); },
    },
    max_y: {
      get() { return this.$store.state.project.view.max_y; },
      set(val) { this.$store.dispatch('project/setViewMaxY', { max_y: val }); },
    },
    // previous story
    previousStory() {
      const currentStoryNumber = this.$store.state.models.stories.findIndex(s => s.id === this.$store.state.application.currentSelections.story.id);
      if (currentStoryNumber === 0) { return null; }
      return this.$store.state.models.stories[currentStoryNumber - 1];
    },
    previousStoryGeometry() {
      if (!this.previousStory) { return null; }
      return this.$store.state.geometry.find(g => g.id === this.previousStory.geometry_id);
    },
    previousStoryPolygons() {
      if (this.previousStoryVisible && this.previousStoryGeometry) {
        return this.previousStoryGeometry.faces.map((face) => {
          // look up the model (space or shading) associated with the face
          const model = modelHelpers.modelForFace(this.$store.state.models, face.id);
          const polygon = {
            face_id: face.id,
            previous_story: true,
            color: model.color,
            points: face.edgeRefs.map((edgeRef) => {
              const edge = geometryHelpers.edgeForId(edgeRef.edge_id, this.previousStoryGeometry);
              // use the vertex associated with v1 unless the edge reference on the face is reversed
              const nextVertexId = edgeRef.reverse ? edge.v2 : edge.v1;
              return geometryHelpers.vertexForId(nextVertexId, this.previousStoryGeometry);
            }),
          };

          // if the model is a space, set the polygon's color based on the current mode
          if (model.type === 'space') {
            if (this.currentMode === 'thermal_zones') {
              const thermalZone = modelHelpers.libraryObjectWithId(this.$store.state.models, model.thermal_zone_id);
              polygon.color = thermalZone ? thermalZone.color : applicationHelpers.config.palette.neutral;
            } else if (this.currentMode === 'space_types') {
              const spaceType = modelHelpers.libraryObjectWithId(this.$store.state.models, model.space_type_id);
              polygon.color = spaceType ? spaceType.color : applicationHelpers.config.palette.neutral;
            } else if (this.currentMode === 'building_units') {
              const buildingUnit = modelHelpers.libraryObjectWithId(this.$store.state.models, model.building_unit_id);
              polygon.color = buildingUnit ? buildingUnit.color : applicationHelpers.config.palette.neutral;
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
      const currentStoryPolygons = this.currentStoryGeometry.faces.map((face) => {
        // look up the model (space or shading) associated with the face
        const model = modelHelpers.modelForFace(this.$store.state.models, face.id);
        const polygon = {
          face_id: face.id,
          name: model.name,
          color: model.color,
          points: face.edgeRefs.map((edgeRef) => {
            const edge = geometryHelpers.edgeForId(edgeRef.edge_id, this.currentStoryGeometry);
            // use the vertex associated with v1 unless the edge reference on the face is reversed
            const nextVertexId = edgeRef.reverse ? edge.v2 : edge.v1;
            return geometryHelpers.vertexForId(nextVertexId, this.currentStoryGeometry);
          }),
        };

        // if the model is a space, set the polygon's color based on the current mode
        if (model.type === 'space') {
          if (this.currentMode === 'thermal_zones') {
            const thermalZone = modelHelpers.libraryObjectWithId(this.$store.state.models, model.thermal_zone_id);
            polygon.color = thermalZone ? thermalZone.color : applicationHelpers.config.palette.neutral;
          } else if (this.currentMode === 'space_types') {
            const spaceType = modelHelpers.libraryObjectWithId(this.$store.state.models, model.space_type_id);
            polygon.color = spaceType ? spaceType.color : applicationHelpers.config.palette.neutral;
          } else if (this.currentMode === 'building_units') {
            const buildingUnit = modelHelpers.libraryObjectWithId(this.$store.state.models, model.building_unit_id);
            polygon.color = buildingUnit ? buildingUnit.color : applicationHelpers.config.palette.neutral;
          }
        }
        return polygon;
      });
      return this.previousStoryPolygons ? this.previousStoryPolygons.concat(currentStoryPolygons) : currentStoryPolygons;
    },
  },
  watch: {
    // TODO: method for when new view dimensions are imported or the px dimensions change
    gridVisible() { this.updateGrid(); },
    spacing() { this.updateGrid(); },
    forceGridHide() { this.updateGrid(); },

    currentMode() { this.drawPolygons(); },
    polygons() { this.drawPolygons(); },

    currentTool() {
      this.points = [];
      this.drawPolygons();
    },
    currentSpace() {
      this.points = [];
      this.drawPolygons();
    },
    currentShading() {
      this.points = [];
      this.drawPolygons();
    },
    points() {
      if (this.points.length === 0) {
        this.eraseGuidelines();
      }
      this.drawPoints();
    },
    transform(newTransform, lastTransform) {
      // hide grid if zoomed out enough
      this.forceGridHide = (newTransform.kAbs < 0.1);

      // hide polygon names if zoomed out enough
      if (newTransform.kAbs < 0.5) {
        d3.select('#svg-grid').selectAll('.polygon-text').style('display', 'none');
      } else {
        d3.select('#svg-grid').selectAll('.polgyon-text').style('display', 'initial');
      }

      // cancel current drawing action if actual zoom and not just accidental drag
      if (this.points.length && (newTransform.kAbs !== lastTransform.kAbs || Math.abs(lastTransform.y - newTransform.y) > 3 || Math.abs(lastTransform.x - newTransform.x) > 3)) {
        this.points = [];
      }
    },
  },
  methods,
};

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
