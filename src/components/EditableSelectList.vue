<template>
  <div
    class="editable-select-list"
    :class="{ 'expanded': !compact }"
  >
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
        <a @click="toggleCompact">
          <DoubleArrows
            class="button"
            :transform="(compact ? '' : 'scale(-1, 1)') + 'translate(10,10)'"
          />
        </a>
      </div>
    </div>
    <input v-if="searchAvailable"
      v-model="search"
      class="search-bar"
      placeholder="search"
    />
    <LibrarySelect
      v-if="compact"
      :rows="searchedRows"
      :selectItem="selectRow"
      :destroyItem="destroyRow"
      :selectedItemId="selectedRowId"
    />
    <EditableTable
      v-else
      :columns="visibleColumns"
      :rows="searchedRows"
      :deleteRow="destroyRow"
      :updateRow="editRow"
    />
  </div>
</template>
<script>
import EditableTable from './EditableTable.vue';
import LibrarySelect from './LibrarySelect.vue';
import PrettySelect from './PrettySelect.vue';
import DoubleArrows from './../assets/svg-icons/double_arrows.svg';

export default {
  name: 'EditableSelectList',
  props: [
    'columns', 'rows', 'addRow', 'editRow', 'destroyRow', 'selectRow', 'selectedRowId',
    'objectTypes', 'selectedObjectType', 'searchAvailable', 'compact',
  ],
  data() {
    return {
      search: '',
    };
  },
  computed: {
    visibleColumns() {
      return _.reject(this.columns, 'private');
    },
    searchedRows() {
      return this.rows.filter(
        row => _.chain(row)
          .values()
          .compact()
          .some(val => val.toLowerCase && val.toLowerCase().includes(this.search.toLowerCase()))
          .value()
      );
    },
  },
  methods: {
    toggleCompact() {
      this.$emit('toggleCompact', !this.compact)
    },
  },
  components: {
    EditableTable,
    LibrarySelect,
    PrettySelect,
    DoubleArrows,
  },
}
</script>
<style lang="scss" scoped>
@import "./../scss/config";
.controls {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
}
.control-group {
  display: flex;
}
.editable-table {
  overflow-x: scroll;
  overflow-y: auto;
}
</style>
