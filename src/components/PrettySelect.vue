<!-- Floorspace.js, Copyright (c) 2016-2017, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <div class='input-select'>
      <label v-if="label">{{ label }}</label>
      <select @change="handleInput" :disabled="disabled">
          <option v-for='opt in normalizedOpts' :value="opt.val" :selected="opt.val === value">{{ opt.display }}</option>
      </select>
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 14' height='10px'>
          <path d='M.5 0v14l11-7-11-7z' transform='translate(13) rotate(90)'></path>
      </svg>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  name: 'PrettySelect',
  props: ['options', 'value', 'label', 'disabled', 'editable', 'space_id', 'type', 'type_id'],
  computed: {
    normalizedOpts() {
      const attachEditable = (arr) => {
        if (this.editable) {
          return [...arr, {
            val: 'Create New',
            display: 'Create New',
          }];
        } else {
          return arr;
        }
      }

      if (_.isArray(this.options)) {
        if (!this.options.length) {
          return attachEditable([]);
        }
        if (_.has(this.options[0], 'val') && _.has(this.options[0], 'display')) {
          return attachEditable(this.options);
        }
        if (_.isString(this.options[0])) {
          return attachEditable(this.options.map(o => ({ val: o, display: o })));
        }
      }
      console.warn('unrecognized options structure', this.options);
      return this.options;
    }
  },
  methods: {
    handleInput(event) {
      if (event.target.value === 'Create New') {
        event.stopPropagation();
        event.preventDefault();

        this.$store.dispatch('models/createObjectWithTypeAndSelect', {
          type: this.type,
          type_id: this.type_id,
          space_id: this.space_id,
        });
      } else {
        this.$emit('change', event.target.value);
      }
    },
  }
}

</script>

<style lang="scss" scoped>
@import "./../scss/config";
select {
  padding-top: 4px;
  padding-bottom: 4px;
  border-width: 1px;
  font-size: 11px;
  option {
    padding-left: 2px;
    padding-right: 2px;
  }
}
</style>
