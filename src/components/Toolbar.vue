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
        <span @click="mode='floorplan'" :class="{ active: mode === 'floorplan' }">
          Floorplan
          <svg class="icon" baseProfile="tiny" height="500" overflow="auto" viewBox="0 0 500 500" width="500" xmlns="http://www.w3.org/2000/svg"><path d="M359.688 31.938c-17.69-4.072-69.403 127.513-69.403 127.513s-8.165-2.553-35.384-2.553c-23.264 0-34.566 2.07-37.368 3.51-8.734-21.754-53.894-131.43-69.766-127.78-17.692 4.07-91.98 168.313-91.98 312.103 0 116.32 110.434 117.604 202.166 117.604 83.953 0 195.637-1.332 195.637-122.47-.002-143.788-76.212-303.856-93.902-307.926zM105.914 186.346c-.01-.004-.004-.02.014-.046 13.65-47.807 35.84-87.16 42.285-88.62 9.05-2.054 32.287 54.468 37.266 66.696-.517-.597-20.032.29-39.65 5.293-27.11 6.91-39.39 15.916-39.902 16.63l-.014.046zm145.67 144.063c-137.903 0-138.648-19.147-138.648-19.147l17.008-59.073s8.24 7.02 125.48 7.02c109.543 0 122.56-7.02 122.56-7.02l17.007 59.073s-2.953 19.146-143.406 19.146zM362.24 169.656c-19.624-5.01-39.145-5.9-39.66-5.302 4.98-12.247 28.226-68.857 37.278-66.8 6.444 1.463 28.645 40.877 42.298 88.757-.51-.712-12.795-9.732-39.916-16.655z"/></svg>
        </span>

        <span @click="mode='shading'" :class="{ active: mode === 'shading' }">
          Shading
          <svg class="icon" baseProfile="tiny" height="500" overflow="auto" viewBox="0 0 500 500" width="500" xmlns="http://www.w3.org/2000/svg"><path d="M359.688 31.938c-17.69-4.072-69.403 127.513-69.403 127.513s-8.165-2.553-35.384-2.553c-23.264 0-34.566 2.07-37.368 3.51-8.734-21.754-53.894-131.43-69.766-127.78-17.692 4.07-91.98 168.313-91.98 312.103 0 116.32 110.434 117.604 202.166 117.604 83.953 0 195.637-1.332 195.637-122.47-.002-143.788-76.212-303.856-93.902-307.926zM105.914 186.346c-.01-.004-.004-.02.014-.046 13.65-47.807 35.84-87.16 42.285-88.62 9.05-2.054 32.287 54.468 37.266 66.696-.517-.597-20.032.29-39.65 5.293-27.11 6.91-39.39 15.916-39.902 16.63l-.014.046zm145.67 144.063c-137.903 0-138.648-19.147-138.648-19.147l17.008-59.073s8.24 7.02 125.48 7.02c109.543 0 122.56-7.02 122.56-7.02l17.007 59.073s-2.953 19.146-143.406 19.146zM362.24 169.656c-19.624-5.01-39.145-5.9-39.66-5.302 4.98-12.247 28.226-68.857 37.278-66.8 6.444 1.463 28.645 40.877 42.298 88.757-.51-.712-12.795-9.732-39.916-16.655z"/></svg>
        </span>

        <span @click="mode='images'" :class="{ active: mode === 'images' }">
          Images
          <svg class="icon" baseProfile="tiny" height="500" overflow="auto" viewBox="0 0 500 500" width="500" xmlns="http://www.w3.org/2000/svg"><path d="M359.688 31.938c-17.69-4.072-69.403 127.513-69.403 127.513s-8.165-2.553-35.384-2.553c-23.264 0-34.566 2.07-37.368 3.51-8.734-21.754-53.894-131.43-69.766-127.78-17.692 4.07-91.98 168.313-91.98 312.103 0 116.32 110.434 117.604 202.166 117.604 83.953 0 195.637-1.332 195.637-122.47-.002-143.788-76.212-303.856-93.902-307.926zM105.914 186.346c-.01-.004-.004-.02.014-.046 13.65-47.807 35.84-87.16 42.285-88.62 9.05-2.054 32.287 54.468 37.266 66.696-.517-.597-20.032.29-39.65 5.293-27.11 6.91-39.39 15.916-39.902 16.63l-.014.046zm145.67 144.063c-137.903 0-138.648-19.147-138.648-19.147l17.008-59.073s8.24 7.02 125.48 7.02c109.543 0 122.56-7.02 122.56-7.02l17.007 59.073s-2.953 19.146-143.406 19.146zM362.24 169.656c-19.624-5.01-39.145-5.9-39.66-5.302 4.98-12.247 28.226-68.857 37.278-66.8 6.444 1.463 28.645 40.877 42.298 88.757-.51-.712-12.795-9.732-39.916-16.655z"/></svg>
        </span>

        <span @click="mode='components'" :class="{ active: mode === 'components' }">
          Components
          <svg class="icon" baseProfile="tiny" height="500" overflow="auto" viewBox="0 0 500 500" width="500" xmlns="http://www.w3.org/2000/svg"><path d="M359.688 31.938c-17.69-4.072-69.403 127.513-69.403 127.513s-8.165-2.553-35.384-2.553c-23.264 0-34.566 2.07-37.368 3.51-8.734-21.754-53.894-131.43-69.766-127.78-17.692 4.07-91.98 168.313-91.98 312.103 0 116.32 110.434 117.604 202.166 117.604 83.953 0 195.637-1.332 195.637-122.47-.002-143.788-76.212-303.856-93.902-307.926zM105.914 186.346c-.01-.004-.004-.02.014-.046 13.65-47.807 35.84-87.16 42.285-88.62 9.05-2.054 32.287 54.468 37.266 66.696-.517-.597-20.032.29-39.65 5.293-27.11 6.91-39.39 15.916-39.902 16.63l-.014.046zm145.67 144.063c-137.903 0-138.648-19.147-138.648-19.147l17.008-59.073s8.24 7.02 125.48 7.02c109.543 0 122.56-7.02 122.56-7.02l17.007 59.073s-2.953 19.146-143.406 19.146zM362.24 169.656c-19.624-5.01-39.145-5.9-39.66-5.302 4.98-12.247 28.226-68.857 37.278-66.8 6.444 1.463 28.645 40.877 42.298 88.757-.51-.712-12.795-9.732-39.916-16.655z"/></svg>
        </span>

        <span @click="mode='assign'" :class="{ active: mode === 'assign' }">
          Assign
          <svg class="icon" baseProfile="tiny" height="500" overflow="auto" viewBox="0 0 500 500" width="500" xmlns="http://www.w3.org/2000/svg"><path d="M359.688 31.938c-17.69-4.072-69.403 127.513-69.403 127.513s-8.165-2.553-35.384-2.553c-23.264 0-34.566 2.07-37.368 3.51-8.734-21.754-53.894-131.43-69.766-127.78-17.692 4.07-91.98 168.313-91.98 312.103 0 116.32 110.434 117.604 202.166 117.604 83.953 0 195.637-1.332 195.637-122.47-.002-143.788-76.212-303.856-93.902-307.926zM105.914 186.346c-.01-.004-.004-.02.014-.046 13.65-47.807 35.84-87.16 42.285-88.62 9.05-2.054 32.287 54.468 37.266 66.696-.517-.597-20.032.29-39.65 5.293-27.11 6.91-39.39 15.916-39.902 16.63l-.014.046zm145.67 144.063c-137.903 0-138.648-19.147-138.648-19.147l17.008-59.073s8.24 7.02 125.48 7.02c109.543 0 122.56-7.02 122.56-7.02l17.007 59.073s-2.953 19.146-143.406 19.146zM362.24 169.656c-19.624-5.01-39.145-5.9-39.66-5.302 4.98-12.247 28.226-68.857 37.278-66.8 6.444 1.463 28.645 40.877 42.298 88.757-.51-.712-12.795-9.732-39.916-16.655z"/></svg>
        </span>
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
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 14' height='10px'>
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
      <template v-if="mode==='floorplan'">
        <div class='input-select'>
            <label>View By</label>
            <select v-model='currentMode'>
                <option v-for="mode in ['building_units', 'thermal_zones', 'space_types']" :value="mode">{{ displayNameForMode(mode) }}</option>
            </select>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 14' height='10px'>
                <path d='M.5 0v14l11-7-11-7z' transform='translate(13) rotate(90)'></path>
            </svg>
        </div>
      </template>

      <div id="components-menu" v-if="mode==='components'">

        <span v-for="type in ['window_definitions', 'daylighting_control_definitions']"  @click="visibleComponentType = visibleComponentType === type ? null : type " :class="{ active: currentComponentType === type }">
          {{ type }}
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 14' height='10px'>
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
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 14' height='10px'>
                <path d='M.5 0v14l11-7-11-7z' transform='translate(13) rotate(90)'></path>
            </svg>
        </div>
      </template>





      <div id="snapping-options">
        <button @click="snapMode = 'grid-strict'" :class="{ active: snapMode === 'grid-strict' }">Strict Grid</button>
        <button @click="snapMode = 'grid-verts-edges'" :class="{ active: snapMode === 'grid-verts-edges' }">Edges too</button>
      </div>

      <div id="grid-tools">
        <button @click="tool = item" :class="{ active: tool === item }" v-for="item in availableTools" :data-tool="item">{{ item }}</button>
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
import AssignComponentMenu from './AssignComponentMenu.vue'
import applicationHelpers from './../store/modules/application/helpers';

// svgs
import openFloorplanSvg from './../assets/geometry-editor-icons/icon_open_floorplan.svg'
import saveFloorplanSvg from './../assets/geometry-editor-icons/icon_save_floorplan.svg'
import importLibrarySvg from './../assets/geometry-editor-icons/icon_import_library.svg'
import undoSvg from './../assets/geometry-editor-icons/icon_undo.svg'
import redoSvg from './../assets/geometry-editor-icons/icon_redo.svg'

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
    'redo-svg': redoSvg
  },
};
</script>

<style lang="scss" scoped>
@import "./../scss/config";

#toolbar {
  z-index: 3;
  #top {
    height: 2rem;
    #navigation-head {
      background-color: $gray-darkest;
      display: inline-block;
      #undo-redo {
        display: inline-block;
        float: right;
      }
      input {
        display: none;
      }
    }

    #mode-tabs {
       display: inline-block;
       > {
         display: inline-block;
       }
        > span {
          font-size: .8rem;
          width: 6rem;
          &.active {
            background-color: $gray-medium-light;
          }
          svg.icon {
            height: 1rem;
            width: 1rem;
          }
        }
    }
    #grid-settings {
      display: inline-block;
      float: right;
      > div {
        display: inline-block;
      }
    }
  }
  #bottom {
    background-color: $gray-medium-light;
    height: 3rem;
    margin-left: 17.5rem;
    > {
      display: inline-block;
    }

    #components-menu {
      span.active {
        background-color: $gray-dark;
      }
    }
    #grid-tools {
      float: right;
    }
  }
}
</style>
