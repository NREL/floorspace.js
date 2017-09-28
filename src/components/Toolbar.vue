<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <nav id="toolbar">

    <section id="top">
      <div id="navigation-head">
        <template v-if="showImportExport">
          <input ref="importLibrary" @change="importDataAsFile($event, 'library')" type="file" />
          <input ref="importInput" @change="importDataAsFile($event, 'floorplan')" type="file" />

          <open-floorplan-svg @click.native="$refs.importInput.click()" id="import" class="button"></open-floorplan-svg>
          <save-floorplan-svg @click.native="exportData" id="export" class="button"></save-floorplan-svg>
          <import-library-svg @click.native="$refs.importLibrary.click()" class="button"></import-library-svg>
        </template>

        <div id="undo-redo">
          <undo-svg @click.native="undo" class="button" :class="{ 'disabled' : !timetravelInitialized }"></undo-svg>
          <redo-svg @click.native="redo" class="button" :disabled="!timetravelInitialized" :class="{ 'disabled' : !timetravelInitialized }"></redo-svg>
        </div>
      </div>

      <div id="mode-tabs">
        <div @click="mode='floorplan'" class="tab" :class="{ active: mode === 'floorplan' }">
          <span>Floorplan</span>
          <tab-floorplan-svg class="icon"></tab-floorplan-svg>
        </div>

        <div @click="mode='shading'" class="tab" :class="{ active: mode === 'shading' }">
          <span>Shading</span>
          <tab-shading-svg class="icon"></tab-shading-svg>
        </div>

        <div @click="mode='images'" class="tab" :class="{ active: mode === 'images' }">
          <span>Images</span>
          <tab-floorplan-svg  class="icon"></tab-floorplan-svg>
        </div>

        <div @click="mode='components'" class="tab" :class="{ active: mode === 'components' }">
          <span>Components</span>
          <tab-components-svg  class="icon"></tab-components-svg>
        </div>

        <div @click="mode='assign'" class="tab" :class="{ active: mode === 'assign' }">
          <span>Assign</span>
          <tab-assign-svg  class="icon"></tab-assign-svg>
        </div>
      </div>

      <div id="grid-settings">
        <div class="input-checkbox">
          <label>Story Below</label>
          <input type="checkbox" v-model="previousStoryVisible">
        </div>

        <div v-if="mapEnabled" class="input-checkbox">
          <label>map</label>
          <input type="checkbox" v-model="mapVisible">
        </div>

        <div class="input-checkbox">
          <label>grid</label>
          <input type="checkbox" v-model="gridVisible">
        </div>

        <div class="input-number">
          <label>spacing</label>
          <input v-model.number.lazy="spacing">
        </div>

        <div class="input-select">
          <select ref="unitSelect" @change="updateUnits">
            <option value="ft">ft</option>
            <option value="m">m</option>
          </select>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 15 15'>
              <path d='M.5 0v14l11-7-11-7z' transform='translate(13) rotate(90)'></path>
          </svg>
        </div>

        <div class="input-number">
          <label>north axis</label>
          <input v-model.number.lazy="northAxis" :disabled="mapEnabled">
        </div>
      </div>
    </section>

    <section id="bottom">
      <template  v-if="mode ==='floorplan' || mode === 'shading'">
        <div id="instructions">Draw a floorplan and import images</div>

        <div id="drawing-tools" class="tools-list">
          <div @click="tool = 'Rectangle'" :class="{ active: tool === 'Rectangle' }">
            <tool-draw-rectangle-svg class="button"></tool-draw-rectangle-svg>
          </div>
          <div @click="tool = 'Polygon'" :class="{ active: tool === 'Polygon' }">
            <tool-draw-polygon-svg class="button"></tool-draw-polygon-svg>
          </div>
          <div @click="tool = 'Eraser'" :class="{ active: tool === 'Eraser' }">
            <tool-erase-svg class="button"></tool-erase-svg>
          </div>
          <div @click="tool = 'Select'" :class="{ active: tool === 'Select' }">
            <tool-move-size-svg class="button"></tool-move-size-svg>
          </div>
          <div @click="tool = ''" :class="{ active: tool === '' }">
            <tool-color-svg class="button"></tool-color-svg>
          </div>
        </div>

        <div v-if="mode=='floorplan'" class='input-select'>
            <label>View By</label>
            <select v-model='currentMode'>
                <option v-for="mode in ['building_units', 'thermal_zones', 'space_types']" :value="mode">{{ displayNameForMode(mode) }}</option>
            </select>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 15 15'>
                <path d='M.5 0v14l11-7-11-7z' transform='translate(13) rotate(90)'></path>
            </svg>
        </div>
      </template>

      <div id="components-mode-menu"  class="mode-menu" v-if="mode==='components'">

        <span v-for="type in ['window_definitions', 'daylighting_control_definitions']"  @click="visibleComponentType = visibleComponentType === type ? null : type " :class="{ active: currentComponentType === type }">
          {{ type }}
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 15 15'>
              <path d='M.5 0v14l11-7-11-7z' transform='translate(13) rotate(90)'></path>
          </svg>
        </span>

        <assign-component-menu v-show="visibleComponentType" :type="visibleComponentType"></assign-component-menu>
      </div>

      <template v-if="mode==='assign'">
        <div class='input-select'>
            <label>View By</label>
            <select v-model='currentMode'>
                <option v-for="mode in ['building_units', 'thermal_zones', 'space_types']" :value="mode">{{ displayNameForMode(mode) }}</option>
            </select>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 15 15'>
                <path d='M.5 0v14l11-7-11-7z' transform='translate(13) rotate(90)'></path>
            </svg>
        </div>
      </template>





      <!-- <div id="snapping-options">
        <button @click="snapMode = 'grid-strict'" :class="{ active: snapMode === 'grid-strict' }">Strict Grid</button>
        <button @click="snapMode = 'grid-verts-edges'" :class="{ active: snapMode === 'grid-verts-edges' }">Edges too</button>
      </div> -->

      <div id="grid-tools">
        <zoom-in-svg class="button"></zoom-in-svg>
        <zoom-out-svg class="button"></zoom-out-svg>
        <pan-svg @click="tool = 'Pan'" :class="{ active: tool === 'Pan' }" class="button"></pan-svg>
      </div>

    </section>

    <section class="modals" v-if="showSaveModal">
      <save-as-modal
        :saveWhat="thingWereSaving"
        :dataToDownload="dataToDownload"
        :onClose="() => {showSaveModal = false; thingWereSaving = '';}"
      />
    </section>
  </nav>
</template>

<script>
import { mapState } from 'vuex';
import SaveAsModal from './Modals/SaveAsModal.vue';
import AssignComponentMenu from './AssignComponentMenu.vue';
import applicationHelpers from './../store/modules/application/helpers';

// svgs
import openFloorplanSvg from './../assets/svg-icons/open_floorplan.svg'
import saveFloorplanSvg from './../assets/svg-icons/save_floorplan.svg'
import importLibrarySvg from './../assets/svg-icons/import_library.svg'

import undoSvg from './../assets/svg-icons/undo.svg'
import redoSvg from './../assets/svg-icons/redo.svg'

import floorplanTabSvg from './../assets/svg-icons/tab_floorplan.svg'
import shadingTabSvg from './../assets/svg-icons/tab_shading.svg'
import assignTabSvg from './../assets/svg-icons/tab_assign.svg'
import componentsTabSvg from './../assets/svg-icons/tab_components.svg'

import toolDrawRectangleSvg from './../assets/svg-icons/tool_draw_rectangle.svg'
import toolDrawPolygonSvg from './../assets/svg-icons/tool_draw_polygon.svg'
import toolEraseSvg from './../assets/svg-icons/tool_erase.svg'
import toolMoveSizeSvg from './../assets/svg-icons/tool_move_size.svg'
import toolColorSvg from './../assets/svg-icons/tool_color.svg'

import zoomInSvg from './../assets/svg-icons/zoom_in.svg'
import zoomOutSvg from './../assets/svg-icons/zoom_out.svg'
import panSvg from './../assets/svg-icons/pan.svg'

export default {
  name: 'toolbar',
  data() {
    return {
      mode: 'floorplan',
      componentTypes: {
        daylighting_control_definitions: 'Daylighting Control Definitions',
        window_definitions: 'Window Definitions',
      },
      showSaveModal: false,
      thingWereSaving: '',
      visibleComponentType: null
    };
  },
  methods: {
    exportData() {
      this.thingWereSaving = 'Floorplan';
      this.showSaveModal = true;
      return this.$store.getters['exportData'];
    },
    importDataAsFile(event, type) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        let data;
        try {
          data = JSON.parse(reader.result);
        } catch (e) {
          window.eventBus.$emit('error', 'Invalid JSON');
          return;
        }
        if (type === 'library') {
          this.$store.dispatch('importLibrary', { data });
        } else if (type === 'floorplan') {
          this.$store.dispatch('importFloorplan', {
            clientWidth: document.getElementById('svg-grid').clientWidth,
            clientHeight: document.getElementById('svg-grid').clientHeight,
            data,
          });
        }
      }, false);

      if (file) { reader.readAsText(file); }
    },
    undo() { this.$store.timetravel.undo(); },
    redo() { this.$store.timetravel.redo(); },
    updateUnits() {
      if (this.allowSettingUnits) {
        this.rwUnits = this.$refs.unitSelect.value;
      } else {
        window.eventBus.$emit('error', 'Units must be set before any geometry is drawn.');
        this.$refs.unitSelect.value = this.rwUnits;
      }
    },
    displayNameForMode(mode) { return applicationHelpers.displayNameForMode(mode); },
  },
  computed: {
    latestCreatedCompId() {
      return _.chain(this.allComponents)
        .map('defs')
        .flatten()
        .map('id')
        .map(Number)
        .max()
        .value() + '';
    },
    allComponents() {
      return Object.keys(this.componentTypes).map(ct => ({
        defs: this.$store.state.models.library[ct],
        name: this.componentTypes[ct],
        type: ct,
      }));
    },
    currentComponentType() {
      return this.currentComponent.type;
    },
    currentComponentDefinition() {
      return this.currentComponent.definition;
    },
    ...mapState({
      currentMode: state => state.application.currentSelections.mode,
      mapEnabled: state => state.project.map.enabled,
      timetravelInitialized: state => state.timetravelInitialized,
      showImportExport: state => state.project.showImportExport,
      allowSettingUnits: state => state.geometry.length === 1 && state.geometry[0].vertices.length === 0,
    }),
    availableTools() {
      let tools = [];
      switch (this.mode) {
        case 'floorplan':
          tools = ['Rectangle', 'Polygon', 'Eraser', 'Select'];
          break;
        case 'shading':
          tools = ['Rectangle', 'Polygon', 'Eraser', 'Select'];
          break;
        case 'images':
          tools = ['Pan', 'Drag'];
          break;
        case 'components':
          tools = ['Place Component'];
          break;
        case 'assign':
          tools = [];
          break;
        default:
          break;
      }
      if (this.previousStoryVisible && (this.mode === 'floorplan' || this.currentMode === 'shading')) {
        tools.push('Fill');
      }
      return tools;
    },
    currentMode: {
      get() { return this.$store.state.application.currentSelections.mode; },
      set(mode) { this.$store.dispatch('application/setCurrentMode', { mode }); },
    },
    northAxis: {
      get() { return `${this.$store.state.project.config.north_axis}°`; },
      set(northAxis) { this.$store.dispatch('project/setNorthAxis', { north_axis: northAxis }); },
    },
    gridVisible: {
      get() { return this.$store.state.project.grid.visible; },
      set(visible) { this.$store.dispatch('project/setGridVisible', { visible }); },
    },
    mapVisible: {
      get() { return this.$store.state.project.map.visible; },
      set(visible) { this.$store.dispatch('project/setMapVisible', { visible }); },
    },
    previousStoryVisible: {
      get() { return this.$store.state.project.previous_story.visible; },
      set(visible) { this.$store.dispatch('project/setPreviousStoryVisible', { visible }); },
    },
    tool: {
      get() { return this.$store.state.application.currentSelections.tool; },
      set(tool) { this.$store.dispatch('application/setCurrentTool', { tool }); },
    },
    // spacing between gridlines, measured in RWU
    spacing: {
      get() { return this.$store.state.project.grid.spacing; },
      set(spacing) { this.$store.dispatch('project/setSpacing', { spacing }); },
    },

    currentComponent: {
      get() { return this.$store.getters['application/currentComponent']; },
      set(item) {
        if (!item || !item.definition || !item.definition.id) { return; }
        this.$store.dispatch('application/setCurrentComponentDefinitionId', { id: item.definition.id });
      },
    },
    rwUnits: {
      get() { return this.$store.state.project.config.units; },
      set(units) { this.$store.dispatch('project/setUnits', { units }); },
    },
    snapMode: {
      get() { return this.$store.state.application.currentSelections.snapMode; },
      set(snapMode) { this.$store.dispatch('application/setCurrentSnapMode', { snapMode }); },
    },
    dataToDownload() {
      return this.$store.getters['exportData'];
    },
  },
  watch: {
    tool(val) {
      if (this.availableTools.indexOf(val) === -1 && val !== 'Map') { this.tool = this.availableTools[0]; }
    },
    currentMode() { this.tool = this.availableTools[0]; },
    latestCreatedCompId() {
      this.$store.dispatch('application/setCurrentComponentDefinitionId', { id: this.latestCreatedCompId });
    },
  },
  components: {
    'save-as-modal': SaveAsModal,
    'assign-component-menu': AssignComponentMenu,
    'open-floorplan-svg': openFloorplanSvg,
    'save-floorplan-svg': saveFloorplanSvg,
    'import-library-svg': importLibrarySvg,
    'undo-svg': undoSvg,
    'redo-svg': redoSvg,
    'tab-floorplan-svg': floorplanTabSvg,
    'tab-shading-svg': shadingTabSvg,
    'tab-assign-svg': assignTabSvg,
    'tab-components-svg': componentsTabSvg,

    'tool-color-svg': toolColorSvg,
    'tool-draw-rectangle-svg': toolDrawRectangleSvg,
    'tool-draw-polygon-svg': toolDrawPolygonSvg,
    'tool-erase-svg': toolEraseSvg,
    'tool-move-size-svg': toolMoveSizeSvg,

    'zoom-in-svg': zoomInSvg,
    'zoom-out-svg': zoomOutSvg,
    'pan-svg': panSvg,
  },
};
</script>

<style lang="scss" scoped>
// @import "./../scss/config";

$gray-dark: #333333;
$black: #000000;
$gray-medium-light: #5b5b5b;

svg.icon, svg.button {
  margin-top: .5rem;
  vertical-align: middle;
  height: 2rem;
  width: 2rem;
}

#toolbar {
  background-color: $black;
  z-index: 3;

  #top {
    height: 2.5rem;
    display: flex;
    #navigation-head {
      #undo-redo {
        float: right;
      }
      input {
        display: none;
      }
    }

    #mode-tabs {
      cursor: pointer;
      display: flex;
        .tab {
          background-color: $gray-dark;
          margin-right: 1.5rem;
          padding: 0 0 0 1.5rem;
          position: relative;
          width: max-content;
          &.active {
            background-color: $gray-medium-light;
            &::after {
              color: $gray-medium-light;
            }
            &::before {
                background-color: $gray-medium-light;
            }
          }
        }
        .tab:after {
          background-color: $black;
          color: $gray-dark;
          border-left: 1.25rem solid;
          border-top: 1.25rem solid transparent;
          border-bottom: 1.25rem solid transparent;
          display: inline-block;
          content: '';
          position: absolute;
          right: -1.25rem;
        }
        .tab:before {
          background-color: $gray-dark;
          color: $black;
          border-left: 1.25rem solid;
          border-top: 1.25rem solid transparent;
          border-bottom: 1.25rem solid transparent;
          display: inline-block;
          content: '';
          position: absolute;
          left: 0;
        }



    }
    #grid-settings {
      display: flex;
      margin-left: auto;
      >* {
        margin-right: 1rem;
      }
    }
  }
  #bottom {
    background-color: $gray-medium-light;
    display: flex;
    height: 2rem;

    .tools-list {
      display: flex;
      margin-right: 3rem;
      .active {
        background-color: $gray-dark;
      }

    }
    #instructions {
      margin-right: auto;
      line-height: 2rem;
    }
    #components-menu {
      span.active {
        background-color: $gray-dark;
      }
    }
    #grid-tools {
      display: flex;
      float: right;
    }
  }
}
</style>
