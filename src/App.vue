<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->
<template>
    <div id="app"
      :class="`tool_${tool.toLowerCase()}`">
        <toolbar :class="{ 'disabled-component': tool === 'Map' }"></toolbar>

        <div id="layout-main">
            <navigation :class="{ 'disabled-component': tool === 'Map' }"></navigation>

            <main>
              <div id="alert-text" v-show="error || success" :class="{ error, success }">
                  <p>{{ error || success }}</p>
              </div>
                <canvas-view></canvas-view>
                <grid-view></grid-view>
            </main>
            <!-- <inspector-view></inspector-view> -->
        </div>
        <library :class="{ 'disabled-component': tool === 'Map' }"></library>
    </div>
</template>

<script>

import { mapState } from 'vuex';

// this import order is important, if the grid is loaded before the other elements or after the toolbar, it ends up warped
import Navigation from './components/Navigation.vue';
import Grid from './components/Grid/Grid.vue';
import Canvas from './components/Canvas/Canvas.vue';
import Toolbar from './components/Toolbar.vue';
import Inspector from './components/Inspector.vue';
import Library from './components/Library.vue';
import { Resize } from './components/Resize';


export default {
  name: 'app',
  data() {
    return {
      error: null,
      success: null,
    };
  },
  beforeCreate() {
    this.$store.dispatch('models/initStory');
  },
  mounted() {

    this.$on('uploadImage', (event) => {
      document.getElementById('upload-image-input').click();
    });
    // App will act as the eventBus for the application
    this.$on('error', (err) => {
      this.error = err;
      setTimeout(() => { this.error = null; }, 5000);
    });
    this.$on('success', (msg) => {
      this.success = msg;
      setTimeout(() => { this.success = null; }, 5000);
    });
    this.$on('reload-grid', () => {
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
    library: Library,
    navigation: Navigation,
    toolbar: Toolbar
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
