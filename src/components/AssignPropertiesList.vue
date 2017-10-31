<template>
  <div class="assign-properties-list">
    <div v-for="spaceProp in ['building_units', 'thermal_zones', 'space_types', 'pitched_roofs']"
        :key="spaceProp"
        :title="displayName(spaceProp)"
        :class="{
          active: visibleSpaceProp === spaceProp,
          selected: currentSpaceProperty && currentSpaceProperty.type === spaceProp
        }"
    >
      <div @click="visibleSpaceProp = visibleSpaceProp === spaceProp ? null : spaceProp">
        <AssignSpacePropIcon :which="spaceProp" class="button" />
      </div>
      <div class="library">
        <Library
          v-if="visibleSpaceProp === spaceProp"
          :objectTypes="[spaceProp]"
          :mode="spaceProp"
          :searchAvailable="true"
          :compact="expanded[spaceProp]"
          @toggleCompact="toggleCompact(spaceProp)"
        />
      </div>
    </div>
    <span class="current-space-prop" v-if="currentSpaceProperty">
      {{ currentSpaceProperty.name }}
    </span>
  </div>
</template>
<script>
import Library from './Library.vue';
import libconfig from '../store/modules/models/libconfig';
import svgs from './svgs';

export default {
  name: 'AssignPropertiesList',
  data() {
    return {
      visibleSpaceProp: false,
      expanded: {},
    };
  },
  computed: {
    currentSpaceProperty: {
      get() { return this.$store.getters['application/currentSpaceProperty']; },
      set(item) { this.$store.dispatch('application/setCurrentSpacePropertyId', { id: item && item.id }); },
    },
    currentMode: {
      get() { return this.$store.state.application.currentSelections.mode; },
      set(mode) { this.$store.dispatch('application/setCurrentMode', { mode }); },
    },
    visibleOptions() {
      return this.$store.state.models.library[this.visibleSpaceProp] || [];
    },
  },
  methods: {
    toggleCompact(spaceProp) {
      this.expanded = { ...this.expanded, [spaceProp]: !this.expanded[spaceProp] };
    },
    displayName(spaceProp) {
      return libconfig[spaceProp].displayName;
    },
  },
  watch: {
    visibleSpaceProp() {
      this.currentMode = this.visibleSpaceProp;
      if (this.visibleSpaceProp !== (this.currentSpaceProperty && this.currentSpaceProperty.type)) {
        this.currentSpaceProperty = this.visibleOptions[0];
      }
    },
  },
  components: {
    Library,
    ...svgs,
  },
}
</script>
<style lang="scss">
@import "./../scss/config";
.assign-properties-list {
  display: flex;
  align-items: center;
  .button {
    margin: 5px;
  }
  .active {
    background-color: $gray-medium;
  }
  svg {
    fill: #fff;
  }
  .selected svg {
    fill: #008500;
  }
  .current-space-prop {
    margin-left: 1em;
  }
  .library {
    min-width: 200px;
    position: absolute;
    top: 81px;
    background-color: $gray-medium;
    .editable-select-list {
      max-height: 250px;
      overflow: auto;
      padding: 10px;
      tbody {
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

}
</style>
