<template>
  <EditBar
    v-if="componentInstance"
    :row="componentInstance"
    :columns="visibleColumns"
    :updateRow="modifyComponentInstance"
    :destroy="destroyComponent"
  />
</template>
<script>
import libconfig from '../store/modules/models/libconfig';
import { mapGetters } from 'vuex';
import EditBar from './EditBar.vue';

export default {
  computed: {
    ...mapGetters({
      componentInstance: 'application/currentComponentInstance',
      currentStory: 'application/currentStory',
    }),
    instanceType() {
      return this.componentInstance && this.componentInstance.type;
    },
    columns() {
      if (!this.componentInstance) { return []; }
      return libconfig[this.instanceType].columns;
    },
    visibleColumns() {
      return _.reject(this.columns, 'private');
    },
  },
  methods: {
    destroyComponent() {
      if (this.instanceType === 'window_definitions') {
        this.$store.dispatch('models/destroyWindowDef', { object: this.componentInstance });
      } else if (this.instanceType === 'daylighting_control_definitions') {
        this.$store.dispatch('models/destroyDaylightingControlDef', { object: this.componentInstance });
      } else {
        throw new Error(`Unrecognized component type ${componentType}`);
      }
    },
    modifyComponentInstance(id, key, value) {
      if (this.instanceType === 'windows') {
        this.$store.dispatch('models/modifyWindow', { id, key, value, story_id: this.currentStory.id });
      } else if (this.instanceType === 'daylighting_controls') {
        this.$store.dispatch('models/modifyDaylightingControl', { id, key, value, story_id: this.currentStory.id });
      } else {
        throw new Error(`unrecognized component mode "${this.mode}"`);
      }
    },
  },
  components: {
    EditBar,
  },
}
</script>
