<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<aside>
    <div @click="$emit('close')" class="overlay"></div>
    <div class="modal">
        <header>
            <h2>Quick Start</h2>
        </header>

        <div class="content">
            <p>Choose to either open an existing floorplan, start a new floorplan without a map, or start a new floorplan with a geolocated map.</p>

            <button @click="$refs.importInput.click()" id="import" class="open-floorplan">Open Floorplan</button>
            <button @click="mapEnabled = false; mapVisible = false; $emit('close')" class="new-floorplan">New Floorplan</button>
            <button @click="mapEnabled = true; tool='Map'; $emit('close')" :disabled="!online">New Floorplan w/ Map</button>
            <input id="importInput" ref="importInput" @change="importFloorplanAsFile" type="file"/>
        </div>
    </div>
</aside>
</template>

<script>

export default {
  name: 'MapModal',
  data() {
    return {
      address: '',
    };
  },
  computed: {
    online () { return window.api && window.api.config ? window.api.config.online : true; },
    mapEnabled: {
      get() { return this.$store.state.project.map.enabled; },
      set(enabled) {
        this.$store.dispatch('project/setMapEnabled', { enabled });
        // enable timetravel if map is disabled
        if (!enabled) { window.eventBus.$emit('initTimetravel'); }
      },
    },
    tool: {
      get() { return this.$store.state.application.currentSelections.tool; },
      set(val) { this.$store.dispatch('application/setCurrentTool', { tool: val }); },
    },
  },
  methods: {
    importFloorplanAsFile(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        this.importFloorplan(reader.result);
      }, false);

      if (file) { reader.readAsText(file); }
    },
    importFloorplan(data) {
      this.$store.dispatch('importFloorplan', {
        clientWidth: document.getElementById('svg-grid').clientWidth,
        clientHeight: document.getElementById('svg-grid').clientHeight,
        data: JSON.parse(data),
      });
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./../../scss/config";
.content {
    margin: 0 2rem 2rem 2rem;
    text-align: center;

    button {
        margin: 1rem .5rem;
    }

    input[type=file] {
        display: none;
    }
}

.modal {
    width: 30rem;
}

</style>
