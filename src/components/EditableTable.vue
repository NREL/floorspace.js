<!-- Floorspace.js, Copyright (c) 2016-2017, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <div class="editable-table">
    <RecycleScroller
      id="recycle-scroller"
      class="scroller"
      :items="sortedRows"
      @scroll.native="wrapperScrollLeft = $event.target.scrollLeft"
      :item-size="70"
    >
      <template #before>
        <div
          id="fixedHeader"
          class="flex-row fixed"
          :style="{
            '-webkit-transform': 'translateX(' + -wrapperScrollLeft + 'px)',
            transform: 'translateX(' + -wrapperScrollLeft + 'px)',
            'clip-path': `polygon(${wrapperScrollLeft}px 0%, 100% 0%, 100% 100%, ${wrapperScrollLeft}px 100%)`,
          }"
        >
          <div class="checkbox-header"></div>
          <div
            v-for="col in visibleColumns"
            v-bind:class="{ active: sortKey === col.name }"
            class="headers"
            :fixed="col.fixed"
            :id="col.displayName.replace(/\s/g, '')"
            :key="col.name"
            :data-column="col.name"
            :prop="col.name"
            :label="col.displayName"
            :class-name="`column__${col.name}`"
            @click="sortBy(col.name)"
            :min-width="col.width || 165"
          >
            {{ col.displayName }}
            <i
              v-if="
                sortKey !== col.name || (sortKey === col.name && sortDescending)
              "
              class="icon-chevron-down"
            ></i>
            <i
              v-if="sortKey === col.name && !sortDescending"
              class="icon-chevron-up"
            ></i>
          </div>
        </div>
      </template>
      <template v-slot="{ item }">
        <div class="cell table-data flex-row table-first-column">
          <div class="select" @click.stop="selectRow(item)">
            <input type="radio" :checked="selectedItemId === item.id" />
          </div>
          <generic-input
            :col="visibleColumns[0]"
            :row="item"
            :onChange="updateRow.bind(null, item.id, visibleColumns[0].name)"
          />
        </div>
        <div
          class="flex-row"
          :fixed="item.fixed"
          :key="item.id"
          :data-column="item.name"
          :prop="item.name"
          :label="item.displayName"
          :class-name="`column__${item.name}`"
          :min-width="item.width || 154"
        >
          <div
            v-for="col in visibleColumns.slice(1)"
            :key="col.name"
            :data-column="col.name"
            :prop="col.name"
            :label="col.displayName"
            class="cell table-data"
          >
            <generic-input
              :col="col"
              :row="item"
              :onChange="updateRow.bind(null, item.id, col.name)"
            />
          </div>

          <div>
            <div
              class="duplicate"
              @click.stop="duplicateRow(item)"
              title="duplicate"
            >
              <Copy class="button" />
            </div>
          </div>

          <div>
            <div class="destroy" @click.stop="deleteRow(item)" title="destroy">
              <Delete class="button" />
            </div>
          </div>
        </div>
      </template>
    </RecycleScroller>
  </div>
</template>

<script>
import _ from "lodash";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import Delete from "./../assets/svg-icons/delete.svg";
import Copy from "./../assets/svg-icons/copy_icon.svg";

export default {
  name: "EditableTable",
  props: [
    "columns",
    "rows",
    "deleteRow",
    "updateRow",
    "selectRow",
    "selectedItemId",
    "duplicateRow",
  ],
  data() {
    return {
      sortKey: (r) => +r.id,
      sortDescending: false,
      wrapperScrollLeft: 0,
    };
  },
  computed: {
    visibleColumns() {
      return _.reject(this.columns, "private");
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
    /**
     * Sets the flags to sort by a column.
     * In order, it will sort descending, ascending, and then not at all if called with the same column
     *
     * @param colName - Name of the column to sort by
     */
    sortBy(colName) {
      if (this.sortKey === colName) {
        if (this.sortDescending) {
          this.sortDescending = false;
        } else {
          this.sortKey = undefined;
        }
      } else {
        this.sortKey = colName;
        this.sortDescending = true;
      }
    },
  },
  components: {
    Delete,
    Copy,
    RecycleScroller,
  },
};
</script>

<style lang="scss">
@import "./../scss/config";

.editable-table {
  .scroller {
    height: calc(50vh - 151px);
    margin-top: 46px;
  }

  .scroller > .vue-recycle-scroller__slot {
    // In combination with above, places the title bar above the scroll bar
    margin-top: -46px;
  }

  .headers {
    font-size: 14px;
    margin-bottom: auto;
    margin-top: auto;
    min-width: 144px;
    max-width: 144px;
    font-weight: 700;
    padding-left: 10px;

    background-color: $gray-medium;
    color: $gray-lightest;
    text-align: center;
    word-break: break-word;
  }

  .flex-row {
    display: flex;
  }

  .vue-recycle-scroller.ready.direction-vertical
    .vue-recycle-scroller__item-view {
    display: flex;
  }

  .checkbox-header {
    background-color: $gray-medium;
    min-width: 50px;
  }

  .vue-recycle-scroller__item-wrapper {
    margin-top: 20px;
    margin-bottom: 90px;
    overflow: visible;
  }

  .fixed {
    position: fixed;
    height: 25px;
  }

  #fixedHeader {
    position: fixed;
    background-color: $gray-medium;
    z-index: 100;
    height: 46px;
    // Ensures that the title background fills up all available space
    padding-right: 100vw;
  }

  .vue-recycle-scroller__slot {
    height: 10px;
  }

  .vue-recycle-scroller.ready.direction-vertical
    .vue-recycle-scroller__item-view {
    width: auto !important;
    margin-top: 20px;
  }

  .vue-recycle-scroller__item-wrapper {
    position: static !important;
  }

  .vue-recycle-scroller__slot {
    padding-bottom: 15px;
  }

  .active {
    color: #409eff;
  }

  .table-data {
    margin-bottom: auto;
    margin-top: auto;
    max-width: 134px;
    min-width: 134px;
    padding-left: 10px;
    padding-right: 10px;
    text-align: center;
  }

  .table-first-column {
    max-width: 204px;
    min-width: 204px;
    padding-right: 0;
  }

  .cell {
    text-align: center;
    word-break: break-word;
    color: $gray-lightest;
    input {
      width: 100%;
      background-color: $gray-medium;
      color: $gray-lightest;
      padding-top: 5px;
      padding-bottom: 5px;
      margin-top: 5px;
      margin-bottom: 5px;
      height: 16px;
      font-size: 16px;
    }
  }

  .select {
    margin-bottom: auto;
    margin-top: auto;
    max-width: 50px;
    min-width: 50px;
  }

  .destroy,
  .duplicate {
    width: 35px;
    > [type="radio"] {
      width: 25px;
    }
    > svg {
      margin-top: 12px;
      margin-left: -6px;
    }
    margin: 0 auto;
    padding: 0 10px 0 10px;
    text-align: center;
  }

  .duplicate svg {
    margin-top: 2px;
    width: 20px;
  }

  background-color: #3b4348;
}
</style>
