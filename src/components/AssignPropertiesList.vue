<template>
  <div class="assign-properties-list">
    <div v-for="spaceProp in ['building_units', 'thermal_zones', 'space_types']"
        :key="spaceProp"
        :class="{
          active: visibleSpaceProp === spaceProp,
          selected: selectedSpaceProp === spaceProp
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
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import Library from './Library.vue';
import svgs from './svgs';

export default {
  name: 'AssignPropertiesList',
  data() {
    return {
      visibleSpaceProp: false,
      selectedSpaceProp: null,
      expanded: {},
    };
  },
  computed: {
    ...mapGetters({
      currentBuildingUnit: 'application/currentBuildingUnit',
      currentThermalZone: 'application/currentThermalZone',
      currentSpaceType: 'application/currentSpaceType',
    }),
  },
  watch: {
    currentBuildingUnit(val) { if (val) this.selectedSpaceProp = 'building_units'; },
    currentThermalZone(val) { if (val) this.selectedSpaceProp = 'thermal_zones'; },
    currentSpaceType(val) { if (val) this.selectedSpaceProp = 'space_types'; },
  },
  methods: {
    toggleCompact(spaceProp) {
      this.expanded = { ...this.expanded, [spaceProp]: !this.expanded[spaceProp] };
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
  .library {
    min-width: 200px;
    position: absolute;
    top: 81px;
    background-color: $gray-medium;
    .editable-select-list {
      max-height: 400px;
      overflow:scroll;
      padding: 10px;
    }
  }

}
</style>
