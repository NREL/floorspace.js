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
    :addRow="!componentInstanceMode && createObject"
    :editRow="modifyObject"
    :destroyRow="destroyObject"
    :searchAvailable="searchAvailable"
    :compact="compact"
    @toggleCompact="c => $emit('toggleCompact', c)"
    @selectObjectType="changeMode"
  />
</template>

<script>
import { mapState } from 'vuex';
import libconfig from '../store/modules/models/libconfig';
import EditableSelectList from './EditableSelectList.vue';
import helpers from '../store/modules/models/helpers';
import { assignableProperties, componentTypes } from '../store/modules/application/appconfig';


function keyForMode(mode) {
  return (
    mode === 'stories' ? 'currentStory' :
    _.includes(componentTypes, mode) ? 'currentComponentDef' :
    _.includes(assignableProperties, mode) ? 'currentSpaceProperty' :
    _.includes(['windows', 'daylighting_controls'], mode) ? 'currentComponentInstance' :
    'currentSubSelection');
}


export default {
  name: 'Library',
  props: ['objectTypes', 'mode', 'searchAvailable', 'compact'],
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
    currentStory: {
      get() { return this.$store.getters['application/currentStory']; },
      set(story) { this.$store.dispatch('application/setCurrentStoryId', { id: story.id }); },
    },
    // current selection getters and setters - these dispatch actions to update the data store when a new item is selected
    currentSubSelection: {
      get() { return this.$store.getters['application/currentSubSelection']; },
      set(item) { this.$store.dispatch('application/setCurrentSubSelectionId', { id: item.id }); },
    },
    currentSpaceProperty: {
      get() { return this.$store.getters['application/currentSpaceProperty']; },
      set(item) { this.$store.dispatch('application/setCurrentSpacePropertyId', { id: item.id }); },
    },
    currentComponentDef: {
      get() { return this.$store.getters['application/currentComponentDefinition']; },
      set(item) { this.$store.dispatch('application/setCurrentComponentDefinitionId', { id: item.id }); },
    },
    currentComponentInstance: {
      get() { return this.$store.getters['application/currentComponentInstance']; },
      set(ci) { this.$store.dispatch('application/setCurrentComponentInstanceId', { id: ci.id }); },
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
      return keyForMode(this.mode);
    },
    ...mapState({
      stories: state => state.models.stories,
    }),
    spaces() { return this.currentStory.spaces; },
    shading() { return this.currentStory.shading; },
    images() { return this.currentStory.images; },
    windows() { return this.currentStory.windows; },
    daylighting_controls() {
      return _.flatMap(this.currentStory.spaces, s => s.daylighting_controls);
    },
    rows() {
      return _.includes(
          ['stories', 'spaces', 'shading', 'images', 'windows', 'daylighting_controls'],
          this.mode,
      ) ? this[this.mode] : this.$store.state.models.library[this.mode];
    },
    componentInstanceMode() {
      return _.includes(['windows', 'daylighting_controls'], this.mode);
    },
    renderByMode: {
      get() { return this.$store.state.application.currentSelections.mode; },
      set(mode) { this.$store.dispatch('application/setCurrentMode', { mode }); },
    },
  },
  watch: {
    rows() {
      if (!(this.selectedObject && _.includes(_.map(this.rows, 'id'), this.selectedObject.id)) && this.rows.length > 0) {
        this.selectedObject = this.rows[0];
      }
    },
    mode(currMode, oldMode) {
      if (keyForMode(currMode) === 'currentSpaceProperty') {
        this.renderByMode = this.mode;
      } else if (keyForMode(oldMode) === 'currentSpaceProperty') {
        this.renderByMode = 'spaces';
      }
    }
  },
  methods: {
    changeMode(newMode) {
      if (!_.includes(this.objectTypes, newMode)) {
        throw new Error(`Unable to find ${newMode} in options ${JSON.stringify(this.objectTypes)}`);
      }
      this.$emit('changeMode', newMode);
    },
    modifyObject(rowId, colName, value) {
      if (this.componentInstanceMode) {
        return this.modifyComponentInstance(rowId, colName, value);
      }
      const row = _.find(this.rows, { id: rowId });
      const result = helpers.setValueForKey(row, this.$store, this.mode, colName, value);
      if (!result.success) {
        window.eventBus.$emit('error', result.error);
      }
    },
    modifyComponentInstance(id, key, value) {
      if (this.mode === 'windows') {
        this.$store.dispatch('models/modifyWindow', { id, key, value, story_id: this.currentStory.id });
      } else if (this.mode === 'daylighting_controls') {
        this.$store.dispatch('models/modifyDaylightingControl', { id, key, value, story_id: this.currentStory.id });
      } else {
        throw new Error(`unrecognized component mode "${this.mode}"`);
      }
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
        case 'windows':
        case 'daylighting_controls':
          window.eventBus.$emit('error', 'Create components by clicking where you would like it to be');
          break;
        default:
          this.$store.dispatch('models/createObjectWithType', { type: this.mode });
          break;
      }
      this.selectLatest();
    },
    selectLatest() {
      const newestRow = _.maxBy(this.rows, r => +r.id);
      if (!newestRow) { return; }
      this.selectedObject = newestRow;
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
        case 'windows':
          this.$store.dispatch('models/destroyWindow', { story_id: this.currentStory.id, object });
          break;
        case 'daylighting_controls':
          this.$store.dispatch('models/destroyDaylightingControl', { story_id: this.currentStory.id, object });
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
