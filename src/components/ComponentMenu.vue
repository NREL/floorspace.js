<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <div class="component-menu">
    <EditableSelectList
      :selectedObjectType="type"
      :objectTypes="[{ name: type, displayName }]"
      :rows="currentComponentDefinitions"
      :columns="currentComponentColumns"
      :selectedRowId="currentComponent && currentComponent.definition && currentComponent.definition.id"
      :selectRow="selectComponent"
      :addRow="createComponentDefinition"
      :editRow="updateComponentDef"
      :destroyRow="deleteComponentDef"
      :searchAvailable="true"
      :compact="compact"
      @toggleCompact="compact = !compact"
    />
  </div>
</template>

<script>
import icon from './../assets/svg-icons/add_image.svg'
import EditableSelectList from './EditableSelectList.vue';
import libconfig from '../store/modules/models/libconfig';
import helpers from './../store/modules/models/helpers';

export default {
  name: 'ComponentMenu',
  props: {
    type: {
      type: String,
      required: true,
      validator: _.partial(_.includes, ['window_definitions', 'daylighting_control_definitions']),
    },
  },
  mounted() {
    if (this.currentComponent.type !== this.type && this.currentComponentDefinitions.length) {
      this.selectComponent(this.currentComponentDefinitions[0]);
    }
  },
  data() {
    return {
      componentTypes: {
        daylighting_control_definitions: 'Daylighting Control Definitions',
        window_definitions: 'Window Definitions',
      },
      compact: false,
    };
  },
  methods: {
    createComponentDefinition() {
      this.$store.dispatch('models/createObjectWithType', { type: this.type })
    },
    deleteComponentDef(component) {
      switch (this.type) {
        case 'window_definitions':
          this.$store.dispatch('models/destroyWindowDef', { object: component });
          break;
        case 'daylighting_control_definitions':
          this.$store.dispatch('models/destroyDaylightingControlDef', { object: component });
          break;
        default:
          throw new Error(`unknown component type '${this.type}'`);
      }
    },
    updateComponentDef(componentId, key, value) {
      const result = helpers.setValueForKey(
        _.find(this.currentComponentDefinitions, { id: componentId }),
        this.$store, this.type, key, value);
      if (!result.success) {
        window.eventBus.$emit('error', result.error);
      }
    },
    selectComponent(component) {
      this.currentComponent = { definition: component };
    },
  },
  computed: {
    components() {
      return Object.keys(this.componentTypes).map(ct => ({
        defs: this.$store.state.models.library[ct],
        name: this.componentTypes[ct],
        type: ct,
      }));
    },
    currentComponentColumns() {
      return this.type ? libconfig[this.type].columns : [];
    },
    currentComponentDefinitions() {
      return this.type ? this.$store.state.models.library[this.type] : [];
    },
    currentComponent: {
      get() { return this.$store.getters['application/currentComponent']; },
      set(item) {
        if (!item || !item.definition || !item.definition.id) { return; }
        this.$store.dispatch('application/setCurrentComponentDefinitionId', { id: item.definition.id });
      },
    },
    displayName() {
      return this.componentTypes[this.type];
    },
  },
  components: {
    icon,
    EditableSelectList,
  },
};
</script>

<style lang="scss">
@import "./../scss/config";
.component-menu {
  min-width: 200px;
  position: absolute;
  top: 81px;
  background-color: $gray-medium;

  .editable-select-list {
    border: 2px solid black;
    border-top: none;
    max-height: 250px;
    overflow:scroll;
    padding: 10px;
    tbody {
      height: fit-content;
      max-height: 132px !important;
      position: static;
      width: auto;
    }
    &.expanded {
      position: fixed;
      background-color: $gray-medium;
      right: 0;
      left: 19.5rem;
    }
  }
  .library-select {
    max-height: 132px !important;
  }
}
</style>
