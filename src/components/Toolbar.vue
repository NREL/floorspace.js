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
            <a>{{ mode }}</a>
        </section>

        <section class="settings">
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
    computed: {
        ...mapState({ modes: state => state.application.modes }),
        mode: {
            get () { return this.$store.state.application.currentSelections.mode; },
            set (newValue) {
                this.$store.dispatch('setRenderMode', {
                    mode: newValue
                });
            }
        },
        // spacing between gridlines, measured in RWU
        x_spacing: {
            get() {
                return this.$store.state.project.config.x_spacing + ' ' + this.$store.state.project.config.units;
            },
            set(newValue) {
                this.$store.commit('setGridXSpacing', {
                    x_spacing: newValue
                });
            }
        },
        y_spacing: {
            get() {
                return this.$store.state.project.config.y_spacing + ' ' + this.$store.state.project.config.units;
            },
            set(newValue) {
                this.$store.commit('setGridYSpacing', {
                    y_spacing: newValue
                });
            }
        },

        // mix_x, min_y, max_x, and max_y are the grid dimensions in real world units
        min_x: {
            get() {
                return this.$store.state.project.view.min_x + ' ' + this.$store.state.project.config.units;
            },
            set(newValue) {
                this.$store.commit('setViewMinX', {
                    min_x: parseFloat(newValue)
                });
            }
        },
        min_y: {
            get() {
                return this.$store.state.project.view.min_y + ' ' + this.$store.state.project.config.units;
            },
            set(newValue) {
                this.$store.commit('setViewMinY', {
                    min_y: newValue
                });
            }
        },
        max_x: {
            get() {
                return this.$store.state.project.view.max_x + ' ' + this.$store.state.project.config.units;
            },
            set(newValue) {
                this.$store.commit('setViewMaxX', {
                    max_x: newValue
                });
            }
        },
        max_y: {
            get() {
                return this.$store.state.project.view.max_y + ' ' + this.$store.state.project.config.units;
            },
            set(newValue) {
                this.$store.commit('setViewMaxY', {
                    max_y: newValue
                });
            }
        }
    }
}
</script>

<style lang="scss" scoped>
@import "./../scss/config";

#toolbar {
    border-bottom: 1px solid $gray-darkest;
    section {
        align-items: center;
        display: flex;
        height: 2.5rem;
        width: 100%;
        &.tools {
            background-color: $gray-medium-dark;
        }
        &.settings {
            background-color: $gray-medium-light;
            div:first-child {
                margin-left: 5rem;
            }
        }

        >div {
            margin: 0 1rem 0 0;

            &#drawing-mode {
                right: 5rem;
                position: absolute;
                > select {
                    width: 8.5rem;
                }
            }

        }

    }
}
</style>
