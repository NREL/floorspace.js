<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
    <nav id="toolbar">
        <section class="settings">

            <div class="input-checkbox">
                <label>Story Below</label>
                <input type="checkbox" v-model="previousStoryVisible">
            </div>

            <div v-if="mapEnabled" class="input-checkbox">
                <label>map</label>
                <input type="checkbox" v-model="mapVisible">
            </div>

            <div class="input-checkbox">
                <label>grid</label>
                <input type="checkbox" v-model="gridVisible">
            </div>

            <div class="input-number">
                <label>spacing</label>
                <input v-model.number.lazy="spacing">
            </div>

            <div id="import-export">
                <input ref="importLibrary" @change="importLibraryAsFile" type="file"/>
                <button @click="$refs.importLibrary.click()">Import Library</button>
                <input ref="importInput" @change="importModelAsFile" type="file"/>
                <button @click="$refs.importInput.click()" id="import">Open Floorplan</button>
                <button @click="exportData" id="export">Save Floorplan</button>
            </div>

        </section>

        <section class="tools">
            <button @click="tool = item" :class="{ active: tool === item }" v-for="item in availableTools">{{ item }}</button>
        </section>

    </nav>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'toolbar',
    data: function() {
        return {};
    },
    methods: {
        exportData () {
            const data = this.$store.getters['exportData'];
            console.log(data);

            const a = document.createElement('a');
            a.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data)));
            a.setAttribute("download", "floorplan.json");
            a.click();

            return data;
        },
        importModelAsFile (event) {
            const file = event.target.files[0],
                reader = new FileReader();
            reader.addEventListener("load", () => {
                this.importModel(reader.result);
            }, false);

            if (file) { reader.readAsText(file); }
        },
        importLibraryAsFile (event) {
            const file = event.target.files[0],
                reader = new FileReader();


            reader.addEventListener("load", () => {
              try {
                  this.$store.dispatch('importLibrary', {
                      data: JSON.parse(reader.result)
                  });
              } catch (e) {
                window.eventBus.$emit('error', 'Invalid JSON');
              }
            }, false);

            if (file) { reader.readAsText(file); }
        },
        importModel (data) {
          try {
            this.$store.dispatch('importModel', {
              clientWidth: document.getElementById('svg-grid').clientWidth,
              clientHeight: document.getElementById('svg-grid').clientHeight,
              data: JSON.parse(data)
            });
          } catch (e) {
            window.eventBus.$emit('error', 'Invalid JSON');
          }

        },
        checkTool () {
            // only allow dragging in images mode
            if (this.tool === 'Drag' && this.currentMode !== 'images') {
                this.tool = 'Rectangle';
            }
        }
    },
    computed: {
        ...mapState({
            currentMode: state => state.application.currentSelections.mode,
            mapEnabled: state => state.project.map.enabled
        }),
        availableTools () {
            return this.$store.state.application.tools
            .filter((t) => {
                if (t === 'Rectangle' || t === 'Polygon' || t === 'Eraser' || t === 'Select') {
                    // only allow drawing tools in space and shade mode
                    return (this.currentMode === 'spaces' || this.currentMode === 'shading');
                } else if ( t === 'Drag') {
                    // only allow dragging in image mode
                    return (this.currentMode === 'images');
                }  else if ( t === 'Fill') {
                    // only allow cloning in space and shade mode if previousStoryVisible
                    return this.previousStoryVisible && (this.currentMode === 'spaces' || this.currentMode === 'shading');
                } else {
                    return true;
                }
            })
            // never display the map tool, it is only used when the map is initialized
            .filter(t => t !== 'Map');
        },

        gridVisible: {
            get () { return this.$store.state.project.grid.visible; },
            set (val) { this.$store.dispatch('project/setGridVisible', { visible: val }); }
        },
        mapVisible: {
            get () { return this.$store.state.project.map.visible; },
            set (val) { this.$store.dispatch('project/setMapVisible', { visible: val }); }
        },
        previousStoryVisible: {
            get () { return this.$store.state.project.previous_story.visible; },
            set (val) { this.$store.dispatch('project/setPreviousStoryVisible', { visible: val }); }
        },
        tool: {
            get () { return this.$store.state.application.currentSelections.tool; },
            set (val) { this.$store.dispatch('application/setApplicationTool', { tool: val }); }
        },

        // spacing between gridlines, measured in RWU
        spacing: {
            get () { return this.$store.state.project.grid.spacing + ' ' + this.$store.state.project.config.units; },
            set (val) { this.$store.dispatch('project/setSpacing', { spacing: val }); }
        }
    },
    watch: {
        tool () { this.checkTool(); },
        currentMode () { this.checkTool(); }
    }
}
</script>

<style lang="scss" scoped>
@import "./../scss/config";

#toolbar {
    section {
        align-items: center;
        display: flex;
        height: 2.5rem;
        padding:0 2.5rem;
        &.settings {
            background-color: $gray-medium-dark;
            text-align: right;
            #modal-buttons {
                margin-right: 2rem;
            }

            #import-export {
                position: absolute;
                right: 2.5rem;
                #import {
                    margin-right: 1rem;
                    border: 1px solid $secondary;
                }
                #export {
                    border: 1px solid $primary;
                }
            }

            input[type="file"], input[type="text"], {
                position: absolute;
                visibility: hidden;
            }
        }
        &.tools {
            background-color: $gray-medium-light;
            justify-content: flex-end;
        }

        >div, >button {
            margin: 0 1rem 0 0;
            &.active {
                border: 1px solid $primary;
            }
        }
    }
}
</style>
