<template>
  <div class="expandable-drawer">
    <p @click="expanded = !expanded">
      {{ caret }} {{ title }}
    </p>
    <p v-if="expanded">
      <slot />
    </p>
  </div>
</template>
<script>
export default {
  props: ['title'],
  data() {
    return {
      expanded: false,
    }
  },
  computed: {
    caret() {
      return this.expanded ? '\u25BC' : '\u25BA';
    },
  },
}
</script>
<style lang="scss" scoped>

</style>
