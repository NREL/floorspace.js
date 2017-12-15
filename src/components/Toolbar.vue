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
        <div v-if="showImportExport" class="import-export-buttons">
          <input ref="importLibrary" @change="importDataAsFile($event, 'library')" type="file" />
          <input ref="importInput" @change="importDataAsFile($event, 'floorplan')" type="file" />

          <div title="open floorplan">
            <open-floorplan-svg @click.native="$refs.importInput.click()" id="import" class="button"></open-floorplan-svg>
          </div>
          <div title="save floorplan">
            <save-floorplan-svg @click.native="exportData" id="export" class="button"></save-floorplan-svg>
          </div>
          <div title="import library">
            <import-library-svg @click.native="$refs.importLibrary.click()" class="button"></import-library-svg>
          </div>
        </div>

        <div id="undo-redo">
          <div title="undo">
            <undo-svg @click.native="undo" class="button" :class="{ 'disabled' : !timetravelInitialized }"></undo-svg>
          </div>
          <div title="redo">
            <redo-svg @click.native="redo" class="button" :disabled="!timetravelInitialized" :class="{ 'disabled' : !timetravelInitialized }"></redo-svg>
          </div>
        </div>
      </div>
      <ul id="mode-tabs">
        <li @click="modeTab='floorplan'" class="tab" data-modetab="floorplan" :class="{ active: modeTab === 'floorplan' }">
          <span>
            Floorplan
            <tab-floorplan-svg class="icon"></tab-floorplan-svg>
          </span>
        </li>

        <li @click="modeTab='assign'" class="tab" :class="{ active: modeTab === 'assign' }">
          <span>
            Assignments
            <tab-assign-svg  class="icon"></tab-assign-svg>
          </span>
        </li>

        <li @click="modeTab='components'" class="tab" data-modetab="components" :class="{ active: modeTab === 'components' }">
          <span>
            Components
            <tool-component-svg  class="icon"></tool-component-svg>
          </span>
        </li>

        <li>
          <span />
        </li>
      </ul>

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
          <label v-if="!allowSettingUnits">{{ rwUnits}}</label>
        </div>
        <PrettySelect
          v-if="allowSettingUnits"
          ref="unitsSelect"
          :options="['ft', 'm']"
          :value="rwUnits"
          @change="updateUnits"
        />

        <div @click="showGroundPropsModal = true" title="settings">
          <SettingsGear class="button" />
        </div>
      </div>
    </section>

    <section id="bottom" :class="modeTab">
      <template  v-if="modeTab ==='floorplan'">
        <div id="instructions">Draw a floorplan and import images</div>

        <div id="drawing-tools" class="tools-list tools">
          <div @click="tool = 'Rectangle'" data-tool="Rectangle" title="Rectangle" :class="{ active: tool === 'Rectangle' }">
            <tool-draw-rectangle-svg class="button"></tool-draw-rectangle-svg>
          </div>
          <div @click="tool = 'Polygon'" data-tool="Polygon" title="Polygon" :class="{ active: tool === 'Polygon' }">
            <tool-draw-polygon-svg class="button"></tool-draw-polygon-svg>
          </div>
          <div @click="tool = 'Fill'" data-tool="Fill" title="Fill" :class="{ active: tool === 'Fill' }">
            <tool-fill-svg class="button"></tool-fill-svg>
          </div>
          <div @click="tool = 'Eraser'" data-tool="Eraser" title="Eraser" :class="{ active: tool === 'Eraser' }">
            <tool-erase-svg class="button"></tool-erase-svg>
          </div>
          <!-- remove Select/Move tool -->
          <!-- <div @click="tool = 'Select'" data-tool="Select" title="Select" :class="{ active: tool === 'Select' }">
            <tool-move-size-svg class="button"></tool-move-size-svg>
          </div> -->
          <div @click="setImageTool" data-tool="Image" title="Image" :class="{ active: tool === 'Image' }">
            <tool-image-svg class="button"></tool-image-svg>
          </div>
        </div>

      </template>

      <template v-if="modeTab === 'components'">
        <div id="instructions">
          <span v-if="!currentComponentDefinition">Add fenestration, daylighting, and PV</span>
          <span v-else>Click to place a {{currentComponentDefinition.name}}</span>
        </div>
        <ComponentInstanceEditBar />
        <!-- No need to show tool options if there's only the one choice. -->
        <!-- <div id="drawing-tools" class="tools-list tools">
          <div @click="tool = 'Place Component'" data-tool="Place Component" title="Place Component" :class="{ active: tool === 'Place Component' }">
            <tool-component-svg class="button"></tool-component-svg>
          </div>
        </div> -->
      </template>

      <template v-if="modeTab==='assign'">
        <div id="instructions">Assign thermal zones, etc, to spaces</div>
        <!-- No need to show tool options if there's only the one choice. -->
        <!-- <div id="drawing-tools" class="tools-list tools">
          <div @click="tool = 'Apply Property'" data-tool="Apply Property" title="Apply Property" :class="{ active: tool === 'Apply Property' }">
            <tab-assign-svg class="button"></tab-assign-svg>
          </div>
        </div> -->
      </template>

      <div id="grid-tools">
        <RenderByDropdown />
        <div title="zoom to fit">
          <ZoomToFitSvg class="button" @click.native="zoomToFit"></ZoomToFitSvg>
        </div>
      </div>


      <!-- <div id="snapping-options">
        <button @click="snapMode = 'grid-strict'" :class="{ active: snapMode === 'grid-strict' }">Strict Grid</button>
        <button @click="snapMode = 'grid-verts-edges'" :class="{ active: snapMode === 'grid-verts-edges' }">Edges too</button>
      </div> -->


    </section>

    <section class="modals">
      <SaveAsModal
        v-if="showSaveModal"
        :saveWhat="thingWereSaving"
        :dataToDownload="dataToDownload"
        @close="() => {showSaveModal = false; thingWereSaving = '';}"
      />
      <Settings
        v-else-if="showGroundPropsModal"
        @close="showGroundPropsModal = false"
      />
    </section>
  </nav>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import SaveAsModal from './Modals/SaveAsModal.vue';
import Settings from './Modals/Settings.vue';
import PrettySelect from './PrettySelect.vue';
import applicationHelpers from './../store/modules/application/helpers';
import svgs from './svgs';
import RenderByDropdown from './RenderByDropdown.vue';
import ComponentInstanceEditBar from './ComponentInstanceEditBar.vue';
import appconfig, { componentTypes } from '../store/modules/application/appconfig';


// svgs

export default {
  name: 'toolbar',
  data() {
    return {
      componentTypes: {
        daylighting_control_definitions: 'Daylighting Control Definitions',
        window_definitions: 'Window Definitions',
      },
      showSaveModal: false,
      thingWereSaving: '',
      visibleComponentType: null,
      showGroundPropsModal: false,
    };
  },
  methods: {
    setImageTool() {
      this.tool = 'Image';
      if (this.currentStory.images.length === 0) {
        window.eventBus.$emit('uploadImage');
      }
    },
    zoomToFit() {
      window.eventBus.$emit('zoomToFit');
    },
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
    updateUnits(val) {
      if (this.allowSettingUnits) {
        this.rwUnits = val;
      } else {
        window.eventBus.$emit('error', 'Units must be set before any geometry is drawn.');
      }
      // not today, friend...
      // this.$store.dispatch('changeUnits', { newUnits: val });
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
      return componentTypes.map(ct => ({
        defs: this.$store.state.models.library[ct],
        name: appconfig.modes[ct],
        type: ct,
      }));
    },
    currentComponentType() {
      return this.currentComponent.type;
    },
    currentComponentDefinition() {
      return this.currentComponent.definition;
    },
    ...mapGetters({
      currentSpaceProperty: 'application/currentSpaceProperty',
      currentStory: 'application/currentStory',
    }),
    ...mapState({
      mapEnabled: state => state.project.map.enabled,
      timetravelInitialized: state => state.timetravelInitialized,
      showImportExport: state => state.project.show_import_export,
      allowSettingUnits: state => state.project.config.unitsEditable && state.geometry.length === 1 && state.geometry[0].vertices.length === 0,
    }),
    currentSubselectionType: {
      get() { return this.$store.state.application.currentSelections.subselectionType; },
      set(sst) { this.$store.dispatch('application/setCurrentSubselectionType', { subselectionType: sst }); },
    },
    availableTools() {
      let tools = [];
      switch (this.modeTab) {
        case 'floorplan':
          tools = ['Rectangle', 'Polygon', 'Eraser', 'Select', 'Image'];
          break;
        case 'shading':
          tools = ['Rectangle', 'Polygon', 'Eraser', 'Select'];
          break;
        case 'components':
          tools = ['Place Component'];
          break;
        case 'assign':
          tools = ['Apply Property'];
          break;
        default:
          break;
      }
      if (this.previousStoryVisible && (this.modeTab === 'floorplan' || this.currentMode === 'shading')) {
        tools.push('Fill');
      }
      return tools;
    },
    currentMode: {
      get() { return this.$store.state.application.currentSelections.mode; },
      set(mode) { this.$store.dispatch('application/setCurrentMode', { mode }); },
    },
    modeTab: {
      get() { return this.$store.state.application.currentSelections.modeTab; },
      set(mt) { this.$store.dispatch('application/setCurrentModeTab', { modeTab: mt }); },
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
    modeTab() {
      if (this.modeTab === 'assign' && this.currentSpaceProperty) {
        this.currentMode = this.currentSpaceProperty.type;
      } else {
        this.currentMode = 'spaces';
      }
    },
    tool(val) {
      if (this.availableTools.indexOf(val) === -1 && val !== 'Map') { this.tool = this.availableTools[0]; }
      if (this.tool === 'Image' && this.currentSubselectionType !== 'images') {
        this.currentSubselectionType = 'images';
      } else if (this.tool !== 'Image' && this.currentSubselectionType === 'images') {
        this.currentSubselectionType = 'spaces';
      }
    },
    availableTools() {
      if (!_.includes(this.availableTools, this.tool)) {
        this.tool = this.availableTools[0];
      }
    },
    currentSubselectionType(val) {
      if (val === 'images' && this.tool !== 'Image') {
        this.tool = 'Image';
      } else if (val !== 'images' && this.tool === 'Image') {
        this.tool = this.availableTools[0];
      }
    },
    latestCreatedCompId() {
      this.$store.dispatch('application/setCurrentComponentDefinitionId', { id: this.latestCreatedCompId });
    },
  },
  components: {
    PrettySelect,
    SaveAsModal,
    Settings,
    RenderByDropdown,
    ComponentInstanceEditBar,
    ...svgs,
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
  z-index: 4;

  #top {
    height: 2.5rem;
    display: flex;
    #navigation-head {
      .import-export-buttons {
        display: inline-block;
        > div {
          display: inline-block;
        }
      }
      #undo-redo {
        > div {
          display: inline-block;
        }
        float: right;
      }
      input {
        display: none;
      }
    }

    #grid-settings {
      display: flex;
      margin-left: auto;
      >div {
        margin-right: .5rem;
      }
    }
  }
  #bottom {
    user-select: none;
    .render-by {
      margin-left: auto;
      margin-top: auto;
      margin-bottom: auto;
    }
    background-color: $gray-medium-light;
    display: flex;
    height: 2.5rem;

    .components-list {
      margin-right: auto;
    }
    .tools-list {
      display: flex;
      margin-right: 3rem;
      margin-left: 0;
      .active {
        background-color: $gray-dark;
      }
      > div {
        padding-left: 5px;
        padding-right: 5px;
      }
    }

    #instructions {
      line-height: 2.5rem;
      margin-right: 0;
      margin-left: 10px;
      min-width: 19.5rem;
    }

    #grid-tools {
      margin-left: auto;
      display: flex;
      float: right;
      div {
        padding: 0 1rem;
      }
    }
  }
}


#mode-tabs {
  list-style: none;
  overflow: hidden;
  padding-left: 0;
  margin-top: 0;
  margin-bottom:0;
  display: flex;
  font-size: 13px;

  li {
    cursor: pointer;
    float: left;
    margin-top: 0;
    background: $gray-dark;
    span {
      color: white;
      text-decoration: none;
      padding: 10px 0 10px 45px;
      position: relative;
      display: inline-block;
      float: left;
      white-space: nowrap;

      svg {
        display: inline-block;
        vertical-align: middle;
        margin-bottom: -10px;
        margin-top: 0px;
      }

    }

    span::after {
      content: " ";
      display: inline-block;
      width: 0;
      height: 0;
      border-top: 30px solid transparent; /* Go big on the size, and let overflow hide */
      border-bottom: 30px solid transparent;
      border-left: 30px solid $gray-dark;
      position: absolute;
      top: 50%;
      margin-top: -30px;
      left: 100%;
      z-index: 2;
    }
    span::before {
      content: " ";
      display: inline-block;
      width: 0;
      height: 0;
      border-top: 30px solid transparent;
      border-bottom: 30px solid transparent;
      border-left: 30px solid white;
      position: absolute;
      top: 50%;
      margin-top: -30px;
      margin-left: 1px;
      left: 100%;
      z-index: 1;
    }
    &.active {
      background: $gray-medium-light;
      span:after {
        border-left: 30px solid $gray-medium-light;
      }
    }
    &:first-child span {
      padding-left: 10px;
    }
    &:last-child {
      height: 1.2em;
      background: black !important;
      pointer-events: none !important;
      cursor: default !important;
    }
    &:last-child span::after {
      border: 0;
    }
    span:hover {
      background: $gray-medium-light;
    }
    span:hover:after {
      border-left-color: $gray-medium-light !important;
    }
  }
}



</style>
