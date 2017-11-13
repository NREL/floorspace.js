<template>
  <div class="edit-bar">
    <span v-for="col in columns"
      :data-column="col.name"
      :key="col.name"
    >
      <GenericInput
        :col="col"
        :row="row"
        :onChange="updateRow.bind(null, row.id, col.name)"
      />
    </span>
    <span class="destroy">
      <Delete class="button" />
    </span>
  </div>
</template>
<script>
import GenericInput from './GenericInput.vue';
import Delete from './../assets/svg-icons/delete.svg';


export default {
  props: ['row', 'columns', 'updateRow', 'destroy'],
  components: {
    GenericInput,
    Delete,
  },
}
</script>
<style lang="scss" scoped>
@import "./../scss/config";
.edit-bar {
  display: flex;
  flex-direction: column;
}
</style>
