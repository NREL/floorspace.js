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
          :compact="!expanded[spaceProp]"
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
import { mapGetters } from 'vuex';
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
    ...mapGetters({
      currentSpaceProperty: 'application/currentSpaceProperty',
    }),
  },
  methods: {
    toggleCompact(spaceProp) {
      this.expanded = { ...this.expanded, [spaceProp]: !this.expanded[spaceProp] };
    },
    displayName(spaceProp) {
      return libconfig[spaceProp].displayName;
    },
  },
  components: {
    Library,
    ...svgs,
  },
}
</script>
<style lang="scss" scoped>
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
      max-height: 400px;
      overflow: scroll;
      padding: 10px;
    }
  }

}
</style>
