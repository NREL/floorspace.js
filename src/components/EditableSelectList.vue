<template>
  <div class="editable-select-list">
    <div class="controls">
      <div class="control-group">
        <PrettySelect v-if="objectTypes.length > 1"
          @change="val => $emit('selectObjectType', val)"
          :options="objectTypes"
          :value="selectedObjectType"
        />
        <span v-else>{{ objectTypes[0].display }}</span>
        <button @click="addRow">+</button>
      </div>
      <div class="control-group">
        <button @click="compact = !compact">
          {{ compact ? '>>' : '<<' }}
        </button>
      </div>
    </div>
    <LibrarySelect
      v-if="compact"
      :rows="rows"
      :selectItem="selectRow"
      :destroyItem="destroyRow"
      :selectedItemId="selectedRowId"
    />
    <EditableTable
      v-else
      :columns="currentObjectTypeColumns"
      :rows="rows"
      :deleteRow="destroyRow"
      :updateRow="editRow"
    />
  </div>
</template>
<script>
import EditableTable from './EditableTable.vue';
import LibrarySelect from './LibrarySelect.vue';
import PrettySelect from './PrettySelect.vue';

export default {
  name: 'EditableSelectList',
  props: [
    'columns', 'rows', 'addRow', 'editRow', 'destroyRow', 'selectRow', 'selectedRowId',
    'objectTypes', 'selectedObjectType',
  ],
  data() {
    return {
      search: '',
      sortKey: 'id',
      sortDescending: true,
      compact: true,
    };
  },
  components: {
    EditableTable,
    LibrarySelect,
    PrettySelect,
  },
}
</script>
<style lang="scss" scoped>
@import "./../scss/config";

</style>
