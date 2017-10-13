<template>
  <div id="component-icons" class="components-list">
    <div v-for="compType in ['window_definitions', 'daylighting_control_definitions']"
        :key="compType"
        :class="{ active: visibleComponentType === compType, selected: selectedComponentType === compType }">
      <div @click="visibleComponentType = visibleComponentType === compType ? null : compType">
        <ComponentIcon :which="compType" class="button" />
      </div>
      <ComponentMenu
        v-if="visibleComponentType === compType"
        :type="compType"
      />
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import ComponentMenu from './ComponentMenu.vue';
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
  .active {
    background-color: $gray-medium;
  }
}
</style>
