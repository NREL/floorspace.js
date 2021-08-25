<!-- Floorspace.js, Copyright (c) 2016-2017, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
    <ModalBase
      class="save-as-modal"
      :title="`Move Selected Space`"
      @close="$emit('close')"
    >
      <div>
        <p v-if="this.currentSpace" >{{this.currentSpace.name}}</p>
        <i>Adjust from the upperleft X/Y</i>
        <div>
          <label>X: </label>
          <input type="number" v-model="x_offset" />
          <label>Y: </label>
          <input type="number" v-model="y_offset" />
          <button @click="save">Save</button>
        </div>
      </div>
    </ModalBase>
</template>

<script>
import ModalBase from './ModalBase.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'MoveSpaceModal',
  props: [],
  data() {
    return {
      updateXTo: 0,
      updateYTo: 0,
      currentFace: undefined,
    };
  },
  mounted() {
    if (this.currentStoryDenormalizedGeom.vertices.length > 0) { 
      const currentFace = this.currentStoryDenormalizedGeom.faces.find(face => face.id === this.currentSpace.face_id);
      this.currentFace = currentFace;
      this.updateXTo = currentFace.edges[0].v1.x;
      this.updateYTo = currentFace.edges[0].v1.y;
    }
  },
  computed: {
    ...mapGetters({
      currentSpace: 'application/currentSpace',
      currentStoryDenormalizedGeom: 'application/currentStoryDenormalizedGeom',
    }),
    x_offset: {
      get() { return this.updateXTo },
      set(val) { this.updateXTo = val; },
    },
    y_offset: {
      get() { return this.updateYTo },
      set(val) { this.updateYTo = val; },
    },
  },
  methods: {
    save() {
      // determine diff of movement
      const xOffset = parseInt(this.updateXTo, 10) - this.currentFace.edges[0].v1.x;
      const yOffset = parseInt(this.updateYTo, 10) - this.currentFace.edges[0].v1.y;
      this.$store.dispatch('geometry/moveFaceByOffset', {
        face_id: this.currentFace.id,
        dx: xOffset,
        dy: yOffset
      });
      this.$emit('close');
    },
  },
  components: {
    ModalBase,
  },
}
</script>

<style lang="scss" scoped>
@import "./../../scss/config";


</style>