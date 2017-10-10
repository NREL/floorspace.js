<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <div id="layout-navigation">
    <nav id="navigation">
      <!-- <div v-if="!libraryExpanded" id="right-bar" @mousedown="resizeBarClicked" v-on:dblclick="showHide" ref="resizebar" class="resize-bar"></div> -->
        <section id="selections">
        </section>

        <div id="list">
          <Library
            :objectTypes="['stories']"
            :mode="'stories'"
            :compact="libraryExpanded !== 'stories'"
            @toggleCompact="libraryExpanded = (libraryExpanded === 'stories' ? false : 'stories')"
          />
          <Library
            :objectTypes="objectTypesForTab"
            :mode="subselectionType"
            @changeMode="newMode => { subselectionType = newMode; }"
            :searchAvailable="true"
            :compact="libraryExpanded !== 'subselection'"
            @toggleCompact="libraryExpanded = (libraryExpanded === 'subselection' ? false : 'subselection')"
          />
        </div>
    </nav>

  </div>
</template>

<script>
import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';
import { getSiblings } from './../utilities';
import applicationHelpers from './../store/modules/application/helpers';
import modelHelpers from './../store/modules/models/helpers';
import ResizeEvents from './Resize/ResizeEvents';
import Library from './Library.vue';
import LibrarySelect from './LibrarySelect.vue';

let fullWidth;
const collapsedWidth = 8;
export default {
  name: 'navigation',
  mounted() {
    this.selectedObject = this.items[0];
    fullWidth = document.getElementById('layout-navigation').offsetWidth;
    window.addEventListener('resize', this.resetSize);
    window.eventBus.$on('i-am-the-expanded-library-now', this.setWidthForOpenLibrary);
  },
  data() {
    return {
      libraryExpanded: false,
    };
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resetSize);
    window.eventBus.$off('i-am-the-expanded-library-now', this.setWidthForOpenLibrary);
  },
  computed: {
    ...mapState({
      // available model types
      modes: state => state.application.modes,
      modeTab: state => state.application.currentSelections.modeTab,
      tool: state => state.application.currentSelections.tool,

      // top level models
      stories: state => state.models.stories,
      building_units: state => state.models.library.building_units,
      space_types: state => state.models.library.space_types,
      thermal_zones: state => state.models.library.thermal_zones,

      // for image upload placement
      max_x: state => state.project.view.max_x,
      max_y: state => state.project.view.max_y,
      min_x: state => state.project.view.min_x,
      min_y: state => state.project.view.min_y,
    }),

    ...mapGetters({
      currentSpace: 'application/currentSpace',
      currentShading: 'application/currentShading',
      currentImage: 'application/currentImage',
    }),

    /*
    * current selection getters and setters
    * these dispatch actions to update the data store when a new item is selected
    */
    currentStory: {
      get() { return this.$store.getters['application/currentStory']; },
      set(story) { this.$store.dispatch('application/setCurrentStoryId', { id: story.id }); },
    },
    currentSubSelection: {
      get() { return this.$store.getters['application/currentSubSelection']; },
      set(item) { this.$store.dispatch('application/setCurrentSubSelectionId', { id: (item ? item.id : null) }); },
    },

    // currentStory's child spaces, shading, and images
    spaces() { return this.currentStory.spaces; },
    shading() { return this.currentStory.shading; },
    images() { return this.currentStory.images; },
    objectTypesForTab() {
      switch (this.modeTab) {
        case 'floorplan':
          return ['spaces', 'images'];
        case 'shading':
          return ['shading'];
        case 'components':
          return ['spaces'];
        case 'assign':
          return ['building_units', 'thermal_zones', 'space_types'];
      }
    },
    // list items to display for current mode
    items() { return this[this.mode]; },
    mode: {
      get() { return this.$store.state.application.currentSelections.mode; },
      set(mode) { this.$store.dispatch('application/setCurrentMode', { mode }); },
    },
    subselectionType: {
      get() { return this.$store.state.application.currentSelections.subselectionType; },
      set(sst) { this.$store.dispatch('application/setCurrentSubselectionType', { subselectionType: sst }); },
    },

    currentThermalZone: {
      get() { return this.$store.getters['application/currentThermalZone']; },
      set(item) { this.$store.dispatch('application/setCurrentThermalZoneId', { id: item.id }); },
    },
    currentBuildingUnit: {
      get() { return this.$store.getters['application/currentBuildingUnit']; },
      set(item) { this.$store.dispatch('application/setCurrentBuildingUnitId', { id: item.id }); },
    },
    currentSpaceType: {
      get() { return this.$store.getters['application/currentSpaceType']; },
      set(item) { this.$store.dispatch('application/setCurrentSpaceTypeId', { id: item.id }); },
    },

    selectedObject: {
      get() {
        switch (this.mode) {
          case 'stories':
            return this.currentStory;
          case 'building_units':
            return this.currentBuildingUnit;
          case 'thermal_zones':
            return this.currentThermalZone;
          case 'space_types':
            return this.currentSpaceType;
          default: // spaces, shading, images
            return this.currentSubSelection;
        }
      },
      set(item) {
        switch (this.mode) {
          case 'stories':
            this.currentStory = item;
            break;
          case 'building_units':
            this.currentBuildingUnit = item;
            break;
          case 'thermal_zones':
            this.currentThermalZone = item;
            break;
          case 'space_types':
            this.currentSpaceType = item;
            break;
          default: // spaces, shading, images
            this.currentSubSelection = item;
            break;
        }
      },
    },
  },
  methods: {
    /*
    * Resize the library and adjust the positions of sibling elements
    */
    resizeBarClicked() {
      const doResize = (e) => {
        const newWidth = e.clientX > collapsedWidth ? e.clientX : collapsedWidth;
        document.getElementById('layout-navigation').style.width = `${newWidth}px`;
        getSiblings(document.getElementById('layout-navigation')).forEach((el) => {
          el.style.left = `${newWidth}px`;
        });

        ResizeEvents.$emit('resize');
      };
      const stopResize = () => {
        window.removeEventListener('mousemove', doResize);
        window.removeEventListener('mouseup', stopResize);
      };
      window.addEventListener('mousemove', doResize);
      window.addEventListener('mouseup', stopResize);
    },
    showHide() {
      const newWidth = document.getElementById('layout-navigation').offsetWidth === collapsedWidth ? fullWidth : collapsedWidth;
      document.getElementById('layout-navigation').style.width = `${newWidth}px`;
      getSiblings(document.getElementById('layout-navigation')).forEach((el) => {
        el.style.left = `${newWidth}px`;
      });
      ResizeEvents.$emit('resize');
    },

    // reset the nagiv   size when the window is resized
    resetSize() {
      if (this.libraryExpanded) {
        return;
      }
      document.getElementById('layout-navigation').style.width = '';
      getSiblings(document.getElementById('layout-navigation')).forEach((el) => {
        el.style.left = '';
        el.style.display = null;
      });
      fullWidth = document.getElementById('layout-navigation').offsetWidth;
    },
    setWidthForOpenLibrary() {
      if (!this.libraryExpanded) {
        this.resetSize();
        ResizeEvents.$emit('resize');
        return;
      }

      document.getElementById('layout-navigation').style.width = '100%';
      ResizeEvents.$emit('resize');
    },

    /*
    * initialize an empty space, shading, building_unit, or thermal_zone depending on the selected mode
    * if initializing a story, "story" will be passed in as the mode argument
    */
    createItem(mode = this.mode) {
      switch (mode) {
        case 'stories':
          this.$store.dispatch('models/initStory');
          this.setCurrentItem();
          return;
        case 'spaces':
          this.$store.dispatch('models/initSpace', { story: this.currentStory });
          break;
        case 'shading':
          this.$store.dispatch('models/initShading', { story: this.currentStory });
          break;
        case 'building_units':
        case 'thermal_zones':
        case 'space_types':
          this.$store.dispatch('models/createObjectWithType', { type: mode });
          break;
        default:
          break;
      }
      // select the new item
      this.selectItem(this.items[this.items.length - 1], mode);
    },

    /*
    * dispatch an action to destroy the currently selected item
    */
    destroyItem(item, mode = this.mode) {
      // don't allow deletion of the last item of a type
      if (this[mode].length <= 1 && (mode === 'stories' || mode === 'spaces')) { return; }

      switch (mode) {
        case 'stories':
          this.$store.dispatch('models/destroyStory', { story: item });
          this.setCurrentItem();
          break;
        case 'spaces':
          this.$store.dispatch('models/destroySpace', {
            space: item,
            story: this.currentStory,
          });
          break;
        case 'shading':
          this.$store.dispatch('models/destroyShading', {
            shading: item,
            story: this.currentStory,
          });
          break;
        case 'images':
          this.$store.dispatch('models/destroyImage', {
            image: item,
            story: this.currentStory,
          });
          break;
        case 'building_units':
        case 'thermal_zones':
        case 'space_types':
          this.$store.dispatch('models/destroyObject', { object: item });
          break;
        default:
          break;
      }
      this.setCurrentItem();
    },
    destroyStory(item) { this.destroyItem(item, 'stories'); },

    /*
    * set current selection for a type
    */
    selectItem(item, mode = this.mode) {
      switch (mode) {
        case 'stories':
          this.currentStory = item;
          this.setCurrentItem();
          break;
        case 'building_units':
          this.currentBuildingUnit = item;
          break;
        case 'thermal_zones':
          this.currentThermalZone = item;
          break;
        case 'space_types':
          this.currentSpaceType = item;
          break;
        default: // spaces, shading, images
          this.currentSubSelection = item;
          break;
      }
    },
    selectStory(item) { this.selectItem(item, 'stories'); },


    setCurrentItem() {
      // to be used when, ex changing stories or deleting an item.
      // According to issue #134, we don't want to ever allow a situation
      // where no item is selected.
      if (this.items.length && (!this.selectedObject || !_.includes(_.map(this.items, 'id'), this.selectedObject.id))) {
        this.selectedObject = this.items[0];
      }
    },

    /*
    * look up the display name for the selected mode (library type)
    */
    displayNameForMode(mode = this.mode) { return applicationHelpers.displayNameForMode(mode); },
  },
  watch: {
    mode() {
      this.setCurrentItem();
    },
    selectedObject(obj) {
      if (!obj) return;
      const row = this.$el.querySelector(`[data-id="${obj.id}"]`);
      if (row) {
        row.scrollIntoView();
      }
    },
    currentStory(obj) {
      if (!obj) return;
      const row = this.$el.querySelector(`[data-id="${obj.id}"]`);
      if (row) {
        row.scrollIntoView();
      }
    },
    libraryExpanded() {
      this.setWidthForOpenLibrary();
    },
    objectTypesForTab(val) {
      if (!_.includes(val, this.subselectionType)){
        this.subselectionType = val[0];
      }
    },
  },
  components: {
    Library,
  }
};
</script>

<style lang="scss" scoped>
@import "./../scss/config";
// #right-bar {
//   position: absolute;
//   right: 0;
//   width: 8px;
//   height: 100%;
//   transition: background 0.5s linear;
//
//   &:hover, &:active {
//     background-color: $gray-lightest;
//     cursor: e-resize;
//   }
// }
#navigation {
    background-color: $gray-medium-dark;
    border-right: 1px solid $gray-darkest;
    font-size: 0.75rem;
    height: 100%;
    user-select: none;

    #list {
      display: flex;
      height: 100%;
      .editable-select-list {
        border-right: 1px solid $gray-darkest;
        height: calc(100% - 2rem);
        width: 200px;

        &.expanded {
          width: calc(100% - 200px);
        }
      }
    }
}
</style>
