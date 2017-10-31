<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <ModalBase
    class="ground-props-modal"
    title="Ground Properties"
    @close="$emit('close')"
  >
    <div class="ground-properties">
      <p><label class="input-text">Floor Offset <input type="text" v-model="floor_offset" /></label></p>
      <p><label class="input-text">Asimuth Angle <input type="text" v-model="azimuth_angle" /></label></p>
      <p><label class="input-text">Tilt Angle <input type="text" v-model="tilt_angle" /></label></p>
      <p><label class="input-text">x-shift <input type="text" v-model="x_shift" /></label></p>
      <p><label class="input-text">y-shift <input type="text" v-model="y_shift" /></label></p>
      <button class="button" @click="$emit('close')">Okay</button>
    </div>
  </ModalBase>
</template>
<script>
import { mapState } from 'vuex';
import ModalBase from './ModalBase.vue';

export default {
  name: 'GroundProperties',
  computed: {
    ...mapState({
        ground: state => state.project.config.ground,
    }),
    floor_offset: {
      get() { return this.ground.floor_offset; },
      set(val) { this.$store.dispatch('project/modifyGround', { key: 'floor_offset', val }); },
    },
    azimuth_angle: {
      get() { return this.ground.azimuth_angle; },
      set(val) { this.$store.dispatch('project/modifyGround', { key: 'azimuth_angle', val }); },
    },
    tilt_angle: {
      get() { return this.ground.tilt_angle; },
      set(val) { this.$store.dispatch('project/modifyGround', { key: 'tilt_angle', val }); },
    },
    x_shift: {
      get() { return this.ground.x_shift; },
      set(val) { this.$store.dispatch('project/modifyGround', { key: 'x_shift', val }); },
    },
    y_shift: {
      get() { return this.ground.y_shift; },
      set(val) { this.$store.dispatch('project/modifyGround', { key: 'y_shift', val }); },
    },
  },
  components: {
    ModalBase,
  },
}
</script>
<style lang="scss">
@import "./../../scss/config";
.ground-props-modal .modal {
  width: 260px;
}

.ground-properties {
  margin: 0 auto;
  width: 180px;
  input {
    height: 20px;
    font-size: 16px;
    margin-left: auto;
    width: 30px;
  }

}

</style>
