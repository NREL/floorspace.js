<!-- Floorspace.js, Copyright (c) 2016-2017, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <span v-if="col.readonly || !col.input_type" :class="{ numeric: col.numeric }">
    {{value}}
  </span>
  <input
    v-else-if="col.input_type === 'text'"
    @keydown="blurOnEnter"
    @blur="onChange($event.target.value); $forceUpdate()"
    :value="value"
    :disabled="disabled"
    :placeholder="col.nullable && row[col.name] === null ? '(none)' : null"
    :class="{ numeric: col.numeric }"
  />
  <div
    v-else-if="col.input_type === 'color'"
    class="color-wrapper"
  >
    <input
      class="input-color"
      :value="row[col.name]"
      :disabled="disabled"
      @click="showColorModal = true"
      readonly
      :style="colorStyles"
    />
    <ColorPickerModal
      v-if="showColorModal"
      @close="showColorModal = false"
      :value="row[col.name]"
      @change="onChange"
    />
  </div>
  <pretty-select v-else-if="col.input_type === 'select'"
    @change="val => onChange(val)"
    :options="selectData"
    :value="row[col.name]"
    :disabled="disabled"
    :editable="col.editable"
    :type="col.type"
    :type_id="col.name"
    :space_id="row.id"
  />
  <TextureSelect
    v-else-if="col.input_type === 'texture'"
    @change="val => onChange(val)"
    :value="row[col.name]"
    :disabled="disabled"
  />
</template>

<script>
import _ from 'lodash';
import TextureSelect from './TextureSelect.vue';
import ColorPickerModal from './Modals/ColorPickerModal.vue';
import { brightness } from '../utilities/color';

export default {
  name: 'GenericInput',
  props: ['col', 'row', 'onChange'],
  data() {
    return {
      showColorModal: false,
    };
  },
  methods: {
    blurOnEnter(evt) {
      if (evt.keyCode === 13) {
        //blur on enter
        this.$el.blur();
      }
      if (evt.keyCode == 27) {
        // reset then blur on esc
        this.$el.value = this.row[this.col.name];
        this.$el.blur();
      }
    },
    openColorModal() {
      colorPickerModalService.openModal(this.row[this.col.name], this.onChange);
    }
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
    colorStyles() {
      const value = this.row[this.col.name];

      if (!value || !value.slice) {
        return {
          color: '#fff',
          background: '#000',
        };
      }

      const
        r = parseInt(value.slice(1, 3), 16),
        g = parseInt(value.slice(3, 5), 16),
        b = parseInt(value.slice(5, 7), 16);
      return {
        color: brightness(r,g,b) < 123 ? '#fff' : '#000',
        background: value,
      };
    },
    value() {
      try {
        // `get` could not exist on `this.col` or could throw an error
        // Either way, catch the error and gracefully fall back
        return this.col.get(this.row, this.rootState);
      } catch (_) {
        return this.row[this.col.name];
      }
    },
  },
  components: {
    TextureSelect,
    ColorPickerModal,
  },
}

</script>

<style lang="scss" scoped>
@import "./../scss/config";
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
.color-wrapper input {
    max-width: 100%;
}
</style>
