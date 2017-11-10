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
  data() {
    return {
      libraryExpanded: false,
    };
  },
  computed: {
    ...mapGetters({
      currentComponent: 'application/currentComponent',
    }),
    ...mapState({
      modeTab: state => state.application.currentSelections.modeTab,
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
          return ['spaces', 'shading', 'images'];
        case 'shading':
          return ['shading'];
        case 'components':
          return ['windows', 'daylighting_controls'];
        case 'assign':
          return ['building_units', 'thermal_zones', 'space_types', 'construction_sets', 'pitched_roofs'];
      }
    },
    mode: {
      get() { return this.$store.state.application.currentSelections.mode; },
      set(mode) { this.$store.dispatch('application/setCurrentMode', { mode }); },
    },
    subselectionType: {
      get() { return this.$store.state.application.currentSelections.subselectionType; },
      set(sst) { this.$store.dispatch('application/setCurrentSubselectionType', { subselectionType: sst }); },
    },
  },
  methods: {
    // reset the nagiv   size when the window is resized
    resetSize() {
      if (this.libraryExpanded) {
        return;
      }
    },
    setWidthForOpenLibrary() {
      this.$emit('expanded', !!this.libraryExpanded);
      ResizeEvents.$emit('resize');
    },

  },
  watch: {
    libraryExpanded() {
      this.setWidthForOpenLibrary();
    },
    objectTypesForTab(val) {
      if (!_.includes(val, this.subselectionType)){
        this.subselectionType = val[0];
      }
    },
    currentComponent() {
      if (!this.currentComponent) { return; }
      if (this.modeTab !== 'components') { return; }

      this.subselectionType = this.currentComponent.type === 'window_definitions' ? 'windows' :
        this.currentComponent.type === 'daylighting_control_definitions' ? 'daylighting_controls' :
        this.subselectionType;
    },
  },
  components: {
    Library,
  }
};
</script>

<style lang="scss" scoped>
@import "./../scss/config";
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
      height: 100%;
      width: 200px;
      background-color: $gray-medium-dark;
      &.expanded {
        width: calc(100% - 200px);
      }
    }
  }
}
</style>
