<!-- Floorspace.js, Copyright (c) 2016-2017, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <span v-if="col.readonly || !col.input_type" :class="{ numeric: col.numeric }">
    {{col.get ? col.get(row, rootState) : row[col.name]}}
  </span>
  <input
    v-else-if="col.input_type === 'text'"
    @keydown="blurOnEnter"
    @blur="onChange($event.target.value)"
    :value="row[col.name]"
    :disabled="disabled"
    :class="{ numeric: col.numeric }"
  />
  <div
    v-else-if="col.input_type === 'color'"
    class="color-wrapper"
  >
    <input
      ref="color_input"
      class="input-color"
      :object-id="row.id"
      :value="row[col.name]"
      :disabled="disabled"
    />
  </div>
  <pretty-select v-else-if="col.input_type === 'select'"
    @change="val => onChange(val)"
    :options="selectData"
    :value="row[col.name]"
    :disabled="disabled"
  />
</template>

<script>
import _ from 'lodash';
import Huebee from 'huebee';

export default {
  name: 'GenericInput',
  props: ['col', 'row', 'onChange'],
  methods: {
    blurOnEnter(evt) {
      if (evt.keyCode === 13) {
        //blur on enter
        this.$el.blur();
      }
      if (evt.keyCode == 27) {
        // reset then blur on esc
        this.$el.value = row[col.name];
        this.$el.blur();
      }
      return;
    },
    configurePicker() {
      if (!this.$refs.color_input) {
        return;
      }

      new Huebee(this.$refs.color_input, { saturations: 1, notation: 'hex' })
        .on('change', (color) => {
          this.onChange(color);
        });
    },
  },
  mounted() {
    this.configurePicker();
  },
  computed: {
    selectData() {
      return _.toPairs(this.col.select_data(this.row, this.$store.state))
        .map(([k, v]) => ({ val: v, display: k }));
    },
    rootState() { return this.$store.state; },
    disabled() {
      if (!this.col.enabled) {
        // columns are enabled by default, so any column that doesn't provide
        // an `enabled` callback is always enabled.
        return false;
      }
      return !this.col.enabled(this.row)
    },
  },
}

</script>

<style lang="scss" scoped>
@import "./../scss/config";
@import './../../node_modules/huebee/dist/huebee.min.css';
.numeric {
  text-align: right;
}
input {
  border-width: 2px;
  border-style: inset;
  border-color: $gray-lightest;
}
:disabled {
  background-image: linear-gradient(
    -45deg,
    gray 25%,
    transparent 25%,
    transparent 50%,
    gray 50%,
    gray 75%,
    transparent 75%,
    transparent
  );
  background-size: 4px 4px;
}
</style>
