<!-- Floorspace.js, Copyright (c) 2016-2017, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <div class="editable-table">
    <el-table
      :data="sortedRows"
      height="calc(50vh - 105px)"
      @sort-change="sortChange"
      empty-text="No data"
    >
      <TableColumn
        prop="select"
        label=""
        class="select"
        width="35"
        :fixed="true"
      >
        <template slot-scope="scope">
          <div class="select" @click.stop="selectRow(scope.row)">
            <input type="radio" :checked="selectedItemId === scope.row.id" />
          </div>
        </template>
      </TableColumn>
      <TableColumn
        v-for="col in visibleColumns"
        :key="col.name"
        :data-column="col.name"
        :prop="col.name"
        :label="col.displayName"
        :class-name="`column__${col.name}`"
        width="154"
        :fixed="col.name == 'name'"
        sortable="custom"
      >
        <template slot-scope="scope">
          <generic-input
              :col="col"
              :row="scope.row"
              :onChange="updateRow.bind(null, scope.row.id, col.name)"
          />
        </template>
      </TableColumn>
      <TableColumn
        prop="duplicate"
        label=""
        class="duplicate"
        width="35"
      >
        <template slot-scope="scope">
          <div class="duplicate" @click.stop="duplicateRow(scope.row)" title="duplicate">
            <Copy class="button" />
          </div>
        </template>
      </TableColumn>

      <TableColumn
        prop="destroy"
        label=""
        class="destroy"
        width="35"
      >
        <template slot-scope="scope">
          <div class="destroy" @click.stop="deleteRow(scope.row)" title="delete">
            <Delete class="button" />
          </div>
        </template>
      </TableColumn>
    </el-table>
  </div>
</template>

<script>
import _ from 'lodash';
import { Table, TableColumn } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import { mapState, mapGetters } from 'vuex';
import Delete from './../assets/svg-icons/delete.svg';
import Copy from './../assets/svg-icons/copy_icon.svg';

export default {
  name: 'EditableTable',
  props: [
    'columns', 'rows', 'deleteRow', 'updateRow',
    'selectRow', 'selectedItemId', 'duplicateRow',
  ],
  data() {
    return {
      sortKey: r => +r.id,
      sortDescending: false,
    };
  },
  computed: {
    visibleColumns() {
      return _.reject(this.columns, 'private');
    },
    sortedRows() {
      const sRows = _.sortBy(this.rows, this.sortKey);
      if (this.sortDescending) {
        sRows.reverse();
      }
      return sRows;
    },
  },
  methods: {
    sortChange({ prop, order }) {
        this.sortKey = prop;
        this.sortDescending = (order === 'descending');
    },
    sortBy(colName) {
      this.sortDescending = this.sortKey === colName ? !this.sortDescending : true;
      this.sortKey = colName;
    },
  },
  components: {
    Delete,
    Copy,
    'el-table': Table,
    TableColumn,
  },
};
</script>

<style lang="scss">
@import "./../scss/config";

  .editable-table {
    .el-table::before, .el-table__fixed-right::before, .el-table__fixed::before {
      width: 0;
    }
    .el-table__body-wrapper {
      background-color: $gray-medium;
    }
    .el-table td, .el-table th.is-leaf {
      border-bottom: none;
    }
    .el-table__header-wrapper {
      background-color: $gray-medium;
    }
    .el-table table {
      tbody, thead {
        tr, tr:hover {
          td, th {
            background-color: $gray-medium;
            padding: 0;
            height: 3rem;
            .cell {
              text-align: center;
              word-break: break-word;
              color: $gray-lightest;
              input {
                  width: 100%;
              }
            }
            .destroy, .select, .duplicate {
                width: 35px;
                > [type="radio"] {
                    width: 25px;
                }
                > svg {
                    margin-top: 12px;
                    margin-left: -6px;
                }
                margin: 0 auto;
                padding: 0;
            }
            .duplicate svg {
              margin-top: 2px;
              width: 20px;
            }

          }
        }
      }
      .el-table__body tbody {
          padding-bottom: 1rem;
      }
    }
    table {
      thead {
        border-bottom: 2px solid $gray-medium-dark;
        svg {
          fill: $gray-lightest;
        }
      }
      tbody {
        input {
          background-color: $gray-medium;
          color: $gray-lightest;
          padding-top: 5px;
          padding-bottom: 5px;
          margin-top: 5px;
          margin-bottom: 5px;
          height: 16px;
          font-size: 16px;
        }
        tr.selected {
          background-color: $gray-medium-light;
          input {
            background-color: $gray-medium-light;
          }
        }
      }
    }
  }

</style>
