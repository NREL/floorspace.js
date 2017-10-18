<template>
  <div id="component-icons" class="components-list">
    <div v-for="compType in ['window_definitions', 'daylighting_control_definitions']"
        :key="compType"
        :title="displayName(compType)"
        :class="{ active: visibleComponentType === compType, selected: selectedComponentType === compType }">
      <div @click="visibleComponentType = visibleComponentType === compType ? null : compType">
        <ComponentIcon :which="compType" class="button" />
      </div>
      <ComponentMenu
        v-if="visibleComponentType === compType"
        :type="compType"
      />
    </div>
    <span v-if="selectedComponentType" class="current-component">
      {{ currentComponent.definition.name }}
    </span>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import ComponentMenu from './ComponentMenu.vue';
import libconfig from '../store/modules/models/libconfig';
import svgs from './svgs';

export default {
  name: 'ComponentsList',
  data() {
    return {
      visibleComponentType: false,
    };
  },
  computed: {
    ...mapGetters({
      currentComponent: 'application/currentComponent',
    }),
    selectedComponentType() {
      return this.currentComponent && this.currentComponent.type;
    },
  },
  methods: {
    displayName(compType) {
      return libconfig[compType].displayName;
    },
  },
  components: {
    ComponentMenu,
    ...svgs,
  },
}
</script>
<style lang="scss" scoped>
@import "./../scss/config";
#component-icons {
  display: flex;
  align-items: center;
  .button {
    margin: 5px;
  }
  svg {
    fill: #fff;
  }

  .selected {
    svg {
      fill: #008500;
    }
  }
  .current-component {
    margin-left: 1em;
  }
  .active {
    background-color: $gray-medium;
  }
}
</style>
