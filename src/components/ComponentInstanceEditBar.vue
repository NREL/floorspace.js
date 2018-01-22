<template>
  <EditBar
    v-if="showInstanceEditor"
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
      currentComponent: 'application/currentComponent',
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
    showInstanceEditor() {
      return (this.instanceType &&
        this.currentComponent.type.replace(/_definitions$/, 's') === this.instanceType);
    },
  },
  methods: {
    destroyComponent() {
      if (this.instanceType === 'windows') {
        this.$store.dispatch('models/destroyWindow', { story_id: this.currentStory.id,  object: this.componentInstance });
      } else if (this.instanceType === 'daylighting_controls') {
        this.$store.dispatch('models/destroyDaylightingControl', { story_id: this.currentStory.id, object: this.componentInstance });
      } else if (this.instanceType === 'doors') {
        this.$store.dispatch('models/destroyDoor', { story_id: this.currentStory.id, object: this.componentInstance });
      } else {
        throw new Error(`Unrecognized component type ${this.instanceType}`);
      }
    },
    modifyComponentInstance(id, key, value) {
      if (this.instanceType === 'windows') {
        this.$store.dispatch('models/modifyWindow', { id, key, value, story_id: this.currentStory.id });
      } else if (this.instanceType === 'daylighting_controls') {
        this.$store.dispatch('models/modifyDaylightingControl', { id, key, value, story_id: this.currentStory.id });
      } else if (this.instanceType === 'doors') {
        this.$store.dispatch('models/modifyDoor', { id, key, value, story_id: this.currentStory.id });
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
