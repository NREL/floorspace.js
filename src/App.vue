<!-- Floorspace.js, Copyright (c) 2016-2017, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->
<template>
    <div id="app"
      :class="`tool_${tool.toLowerCase()}`">
        <toolbar :class="{ 'disabled-component': tool === 'Map' }"></toolbar>

        <div id="layout-main" :class="{ 'nav-on-top': navigationExpanded }">
            <navigation
              :class="{ 'disabled-component': tool === 'Map' }"
              @expanded="(val) => { navigationExpanded = val; }"
            ></navigation>

            <main>
              <div id="alert-text" v-show="error || success" :class="{ error, success }">
                  <p>{{ error || success }}</p>
              </div>
                <canvas-view></canvas-view>
                <grid-view></grid-view>
            </main>
            <!-- <inspector-view></inspector-view> -->
        </div>
        <ImageUpload />
        <Textures />
        <PortalTarget name="texture-options" />
        <PortalTarget name="color-picker" />
    </div>
</template>

<script>

import { mapState } from 'vuex';
import { PortalTarget } from 'portal-vue';

// this import order is important, if the grid is loaded before the other elements or after the toolbar, it ends up warped
import Navigation from './components/Navigation.vue';
import Grid from './components/Grid/Grid.vue';
import Canvas from './components/Canvas/Canvas.vue';
import Toolbar from './components/Toolbar.vue';
import ImageUpload from './components/ImageUpload.vue';
import ColorPickerModal from './components/Modals/ColorPickerModal.vue';
import Inspector from './components/Inspector.vue';
import Textures from './components/Textures.vue';


export default {
  name: 'app',
  data() {
    return {
      error: null,
      success: null,
      navigationExpanded: false,
    };
  },
  beforeCreate() {
    this.$store.dispatch('models/initStory');
  },
  mounted() {

    window.eventBus.$on('error', (err) => {
      this.error = err;
      setTimeout(() => { this.error = null; }, 5000);
    });
    window.eventBus.$on('success', (msg) => {
      this.success = msg;
      setTimeout(() => { this.success = null; }, 5000);
    });
    window.eventBus.$on('reload-grid', () => {
      // This is unfortunate. oh well.
      document.getElementById('svg-grid')
        .dispatchEvent(new Event('reloadGrid'));
    });

    document.addEventListener('keydown', (e) => {
      if (!this.$store.timetravel){
        return;
      }
      if (e.keyCode === 90 && (e.ctrlKey || e.metaKey)) {
        e.shiftKey ? this.$store.timetravel.redo() : this.$store.timetravel.undo();
        e.preventDefault();
      } else if (e.keyCode == 89 && (e.ctrlKey || e.metaKey)){
        this.$store.timetravel.redo();
        e.preventDefault();
      }
    });
  },

  computed: {
    ...mapState({ tool: state => state.application.currentSelections.tool }),
  },
  components: {
    'grid-view': Grid,
    'canvas-view': Canvas,
    'inspector-view': Inspector,
    navigation: Navigation,
    toolbar: Toolbar,
    ImageUpload,
    Textures,
    PortalTarget,
    ColorPickerModal,
  },
};
</script>

<style src="./scss/main.scss" lang="scss"></style>
<style lang="scss" scoped>
@import "./scss/config";
.tool_rectangle, .tool_polygon, .tool_eraser {
  #grid {
    cursor: crosshair;
  }
}
.tool_drag {
  cursor: move;
}
#alert-text {
    position: absolute;
    top: 1rem;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 3;

    p {
        color: $white;
        padding: 2px 4px;
        margin: 10px;
        border: 2px solid $gray-darkest;
        display: inline-block;
    }
    &.success p {
      background: $primary;
    }
    &.error p {
      background: $secondary;
    }
}

</style>
