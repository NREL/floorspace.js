<template>
  <div id="component-icons" class="components-list">
    <div v-for="compType in ['window_definitions', 'daylighting_control_definitions']"
        :key="compType"
        :class="{ active: visibleComponentType === compType }">
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
import ComponentMenu from './ComponentMenu.vue';
import svgs from './svgs';

export default {
  name: 'ComponentsList',
  data() {
    return {
      visibleComponentType: false,
    };
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
  .active {
    background-color: $gray-medium;
  }
}
</style>
