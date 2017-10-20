<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <div class="editable-table">
    <table class="table head" cellspacing="0">
      <tr>
        <th class="select"><!-- placeholder for select column --></th>
        <th v-for="col in visibleColumns" @click="sortBy(col.name)">
          <span>{{col.displayName}}</span>
          <svg v-show="col.name === sortKey && sortDescending" viewBox="0 0 10 3" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 .5l5 5 5-5H0z"/>
          </svg>
          <svg v-show="col.name === sortKey && !sortDescending" viewBox="0 0 10 3" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 5.5l5-5 5 5H0z"/>
          </svg>
        </th>
        <th class="destroy"><!-- placeholder for delete column --></th>
      </tr>
    </table>
    <div class="inner-table">
      <table cellspacing="0">
        <tr v-for="row in sortedRows" :key="row.id" :class="{ selected: selectedItemId === row.id }">
          <td class="select" @click.stop="selectRow(row)">
            <input type="radio" :checked="selectedItemId === row.id" />
          </td>
          <td
              v-for="col in visibleColumns"
              :data-column="col.name"
              :key="col.name"
          >
            <generic-input
              :col="col"
              :row="row"
              :onChange="updateRow.bind(null, row.id, col.name)"
            />
          </td>
          <td class="destroy" @click.stop="deleteRow(row)">
            <Delete class="button" />
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';
import Delete from './../assets/svg-icons/delete.svg';

export default {
  name: 'EditableTable',
  props: [
    'columns', 'rows', 'deleteRow', 'updateRow',
    'selectRow', 'selectedItemId',
  ],
  data() {
    return {
      sortKey: 'id',
      sortDescending: true,
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
    sortBy(colName) {
      this.sortDescending = this.sortKey === colName ? !this.sortDescending : true;
      this.sortKey = colName;
    },
  },
  components: {
    Delete,
  },
};
</script>

<style lang="scss" scoped>
@import "./../scss/config";
  .editable-table {
    background-color: $gray-medium;
  }
  table.head {
    th {
      border-bottom: 2px solid $gray-medium-dark;
      background-color: $gray-medium;
      width: 11em;
      &.destroy, &.select {
        width: 2rem;
      }
    }
    tr {
      height: 3rem;
      svg {
        margin-left: 1em;
        height: 1rem;
        width: 1rem;
        fill: $gray-lightest;
      }
    }
  }
  td {
    width: 11em;
    input {
      background-color: $gray-medium;
      border: none;
      color: $gray-lightest;
      padding-top: 10px;
      padding-bottom: 10px;
      font-size: 1rem;
      height: 18px;
      width: 100%;
    }
  }
  tr {
    border-bottom: 2px solid tomato;
    padding-right: 2px;
    margin-right: -2px;
    &.selected {
      background-color: $gray-medium-light;
      input {
        background-color: $gray-medium-light;
      }
    }
  }
  td.destroy, td.select {
      width: 2rem;
      svg {
          cursor: pointer;
          height: 1.25rem;
          fill: $gray-lightest;
          &:hover {
              fill: $secondary;
          }
      }
  }
  .inner-table {
    overflow: scroll;
    position: absolute;
    height: calc(100% - 110px);
    background-color: $gray-medium;
  }

</style>
