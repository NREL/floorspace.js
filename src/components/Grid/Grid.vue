<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <div id="grid" :style="{ 'pointer-events': (currentTool === 'Drag' || currentTool === 'Map') ? 'none': 'auto' }">
    <svg ref="grid" id="svg-grid">
      <defs>
        <marker v-for="id in ['perp-linecap', 'perp-linecap-highlight']" :id="id" markerWidth="1" markerHeight="10" orient="auto" markerUnits="strokeWidth" refY="4" refX="0.5">
          <rect x="0" y="1" width="1" height="6" shape-rendering="optimizeQuality"/>
        </marker>
      </defs>
    </svg>
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
import { drawWindow, drawDaylightingControl } from './drawing';
import { expandWindowAlongEdge, windowLocation } from './snapping';

const d3 = require('d3');

export default {
  name: 'grid',
  data() {
    return {
      points: [], // points for the face currently being drawn
      axis: {
        x: null,
        y: null,
      },
      axis_generator: {
        x: null,
        y: null,
      },
      handleMouseMove: null, // placeholder --> overwritten in mounted()
      drawWindow: drawWindow()
        .xScale(v => this.rwuToGrid(v, 'x'))
        .yScale(v => this.rwuToGrid(v, 'y')),
      drawDC: drawDaylightingControl()
        .xScale(v => this.rwuToGrid(v, 'x'))
        .yScale(v => this.rwuToGrid(v, 'y')),
    };
  },
  mounted() {
    window.theGrid = this;
    // throttle/debounce event handlers
    this.handleMouseMove = throttle(this.highlightSnapTarget, 100);

    // render grid first time (not debounced, as this seems to fix an issue
    // where the x bounds are set correctly, and then becomes incorrect when the
    // debounced renderGrid runs)
    this.renderGrid();

    this.renderGrid = debounce(this.renderGrid, 5);

    // add event listeners
    this.$refs.grid.addEventListener('reloadGrid', this.reloadGridAndScales);

    window.addEventListener('keyup', this.escapeAction);
    window.addEventListener('resize', this.reloadGridAndScales);

    ResizeEvents.$on('resize', this.reloadGridAndScales);
  },
  beforeDestroy() {
    this.$refs.grid.removeEventListener('reloadGrid', this.reloadGridAndScales);

    window.removeEventListener('keyup', this.escapeAction);
    window.removeEventListener('resize', this.reloadGridAndScales);

    ResizeEvents.$off('resize', this.reloadGridAndScales);
  },
  computed: {
    ...mapState({
      currentMode: state => state.application.currentSelections.mode,
      currentTool: state => state.application.currentSelections.tool,
      snapMode: state => state.application.currentSelections.snapMode,
      previousStoryVisible: state => state.project.previous_story.visible,
      gridVisible: state => state.project.grid.visible,
      units: state => state.project.config.units,
      spacing: state => state.project.grid.spacing,
      // pixels to real world units, these are initialized in calcGrid based on the grid pixel dimensions and then never changed
      scaleX: state => state.application.scale.x,
      scaleY: state => state.application.scale.y,
      windowDefs: state => state.models.library.window_definitions,
      windowWidths: state => _.sumBy(state.models.library.window_definitions, 'width'),
    }),
    ...mapGetters({
      currentStory: 'application/currentStory',
      currentStoryGeometry: 'application/currentStoryGeometry',
      denormalizedGeometry: 'application/currentStoryDenormalizedGeom',
      currentSpace: 'application/currentSpace',
      currentShading: 'application/currentShading',
      currentComponent: 'application/currentComponent',
    }),
    currentComponentType() { return this.currentComponent.type; },
    currentComponentDefinition() { return this.currentComponent.definition; },
    currentSubSelection: {
      get() { return this.$store.getters['application/currentSubSelection']; },
      set(item) { this.$store.dispatch('application/setCurrentSubSelectionId', { id: item.id }); },
    },
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
    transform: {
      get() { return this.$store.state.project.transform; },
      set(t) { this.$store.dispatch('project/setTransform', t); },
    },
    // previous story
    previousStory() {
      const currentStoryNumber = this.$store.state.models.stories.findIndex(s => s === this.currentStory);
      if (currentStoryNumber === 0) { return null; }
      return this.$store.state.models.stories[currentStoryNumber - 1];
    },
    previousStoryGeometry() {
      if (!this.previousStory) { return null; }
      return this.$store.state.geometry.find(g => g.id === this.previousStory.geometry_id);
    },
    previousStoryPolygons() {
      if (this.previousStoryVisible && this.previousStoryGeometry) {
        return this.polygonsFromGeometry(this.previousStoryGeometry, { previous_story: true });
      }
      return [];
    },

    /*
    * map all faces for the current story to polygon representations (sets of ordered points) for d3 to render
    */
    polygons() {
      const currentStoryPolygons = this.polygonsFromGeometry(this.currentStoryGeometry);
      return this.previousStoryPolygons ? this.previousStoryPolygons.concat(currentStoryPolygons) : currentStoryPolygons;
    },
  },
  watch: {
    // showTicks() { this.showOrHideAxes(); },
    // TODO: method for when new view dimensions are imported or the px dimensions change
    gridVisible() { this.showOrHideAxes(); },
    spacing() { this.updateGrid(); },

    currentMode() { this.drawPolygons(); },
    polygons() { this.drawPolygons(); },
    windowDefs: {
      handler() { console.log('windowDefs was updated'); this.drawPolygons(); },
      deep: true,
    },
    currentTool() {
      this.points = [];
      this.drawPolygons();
      this.clearHighlights();
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
      // hide polygon names if zoomed out enough
      if (newTransform.k < 0.5) {
        d3.select('#svg-grid').selectAll('.polygon-text').style('display', 'none');
      } else {
        d3.select('#svg-grid').selectAll('.polygon-text').style('display', 'initial');
      }

      // cancel current drawing action if actual zoom and not just accidental drag
      if (this.points.length && (newTransform.k !== lastTransform.k || Math.abs(lastTransform.y - newTransform.y) > 3 || Math.abs(lastTransform.x - newTransform.x) > 3)) {
        this.points = [];
      }
    },
  },
  methods: {
    ...methods,
    denormalizeWindow(edge, { edge_id, alpha, window_defn_id }) {
      const
        windowDefn = _.find(this.windowDefs, { id: window_defn_id }),
        center = windowLocation(edge, { alpha });
      return expandWindowAlongEdge(edge, center, windowDefn.width);
    },
    polygonsFromGeometry(geometry, extraPolygonAttrs = {}) {
      const
        geom = geometryHelpers.denormalize(geometry),
        windows = this.currentStory.geometry_id === geometry.id ?
          this.currentStory.windows : [];
      const polygons = geom.faces.map((face) => {
        // look up the model (space or shading) associated with the face
        const
          model = modelHelpers.modelForFace(this.$store.state.models, face.id),
          // <polygon> are automatically closed, so no need to repeat start vertex
          points = face.vertices.slice(0, -1),
          polygon = {
            face_id: face.id,
            name: model.name,
            color: model.color,
            points,
            labelPosition: this.polygonLabelPosition(points),
            windows: _.flatMap(
              face.edges,
              e => _.filter(windows, { edge_id: e.id })
                    .map(w => this.denormalizeWindow(e, w))),
            daylighting_controls: model.daylighting_controls
              .map(dc => geometryHelpers.vertexForId(dc.vertex_id, geometry)),
            ...extraPolygonAttrs,
          };
        if (!points.length) {
          return null; // don't render point-less polygons
        }

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

      return _.compact(polygons);
    }
  },
};

</script>
<style lang="scss" scoped>@import "./../../scss/config";
// styles for dynamically created d3 elements go into src/scss/partials/d3.scss
#grid {
  user-select: none;

  button {
    position: absolute;
    z-index: 200;
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
