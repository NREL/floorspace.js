<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <input v-if="editable"
    @keydown="blurOnEnter"
    @blur="onChange($event.target.value)"
    :value="row[col.name]"
    v-focus-pls="focus"
  />
  <span v-else>{{row[col.name]}}</span>
  <!-- <div>
    <input v-else-if="col.input_type === 'color'"
       class="input-color"
       :object-id="row.id"
       :value="row[col.name]"
    />
  </div>

  <pretty-select v-else-if="col.input_type === 'select'"
    :onChange="onChange.bind(null, row.id, col.name)"
    :options="_.toPairs(col.select_data(row, rootState)).map(([k, v]) => ({ val: v, display: k }))"
    :value="row[col.name]"
  /> -->
</template>

<script>
import _ from 'lodash';

export default {
  name: 'GenericInput',
  props: ['col', 'row', 'onChange', 'editable', 'focus'],
  methods: {
    blurOnEnter(evt) {
      if (evt.keyCode === 13) {
        //blur on enter
        this.$el.blur();
        this.$emit('finishedEditing');
      }
      if (evt.keyCode == 27) {
        // reset then blur on esc
        this.$el.value = row[col.name];
        this.$el.blur();
        this.$emit('finishedEditing');
      }
      return;
    },
  },
  // mounted() {
  //   this.configurePickers();
  // },
  // configurePickers() {
  //   const inputs = this.$el.querySelectorAll('.input-color');
  //   for (let i = 0; i < inputs.length; i++) {
  //     // TODO use a forEach instead so that this doesn't fail because it's not
  //     // closing over i;
  //     const
  //       objectId = inputs[i].getAttribute('data-object-id'),
  //       colName = inputs[i].getAttribute('data-column');
  //
  //
  //     this.huebs[objectId] = new Huebee(inputs[i], { saturations: 1 });
  //     this.huebs[objectId].handler = (color) => {
  //       this.onChange(objectId, colName, color);
  //     };
  //     this.huebs[objectId].on('change', this.huebs[objectId].handler);
  //   }
  // },
  directives: {
    'focus-pls': {
      inserted: function(el, binding) {
        if (binding.value) {
          el.focus();
        }
      },
    },
  },
}

</script>

<style lang="scss" scoped>
@import "./../scss/config";
</style>
