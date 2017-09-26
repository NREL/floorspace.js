<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th v-for="col in visibleColumns">
            {{col.displayName}}
          </th>
          <th><!-- placeholder for delete column --></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows">
          <td v-for="col in visibleColumns" :data-column="col.name">
            <input v-if="col.readonly || !col.input_type" :value="row[col.name]" readonly />

            <input v-if="col.input_type === 'text'" :value="row[col.name]" @change="updateRow(row.id, col.name, $event.target.value)"/>

            <div v-if="col.input_type === 'color'" class="input-color">
              <input :object-id="row.id" :value="row[col.name]" @change="updateRow(row.id, col.name, $event.target.value)"/>
            </div>

            <div v-if="col.input_type === 'select'" class='input-select'>
                <select @change="updateRow(row.id, col.name, $event.target.value)">
                    <option :selected="!row[col.name]" value="null">None</option>
                    <option v-for='(val, display) in col.select_data(row, rootState)' :value="val" :selected="row[col.name] === val">{{ display }}</option>
                </select>
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 14' height='10px'>
                    <path d='M.5 0v14l11-7-11-7z' transform='translate(13) rotate(90)'></path>
                </svg>
            </div>
          </td>
          <td class="destroy" @click="deleteRow(row.id)">
            <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path d="M137.05 128l75.476-75.475c2.5-2.5 2.5-6.55 0-9.05s-6.55-2.5-9.05 0L128 118.948 52.525 43.474c-2.5-2.5-6.55-2.5-9.05 0s-2.5 6.55 0 9.05L118.948 128l-75.476 75.475c-2.5 2.5-2.5 6.55 0 9.05 1.25 1.25 2.888 1.876 4.525 1.876s3.274-.624 4.524-1.874L128 137.05l75.475 75.476c1.25 1.25 2.888 1.875 4.525 1.875s3.275-.624 4.525-1.874c2.5-2.5 2.5-6.55 0-9.05L137.05 128z"/>
            </svg>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <button @click="newRow">+</button>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'EditableSelectTable',
  props: ['columns', 'rows', 'newRow', 'deleteRow', 'updateRow'],
  data() {
    return {
      editableRow: null,
    };
  },
  computed: {
    ...mapState({
      rootState: state => state,
    }),
    visibleColumns() {
      return _.reject(this.columns, 'private');
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./../scss/config";
  div {
    background-color: blue;
    height: 300px;
  }
  td.destroy {
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

</style>
