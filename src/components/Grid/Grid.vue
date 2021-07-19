<!-- Floorspace.js, Copyright (c) 2016-2017, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <div
    id="grid"
    :style="{ 'pointer-events': (currentTool === 'Drag' || currentTool === 'Map') ? 'none': 'auto' }"
    ref="gridParent"
    :class="{ 'reduce-ticks': reduceTicks }"
  >
    <svg ref="grid" id="svg-grid">
      <g class="axis axis--x"></g>
      <g class="axis axis--y"></g>
      <g class="images" data-transform-plz></g>
      <g class="polygons" data-transform-plz></g>
      <g class="walls" data-transform-plz></g>
    </svg>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { debounce } from '../../utilities';
import d3AwareThrottle from '../../utilities/d3-aware-throttle';
import methods from './methods';
import geometryHelpers, { pointDistanceToSegment } from './../../store/modules/geometry/helpers';
import modelHelpers from './../../store/modules/models/helpers';
import applicationHelpers from './../../store/modules/application/helpers';
import { ResizeEvents } from '../../components/Resize';
import drawMethods from './drawing';
import { expandWindowAlongEdge, windowLocation } from './snapping';

const d3 = require('d3');

export default {
  name: 'grid',
  data() {
    const
      xScale = v => this.rwuToGrid(v, 'x'),
      yScale = v => this.rwuToGrid(v, 'y');

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
      reduceTicks: false,
      componentFacingSelection: null,
      transform: { k: 1, x: 0, y: 0 },
      transformAtLastRender: d3.zoomIdentity,
      lastMousePosition: null,
      handleMouseMove: null, // placeholder --> overwritten in mounted()
      ...drawMethods({
        xScale,
        yScale,
        selectImage: (img) => { this.currentImage = img; },
        updateImage: (data) => window.application.$store.dispatch('models/updateImageWithData', data),
      }),
      crosshatchModifiers: {
        '-highlight': 'green',
        '-selected': 'green',
        '-facing-selection': 'blue',
        '': '#222'
      },
    };
  },
  mounted() {
    // throttle/debounce event handlers
    this.handleMouseMove = d3AwareThrottle(this.highlightSnapTarget, 100);

    // render grid first time (not debounced, as this seems to fix an issue
    // where the x bounds are set correctly, and then becomes incorrect when the
    // debounced renderGrid runs)
    this.renderGrid();

    this.renderGrid = debounce(this.renderGrid, 5);

    // add event listeners
    this.$refs.grid.addEventListener('reloadGrid', this.reloadGridAndScales);

    window.addEventListener('keyup', this.escapeAction);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('resize', this.reloadGridAndScales);

    ResizeEvents.$on('resize', this.reloadGridAndScales);

    window.eventBus.$on('zoomToFit', this.zoomToFit);
    window.eventBus.$on('scaleTo', this.scaleTo);
  },
  beforeDestroy() {
    this.$refs.grid.removeEventListener('reloadGrid', this.reloadGridAndScales);

    window.removeEventListener('keyup', this.escapeAction);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('resize', this.reloadGridAndScales);

    ResizeEvents.$off('resize', this.reloadGridAndScales);

    window.eventBus.$off('zoomToFit', this.zoomToFit);
    window.eventBus.$off('scaleTo', this.scaleTo);
  },
  computed: {
    ...mapState({
      currentMode: state => state.application.currentSelections.mode,
      modeTab: state => state.application.currentSelections.modeTab,
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
      doorDefs: state => state.models.library.door_definitions,
      windowWidths: state => _.sumBy(state.models.library.window_definitions, 'width'),
      allVertices: state => _.flatMap(state.geometry, 'vertices'),
    }),
    ...mapGetters({
      currentStory: 'application/currentStory',
      currentStoryGeometry: 'application/currentStoryGeometry',
      denormalizedGeometry: 'application/currentStoryDenormalizedGeom',
      currentSpace: 'application/currentSpace',
      currentShading: 'application/currentShading',
      currentComponent: 'application/currentComponent',
      currentComponentInstance: 'application/currentComponentInstance',
      currentSpaceProperty: 'application/currentSpaceProperty',
    }),
    spacePropertyKey() {
      switch (this.currentSpaceProperty.type) {
        case 'building_units': return 'building_unit_id';
        case 'thermal_zones': return 'thermal_zone_id';
        case 'space_types': return 'space_type_id';
        case 'pitched_roofs': return 'pitched_roof_id';
        case 'construction_sets': return 'construction_set_id';
        default: throw new Error(`unrecognized space property type ${this.currentSpaceProperty.type}`);
      }
    },
    windowAndDoorDefs() {
      return [
        ...this.windowDefs,
        ...this.doorDefs.map(d => ({
          ...d,
          window_definition_mode: 'Single Window',
        })),
      ];
    },
    currentImage: {
      get() { return this.$store.getters['application/currentImage']; },
      set(item) { this.$store.dispatch('application/setCurrentSubSelectionId', { id: item.id }); },
    },
    currentComponentType() { return this.currentComponent.type; },
    currentComponentDefinition() { return this.currentComponent.definition; },
    currentSubSelection: {
      get() { return this.$store.getters['application/currentSubSelection']; },
      set(item) { this.$store.dispatch('application/setCurrentSubSelectionId', { id: item.id }); },
    },
    currentComponentInstanceId: {
      get() {
        return (
          this.$store.state.application.currentSelections.modeTab === 'components' &&
          this.$store.state.application.currentSelections.component_instance_id);
      },
      set(id) {
        this.$store.dispatch('application/setCurrentComponentInstanceId', { id });
      },
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

    // Handles all four dimensions at once
    // Intended to avoid spurious change detection if all of them are being changed
    dimensions: {
      get() { 
        return {
          min_x: this.$store.state.project.view.min_x,
          max_x: this.$store.state.project.view.max_x,
          min_y: this.$store.state.project.view.min_y,
          max_y: this.$store.state.project.view.max_y,
        };
      },
      set(val) {
        this.$store.dispatch('project/setDimensions', val);
      },
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
    images() {
      return this.currentStory.images
        .map(img => ({
          ...img,
          current: (
            // only allow interactions when the image tool is selected.
            // otherwise, it's possible to move the image when we want to be
            // panning the background.
            this.currentTool === 'Image' &&
            this.currentImage &&
            this.currentImage.id === img.id),
          clickable: (
            this.currentTool === 'Image' &&
            (!this.currentImage || this.currentImage.id !== img.id)
          ),
        }));
    },
    /*
    * map all faces for the current story to polygon representations (sets of ordered points) for d3 to render
    */
    polygons() {
      const currentStoryPolygons = this.polygonsFromGeometry(this.currentStoryGeometry);
      return this.previousStoryPolygons ? this.previousStoryPolygons.concat(currentStoryPolygons) : currentStoryPolygons;
    },
    walls() {
      const edgesLookup = _.keyBy(this.currentStoryGeometry.edges, 'id');
      const vertsLookup = _.keyBy(this.currentStoryGeometry.vertices, 'id');

      return _.chain(this.currentStoryGeometry.faces)
        // Make a list of edge ids, with one appearance for each usage of that edge.
        .flatMap(fc => _.map(fc.edgeRefs, 'edge_id'))
        // Sort to bring same edge ids together
        .sortBy(_.identity)
        // group to make an object like { "edge_a": ["edge_a"], "edge_b": ["edge_b", "edge_b"] }
        .groupBy(_.identity)
        // change that to { edge_a: 1, edge_b: 2 }
        .mapValues('length')
        // Look up vertex values, mark as interior if more than one usage of this edge.
        .map((numOccurences, edgeId) => {
          const edge = edgesLookup[edgeId];
          return {
            id: edgeId,
            start: vertsLookup[edge.v1],
            end: vertsLookup[edge.v2],
            interior: numOccurences > 1,
          };
        })
        .value();
    },
    daylightingControlLocs() {
      return _.flatten(
        this.currentStory.spaces.map((space) => {
          return space.daylighting_controls
            .map(dc => ({
              ...dc,
              ...geometryHelpers.vertexForId(dc.vertex_id, this.currentStoryGeometry),
              id: dc.id,
              type: 'daylighting_controls',
              face_id: space.face_id,
            }));
      }));
    },
    spaceFaces() {
      // as opposed to shading faces
      return this.denormalizedGeometry.faces
        .filter(f => _.find(this.currentStory.spaces, { face_id: f.id }));
    },
    spaceEdges() {
      return _.flatMap(this.spaceFaces, 'edges');
    },
    visibleVerts() {
      return this.allVertices.filter(d =>
        (this.min_x <= d.x && d.x <= this.max_x &&
         this.min_y <= d.y && d.y <= this.max_y),
      );
    },
  },
  watch: {
    // showTicks() { this.showOrHideAxes(); },
    // TODO: method for when new view dimensions are imported or the px dimensions change
    gridVisible() { this.showOrHideAxes(); },
    spacing() { this.updateGrid(); },
    units() { this.reloadGridAndScales(); },
    currentMode() { this.draw(); },
    polygons() { this.draw(); },
    images() { this.draw(); },
    windowDefs() { this.draw(); },
    doorDefs() { this.draw(); },
    currentTool() {
      this.points = [];
      this.draw();
      this.clearHighlights();
      if (this.currentTool === 'Image' && this.currentStory.images.length) {
        if (!this.currentImage ||
            !_.includes(_.map(this.currentStory.images, 'id'), this.currentImage.id)
           ) {
              this.currentImage = this.currentStory.images[0];
        }
      } else if (!_.includes(_.map(this.currentStory.spaces, 'id'), this.currentSubSelection.id)) {
        this.currentSubSelection = this.currentStory.spaces[0];
      }
    },
    currentSpace() {
      this.points = [];
      this.draw();
    },
    currentShading() {
      this.points = [];
      this.draw();
    },
    transform(newTransform, lastTransform) {
      // hide polygon names if zoomed out enough
      if (newTransform.k < 0.5) {
        d3.select('#svg-grid').selectAll('.polygon-text').style('display', 'none');
      } else {
        d3.select('#svg-grid').selectAll('.polygon-text').style('display', 'initial');
      }
    },
  },
  methods: {
    ...methods,
    windowCenterLocs(cursor) {
      // for each window, this should be the projection
      // of cursor onto that edge.
      return this.currentStory.windows
        .map(w => ({ w, e: _.find(this.denormalizedGeometry.edges, { id: w.edge_id }) }))
        .map(({ w, e }) => {
          const wind = this.denormalizeWindowOrDoor(e, w);
          const { proj } = pointDistanceToSegment(cursor, wind);
          return {
            ...wind,
            id: w.id,
            type: 'windows',
            ...proj,
          };
        });
    },
    doorCenterLocs(cursor) {
      return this.currentStory.doors
        .map(w => ({ w, e: _.find(this.denormalizedGeometry.edges, { id: w.edge_id }) }))
        .map(({ w, e }) => {
          const wind = this.denormalizeWindowOrDoor(e, w);
          const { proj } = pointDistanceToSegment(cursor, wind);
          return {
            ...wind,
            id: w.id,
            type: 'doors',
            ...proj,
          };
        });
    },
    currentComponentTypeLocs(cursor) {
      if (this.currentComponentType === 'window_definitions') {
        return this.windowCenterLocs(cursor);
      } else if (this.currentComponentType === 'daylighting_control_definitions') {
        return this.daylightingControlLocs;
      } else if (this.currentComponentType === 'door_definitions') {
        return this.doorCenterLocs(cursor);
      } else {
        throw new Error(`unrecognized componentType: ${this.currentComponentType}`);
      }
    },
    denormalizeWindowOrDoor(edge, { edge_id, alpha, window_definition_id, door_definition_id }) {
      const
        defn = _.find(this.windowAndDoorDefs, { id: window_definition_id || door_definition_id }),
        center = windowLocation(edge, { alpha });
      return {
        ...expandWindowAlongEdge(edge, center, defn),
        window_definition_mode: defn.window_definition_mode,
        windowOrDoor: defn.window_definition_mode ? 'window' : 'door',
        width: defn.width,
        spacing: defn.window_spacing,
        texture: defn.texture,
      };
    },
    windowsOnFace(face) {
      return _.flatMap(
        face.edges,
        e => _.filter(this.currentStory.windows , { edge_id: e.id })
              .map(w => ({
                ...this.denormalizeWindowOrDoor(e, w),
                selected: w.id === this.currentComponentInstanceId,
                facingSelection: w.id === this.componentFacingSelection,
              })));
    },
    doorsOnFace(face) {
      return _.flatMap(
        face.edges,
        e => _.filter(this.currentStory.doors, { edge_id: e.id })
              .map(d => ({
                ...this.denormalizeWindowOrDoor(e, d),
                windowOrDoor: 'door',
                selected: d.id === this.currentComponentInstanceId,
                facingSelection: d.id === this.componentFacingSelection,
              })));
    },
    polygonsFromGeometry(geometry, extraPolygonAttrs = {}) {
      const
        geom = geometryHelpers.denormalize(geometry)
      const polygons = geom.faces.map((face) => {
        // look up the model (space or shading) associated with the face
        const
          model = modelHelpers.modelForFace(this.$store.state.models, face.id),
          // <polygon> are automatically closed, so no need to repeat start vertex
          points = face.vertices.slice(0, -1),
          polygon = {
            face_id: face.id,
            name: model.name,
            modelType: model.type,
            color: model.color,
            points,
            labelPosition: this.polygonLabelPosition(points),
            windows: this.windowsOnFace(face),
            doors: this.doorsOnFace(face),
            current: (
              (this.currentTool !== 'Apply Property' && this.currentSpace && face.id === this.currentSpace.face_id) ||
              (this.currentTool !== 'Apply Property' && this.currentShading && face.id === this.currentShading.face_id) ||
              (this.currentTool === 'Apply Property' && this.currentSpaceProperty && model[this.spacePropertyKey] === this.currentSpaceProperty.id)
            ),
            daylighting_controls: (model.daylighting_controls || [])
              .map(dc => ({
                ...geometryHelpers.vertexForId(dc.vertex_id, geometry),
                selected: dc.id === this.currentComponentInstanceId,
                facingSelection:  dc.id === this.componentFacingSelection,
              })),
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
          } else if (this.currentMode === 'pitched_roofs') {
            const pitchedRoof = modelHelpers.libraryObjectWithId(this.$store.state.models, model.pitched_roof_id);
            polygon.color = pitchedRoof ? pitchedRoof.color : applicationHelpers.config.palette.neutral;
          } else if (this.currentMode === 'construction_sets') {
            const constructionSet = modelHelpers.libraryObjectWithId(this.$store.state.models, model.construction_set_id);
            polygon.color = constructionSet ? constructionSet.color : applicationHelpers.config.palette.neutral;
          } else if (this.currentMode !== 'spaces') {
            throw new Error(`unknown assignable property: ${this.currentMode}`);
          }

        }
        return polygon;
      });

      return _.sortBy(_.compact(polygons), 'current');
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
