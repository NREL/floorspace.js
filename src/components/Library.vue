<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the 'OpenStudio' trademark, 'OS', 'os', or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <EditableSelectList
    :selectedObjectType="mode"
    :objectTypes="objectTypesDisplay"
    :rows="rows"
    :columns="columns"
    :selectedRowId="selectedObject && selectedObject.id"
    :selectRow="row => { selectedObject = row; }"
    :addRow="createObject"
    :editRow="modifyObject"
    :destroyRow="destroyObject"
    v-on:selectObjectType="changeMode"
  />
</template>

<script>
import { mapState } from 'vuex';
import libconfig from '../store/modules/models/libconfig';
import EditableSelectList from './EditableSelectList.vue';

export default {
  name: 'Library',
  props: ['objectTypes', 'initialMode'],
  data() {
    const imageInput = document.createElement('input');
    imageInput.setAttribute('type', 'file');
    return {
      imageInput,
      mode: this.initialMode,
    };
  },
  mounted() {
    window.Library = this;
  },
  computed: {
    objectTypesDisplay() {
      return this.objectTypes.map(ot => ({
        val: ot,
        display: libconfig[ot].displayName,
      }));
    },
    columns() {
      if (!libconfig[this.mode]) return [];
      return libconfig[this.mode].columns
    },
    rows() {
      switch(this.mode) {
        case 'stories':
          return this.stories;
      }
    },
    currentStory: {
      get() { return this.$store.getters['application/currentStory']; },
      set(story) { this.$store.dispatch('application/setCurrentStoryId', { id: story.id }); },
    },
    // current selection getters and setters - these dispatch actions to update the data store when a new item is selected
    currentSubSelection: {
      get() { return this.$store.getters['application/currentSubSelection']; },
      set(item) { this.$store.dispatch('application/setCurrentSubSelectionId', { id: item.id }); },
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
    /*
    * returns the currently selected object in the library
    * when set, dispatches an action to update the application's currentSelections in the store
    */
    selectedObject: {
      get() {
        return this[this.keyForCurrentMode];
      },
      set(item) {
        this[this.keyForCurrentMode] = item;
      },
    },
    keyForCurrentMode() {
      return (
        this.mode === 'stories' ? 'currentStory' :
        this.mode === 'building_units' ? 'currentBuildingUnit' :
        this.mode === 'thermal_zones' ? 'currentThermalZone' :
        this.mode === 'space_types' ? 'currentSpaceType' :
        'currentSubSelection');
    },
    ...mapState({
      stories: state => state.models.stories,
    }),
    spaces() { return this.currentStory.spaces; },
    shading() { return this.currentStory.shading; },
    images() { return this.currentStory.images; },
    rows() {
      return _.includes(
          ['stories', 'spaces', 'shading', 'images'],
          this.mode,
      ) ? this[this.mode] : this.$store.state.models.library[this.mode];
    },
  },
  methods: {
    changeMode(newMode) {
      if (!_.includes(this.objectTypes, newMode)) {
        throw new Error(`Unable to find ${newMode} in options ${JSON.stringify(this.objectTypes)}`);
      }
      this.mode = newMode;
    },
    modifyObject(rowId, colName, value) {
      throw new Error('not implemented');
    },
    /*
    * CREATE OBJECT
    * initializes an empty object
    */
    createObject() {
      switch (this.mode) {
        case 'stories':
          this.$store.dispatch('models/initStory');
          return;
        case 'spaces':
          this.$store.dispatch('models/initSpace', { story: this.currentStory });
          break;
        case 'shading':
          this.$store.dispatch('models/initShading', { story: this.currentStory });
          break;
        case 'images':
          window.eventBus.$emit('uploadImage');
          break;
        default:
          this.$store.dispatch('models/createObjectWithType', { type: this.mode });
          break;
      }
    },

    /*
    * DESTROY OBJECT
    */
    destroyObject(object) {
      switch (this.mode) {
        case 'stories':
          this.$store.dispatch('models/destroyStory', { story: object });
          return;
        case 'spaces':
          this.$store.dispatch('models/destroySpace', {
            space: object,
            story: this.$store.state.models.stories.find(story => story[this.mode].find(o => o.id === object.id)),
          });
          break;
        case 'shading':
          this.$store.dispatch('models/destroyShading', {
            shading: object,
            story: this.$store.state.models.stories.find(story => story[this.mode].find(o => o.id === object.id)),
          });
          break;
        case 'images':
          this.$store.dispatch('models/destroyImage', {
            image: object,
            story: this.$store.state.models.stories.find(story => story[this.mode].find(o => o.id === object.id)),
          });
          break;
        case 'window_definitions':
          this.$store.dispatch('models/destroyWindowDef', { object });
          break;
        case 'daylighting_control_definitions':
          this.$store.dispatch('models/destroyDaylightingControlDef', { object });
          break;
        default:
          this.$store.dispatch('models/destroyObject', { object });
          break;
      }
    },

  },
  components: {
    EditableSelectList,
  },
};
</script>
