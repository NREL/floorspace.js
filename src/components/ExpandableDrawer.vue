<template>
  <div
    :class="{
      'expandable-drawer': true,
      expanded: expanded,
    }"
  >
    <p @click="expanded = !expanded" class="title">{{ caret }} {{ title }}</p>
    <p v-if="expanded">
      <slot />
    </p>
  </div>
</template>
<script>
export default {
  props: ["title"],
  data() {
    return {
      expanded: false,
    };
  },
  computed: {
    caret() {
      return this.expanded ? "\u25BC" : "\u25BA";
    },
  },
};
</script>
