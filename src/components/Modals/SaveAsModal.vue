<!-- Floorspace.js, Copyright (c) 2016-2017, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <ModalBase
    class="save-as-modal"
    :title="`Save Floorplan As`"
    @close="$emit('close')"
  >
    <div class="grid-container">
      <div v-if="enable3DPreview" class="export-label">Export Format:</div>
      <div v-if="enable3DPreview" class="export-input">
        <input
          type="radio"
          id="export-input-floorspace"
          value="floorspace"
          v-model="exportType"
        />
        <label for="export-input-floorspace">Floorspace.js</label>
        <input
          type="radio"
          id="export-input-threejs"
          value="threejs"
          v-model="exportType"
        />
        <label for="export-input-threejs">ThreeJS</label>
      </div>
      <div class="filename-label">Filename:</div>
      <div class="filename-input">
        <input
          ref="downloadName"
          type="text"
          id="download-name"
          @keyup.enter="downloadFile"
          value="floorplan"
          spellcheck="false"
        />
      </div>
      <button class="download-button" @click="downloadFile">Download</button>
    </div>
  </ModalBase>
</template>

<script>
import ModalBase from "./ModalBase.vue";

export default {
  name: "SaveAsModal",
  props: [],
  mounted() {
    this.$refs.downloadName.focus();
  },
  computed: {
    enable3DPreview: {
      get() {
        return this.$store.state.project.preview3D.enabled;
      },
    },
  },
  data() {
    return {
      exportType: "floorspace",
    };
  },
  methods: {
    downloadFile: function () {
      const a = document.createElement("a");
      const data = JSON.stringify(this.$store.getters["exportData"]);
      this.$emit("close");

      let blobData = data;
      if (this.exportType !== "floorspace") {
        blobData = Module.floorplanToThreeJS(data, false);
      }

      const blob = new Blob([blobData], {
        type: "text/json;charset=utf-8",
      });
      a.setAttribute("href", URL.createObjectURL(blob));
      a.setAttribute("download", this.$refs.downloadName.value + ".json");
      a.click();

      console.log(`exported data for: ${this.exportType}`); // eslint-disable-line
    },
  },
  components: {
    ModalBase,
  },
};
</script>

<style lang="scss" scoped>
@import "./../../scss/config";

.save-as-modal {
  .grid-container {
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto 100fr;
    row-gap: 6px;
  }

  .export-label {
    grid-column: 1;
    grid-row: 1;
    justify-self: start;
  }

  .export-input {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
  }

  .filename-label {
    grid-column: 1;
    grid-row: 2;
    justify-self: start;
  }

  .filename-input {
    display: inline-block;
    grid-column: 2;
    grid-row: 2;
    justify-self: end;
    position: relative;
  }

  .filename-input > input {
    padding-right: 35px;
    text-align: right;
  }

  .filename-input::after {
    content: ".json";
    font-size: 12px;
    pointer-events: none;
    position: absolute;
    right: 5px;
    top: 4px;
  }

  .download-button {
    align-self: end;
    cursor: pointer;
    grid-row: 3;
    grid-column: 2;
    justify-self: end;
    text-transform: uppercase;
  }
}
</style>
