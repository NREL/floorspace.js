<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
    <nav id="toolbar">
        <section class="tools">
            <button @click="$emit('setBackground')" id="import">Import Background</button>
            <button @click="$emit('createObject')">Create Object</button>

            <button @click="exportData" id="export">Export Model</button>
        </section>

        <section class="settings">
            <template v-if="mode!=='3d'">
                <div class="input-number">
                    <label>min_x</label>
                    <input v-model.number.lazy="min_x">
                </div>
                <div class="input-number">
                    <label>min_y</label>
                    <input v-model.number.lazy="min_y">
                </div>
                <div class="input-number">
                    <label>max_x</label>
                    <input v-model.number.lazy="max_x">
                </div>
                <div class="input-number">
                    <label>max_y</label>
                    <input v-model.number.lazy="max_y">
                </div>

                <div class="input-number">
                    <label>x_spacing</label>
                    <input v-model.number.lazy="x_spacing">
                </div>
                <div class="input-number">
                    <label>y_spacing</label>
                    <input v-model.number.lazy="y_spacing">
                </div>

                <div class="input-checkbox">
                    <label>grid</label>
                    <input type="checkbox" v-model="gridVisible">
                </div>
            </template>

            <template v-if="mode==='3d'">
                <div class="input-number">
                    <label>Field Of View</label>
                    <input v-model.number="fov">
                </div>

                <div class="input-number">
                    <label>Film Offset</label>
                    <input v-model.number="filmOffset">
                </div>

                <div class="input-number">
                    <label>Zoom</label>
                    <input v-model.number="zoom">
                </div>
            </template>

            <div class="input-select" id="drawing-mode">
                <label>mode</label>
                <select v-model="mode">
                    <option v-for="mode in modes">{{ mode }}</option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 14" height="10px">
                    <path d="M.5 0v14l11-7-11-7z" transform="translate(13) rotate(90)"></path>
                </svg>
            </div>
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
            return data;
        }
    },
    computed: {
        ...mapState({ modes: state => state.application.modes }),
        gridVisible: {
            get () { return this.$store.state.project.grid.visible; },
            set (val) { this.$store.dispatch('project/setGridVisible', { visible: val }); }
        },
        mode: {
            get () { return this.$store.state.application.currentSelections.mode; },
            set (val) { this.$store.dispatch('application/setApplicationMode', { mode: val }); }
        },
        // spacing between gridlines, measured in RWU
        x_spacing: {
            get () { return this.$store.state.project.grid.x_spacing + ' ' + this.$store.state.project.config.units; },
            set (val) { this.$store.dispatch('project/setGridXSpacing', { x_spacing: val }); }
        },
        y_spacing: {
            get () { return this.$store.state.project.grid.y_spacing + ' ' + this.$store.state.project.config.units; },
            set (val) { this.$store.dispatch('project/setGridYSpacing', { y_spacing: val }); }
        },

        // mix_x, min_y, max_x, and max_y are the grid dimensions in real world units
        min_x: {
            get () { return this.$store.state.project.view.min_x + ' ' + this.$store.state.project.config.units; },
            set (val) { this.$store.dispatch('project/setViewMinX', { min_x: parseFloat(val) }); }
        },
        min_y: {
            get () { return this.$store.state.project.view.min_y + ' ' + this.$store.state.project.config.units; },
            set(val) { this.$store.dispatch('project/setViewMinY', { min_y: val }); }
        },
        max_x: {
            get () { return this.$store.state.project.view.max_x + ' ' + this.$store.state.project.config.units; },
            set (val) { this.$store.dispatch('project/setViewMaxX', { max_x: val }); }
        },
        max_y: {
            get () { return this.$store.state.project.view.max_y + ' ' + this.$store.state.project.config.units;  },
            set (val) { this.$store.dispatch('project/setViewMaxY', { max_y: val  }); }
        },

        zoom: {
            get () { return this.$store.state.project.view.zoom; },
            set (val) { this.$store.dispatch('project/setZoom', { zoom: val }); }
        },
        fov: {
            get () { return this.$store.state.project.view.fov; },
            set (val) { this.$store.dispatch('project/setFov', { fov: val }); }
        },
        filmOffset: {
            get () { return this.$store.state.project.view.filmOffset; },
            set (val) { this.$store.dispatch('project/setFilmOffset', { filmOffset: val }); }
        },
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
        &.tools {
            background-color: $gray-medium-dark;
            padding:0 2.5rem;
            > button {
                margin-right: 1rem;
            }
            #export {
                border: 1px solid $primary;
                position: absolute;
                right: 2.5rem;
            }
        }
        &.settings {
            background-color: $gray-medium-light;
            div:first-child {
                margin-left: 5rem;
            }
            .input-checkbox, .input-number {
                margin-left: 1rem;
            }
        }

        >div {
            margin: 0 1rem 0 0;
            &#drawing-mode {
                position: absolute;
                right: 5rem;
                width: 8.5rem
            }
        }
    }
}
</style>
