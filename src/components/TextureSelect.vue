<!-- Floorspace.js, Copyright (c) 2016-2017, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <div class='input-select'>
    <button
      v-if='!disabled'
      :class="`texture-${value}`"
      @click="open = !open"
      @blur="open = false"
    >
      <span class="svg-background" />
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 14' height='10px'>
          <path d='M.5 0v14l11-7-11-7z' transform='translate(13) rotate(90)'></path>
      </svg>
    </button>
    <Portal v-if="open" to="texture-options">
      <ul :style="ulStyle()">
        <li
          v-for="texture in textures"
          :key="texture"
          :class="{
            [`texture-${texture}`]: true,
            selected: texture === value,
          }"
          @mousedown="choose(texture)"
        />
      </ul>
    </Portal>
  </div>
</template>

<script>
import Vue from 'vue';
import { Portal } from 'portal-vue';
import { textures } from '../store/modules/application/appconfig';
import _ from 'lodash';

export default {
  name: 'TextureSelect',
  props: ['value', 'label', 'disabled'],
  data() {
    return {
      open: false,
    };
  },
  computed: {
    textures() { return textures; },
  },
  methods: {
    choose(texture) {
      this.$emit('change', texture);
      this.open = false;
    },
    ulStyle() {
      const bb = this.$el && this.$el.getBoundingClientRect();
      if (!bb) return {};
      return {
        left: `${bb.left}px`,
        top: `${bb.top + bb.height - 17}px`,
        width: `${bb.width}px`,
      };
    },
  },
  components: {
    Portal,
  },
}

</script>

<style lang="scss" scoped>
@import "./../scss/config";
svg path {
  fill: $gray-medium;
  stroke: $gray-medium;
}
button {
  padding-top: 4px;
  padding-bottom: 4px;
  border-width: 1px;
  font-size: 11px;
  width: 100%;
  height: 20px;
}
.svg-background {
  background-color: white;
  height: 100%;
  width: 15px;
  position: absolute;
  right: 0;
  top: 0;
}
ul {
  pointer-events: all;
  position: absolute;
  list-style-type: none;
  background-color: white;
  padding-left: 0;
  width: 100%;
  z-index: 4;
  overflow-y: scroll;
  max-height: 120px;
}
li {
  border-top: 3px solid white;
  width: 100%;
  height: 20px;
  &:hover {
    background-color: #aaa;
  }
}
</style>
