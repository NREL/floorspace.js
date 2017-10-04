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
        <button @click="toggleCompact">
          {{ compact ? '>>' : '<<' }}
        </button>
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

export default {
  name: 'EditableSelectList',
  props: [
    'columns', 'rows', 'addRow', 'editRow', 'destroyRow', 'selectRow', 'selectedRowId',
    'objectTypes', 'selectedObjectType', 'searchAvailable',
  ],
  data() {
    return {
      search: '',
      sortKey: 'id',
      sortDescending: true,
      compact: true,
    };
  },
  mounted() {
    window.eventBus.$on('i-am-the-expanded-library-now', this.giveWayToOtherLibrary);
  },
  beforeDestroy() {
    window.eventBus.$off('i-am-the-expanded-library-now', this.giveWayToOtherLibrary);
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
      this.compact = !this.compact;
      window.eventBus.$emit(
        'i-am-the-expanded-library-now',
        !this.compact ? this._uid : null,
      );
    },
    giveWayToOtherLibrary(uid) {
      if (uid === this._uid) {
        // ignore events caused by myself.
        return;
      }
      this.compact = true;
    },
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
