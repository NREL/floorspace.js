<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<section id="inspector">
    <section class="tabs">
        <span :class="{ active: tab === 'attributes' }" @click="tab = 'attributes'">Attributes</span>
        <span :class="{ active: tab === 'components' }" @click="tab = 'components'">Components</span>
        <span :class="{ active: tab === 'geometry' }" @click="tab = 'geometry'">Geometry</span>
    </section>

    <section v-if="tab === 'geometry'" id="geometry-list" class="list">
        <template v-if="!currentSpace && !currentShading" v-for="face in currentStoryGeometry.faces">
            <header>
                <h3>Face {{face.id}}</h3>
            </header>
            <div v-for="edgeRef in face.edgeRefs" class="list-item">
                edge {{ edgeRef.edge_id }} {{ edgeRef.reverse ? 'reversed ' : '' }} {{ edgeForId(edgeRef.edge_id).isShared(currentStoryGeometry) ? 'shared' : '' }}
                <br>startpoint {{ startpoint(edgeRef) }}
                <br>endpoint {{ endpoint(edgeRef) }}
            </div>
        </template>

        <template v-if="currentSelectionsFace">
            <header>
                <h3>Face {{currentSelectionsFace.id}} on {{ currentSpace ? currentSpace.name : currentShading.name }}</h3>
            </header>
            <div v-for="edgeRef in currentSelectionsFace.edgeRefs" class="list-item">
                edge {{ edgeRef.edge_id }} {{ edgeRef.reverse ? 'reversed ' : '' }} {{ edgeForId(edgeRef.edge_id).isShared(currentStoryGeometry) ? 'shared' : '' }}
                <br>startpoint {{ startpoint(edgeRef) }}
                <br>endpoint {{ endpoint(edgeRef) }}
            </div>
        </template>
    </section>

    <section v-if="tab === 'attributes'" id="attributes-list" class="list">
        <template v-if="!currentSpace && !currentShading">
            <h3>{{ currentStory.name }}</h3>

            <label>name</label>
            <div class="input-text">
                <input :value="currentStory.name" @change="updatecurrentStory('name', $event)">
            </div>

            <label>below_floor_plenum_height</label>
            <div class="input-text">
                <input :value="currentStory.below_floor_plenum_height" @change="updatecurrentStory('below_floor_plenum_height', $event)">
            </div>

            <label>floor_to_ceiling_height</label>
            <div class="input-text">
                <input :value="currentStory.floor_to_ceiling_height" @change="updatecurrentStory('floor_to_ceiling_height', $event)">
            </div>

            <label>multiplier</label>
            <div class="input-text">
                <input :value="currentStory.multiplier" @change="updatecurrentStory('multiplier', $event)">
            </div>
        </template>

        <template v-if="currentSpace">
            <h3>{{ currentSpace.name }}</h3>

            <label>name</label>
            <div class="input-text">
                <input :value="currentSpace.name" @change="updatecurrentSpace('name', $event)">
            </div>
        </template>

        <template v-if="currentShading">
            <h3>{{ currentShading.name }}</h3>
            <label>name</label>
            <div class="input-text">
                <input :value="currentShading.name" @change="updatecurrentShading('name', $event)">
            </div>
        </template>
    </section>

    <section v-if="tab === 'components'" id="components-list" class="list">
        <template v-if="!currentSpace && !currentShading">
            <header>
                <h3>{{ currentStory.name }}</h3>
            </header>
            <div class="list-item">
                <h4>Windows</h4>
                <div v-for="(window, index) in currentStory.windows">
                    <span v-for="(val, key) in window">
                        {{ key }}: {{ val }}
                    </span>

                    <svg @click="destroyWindow(index)" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                        <path d="M137.05 128l75.476-75.475c2.5-2.5 2.5-6.55 0-9.05s-6.55-2.5-9.05 0L128 118.948 52.525 43.474c-2.5-2.5-6.55-2.5-9.05 0s-2.5 6.55 0 9.05L118.948 128l-75.476 75.475c-2.5 2.5-2.5 6.55 0 9.05 1.25 1.25 2.888 1.876 4.525 1.876s3.274-.624 4.524-1.874L128 137.05l75.475 75.476c1.25 1.25 2.888 1.875 4.525 1.875s3.275-.624 4.525-1.874c2.5-2.5 2.5-6.55 0-9.05L137.05 128z"/>
                    </svg>
                </div>
                <button @click="assignObject('windows', currentStory)">Add Window</button>
            </div>
        </template>

        <template v-if="currentSpace">
            <header>
                <h3>{{ currentSpace.name }}</h3>
            </header>

            <div class="list-item">
                <h4>Daylighting Controls</h4>
                <div v-for="(daylighting_control, index) in currentSpace.daylighting_controls">
                    <span v-for="(val, key) in daylighting_control">
                        {{ key }}: {{ val }}
                    </span>

                    <svg @click="destroyDaylightingControl(index)" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                        <path d="M137.05 128l75.476-75.475c2.5-2.5 2.5-6.55 0-9.05s-6.55-2.5-9.05 0L128 118.948 52.525 43.474c-2.5-2.5-6.55-2.5-9.05 0s-2.5 6.55 0 9.05L118.948 128l-75.476 75.475c-2.5 2.5-2.5 6.55 0 9.05 1.25 1.25 2.888 1.876 4.525 1.876s3.274-.624 4.524-1.874L128 137.05l75.475 75.476c1.25 1.25 2.888 1.875 4.525 1.875s3.275-.624 4.525-1.874c2.5-2.5 2.5-6.55 0-9.05L137.05 128z"/>
                    </svg>
                </div>
                <button @click="assignObject('daylighting_controls', currentSpace)">Add {{ displayTypeForType('daylighting_controls') }}</button>
            </div>
            <div class="list-item">
                <h4>{{ displayTypeForType('building_units') }}</h4>
                <span v-for="(val, key) in getComponent(currentSpace.building_unit_id, 'building_units')">
                    {{ key }}: {{ val }}
                </span>
                <button @click="assignObject('building_units', currentSpace)">Add {{ displayTypeForType('building_units') }}</button>
            </div>
            <div class="list-item">
                <h4>{{ displayTypeForType('thermal_zones') }}</h4>
                <span v-for="(val, key) in getComponent(currentSpace.thermal_zone_id, 'thermal_zones')">
                    {{ key }}: {{ val }}
                </span>
                <button @click="assignObject('thermal_zones', currentSpace)">Add {{ displayTypeForType('thermal_zones') }}</button>
            </div>
            <div class="list-item">
                <h4>{{ displayTypeForType('space_types') }}</h4>
                <span v-for="(val, key) in getComponent(currentSpace.building_unit_id, 'space_types')">
                    {{ key }}: {{ val }}
                </span>
                <button @click="assignObject('space_types', currentSpace)">Add {{ displayTypeForType('space_types') }}</button>
            </div>
            <div class="list-item">
                <h4>{{ displayTypeForType('construction_sets') }}</h4>
                <span v-for="(val, key) in getComponent(currentSpace.construction_set_id, 'construction_sets')">
                    {{ key }}: {{ val }}
                </span>
                <button @click="assignObject('construction_sets', currentSpace)">Add {{ displayTypeForType('construction_sets') }}</button>
            </div>

        </template>

        <template v-if="currentShading">
            <h3>{{ currentShading.name }}</h3>
        </template>
    </section>
</section>
</template>

<script>

import { mapState } from 'vuex'
import helpers from './../store/modules/geometry/helpers'
const map = {
    building_units: {
        displayName: 'Building Unit'
    },
    thermal_zones: {
        displayName: 'Thermal Zone'
    },
    space_types: {
        displayName: 'Space Type'
    },
    construction_sets: {
        displayName: 'Construction Set'
    },
    constructions: {
        displayName: 'Construction'
    },
    windows: {
        displayName: 'Window'
    },
    daylighting_controls: {
        displayName: 'Daylighting Control'
    }
};

export default {
    name: 'inspector',
    data() {
        return {
            tab: 'attributes',
            geometryInspector: true,
            storyInspector: false
        }
    },
    methods: {
        destroyWindow (index) {
            const windowsCopy = this.currentStory.windows.slice();
            windowsCopy.splice(index, 1);

            this.$store.dispatch('models/updateStoryWithData', {
                story: this.currentStory,
                windows: windowsCopy
            });
        },
        destroyDaylightingControl(index) {
            const daylightingControlsCopy = this.currentSpace.daylighting_controls.slice();
            daylightingControlsCopy.splice(index, 1);
            this.$store.dispatch('models/updateSpaceWithData', {
                space: this.currentSpace,
                daylighting_controls: daylightingControlsCopy
            });
        },
        getComponent (id, type) { return this.library[type].find(c => c.id === id); },
        displayTypeForType (type) { return map[type].displayName; },
        startpoint (edgeRef) {
            const edge = this.edgeForId(edgeRef.edge_id);
            if (edgeRef.reverse) {
                const vertex = this.vertexForId(edge.v2);
                return 'v2 ' + vertex.id + ' (' + vertex.x + ',' + vertex.y + ')';
            } else {
                const vertex = this.vertexForId(edge.v1);
                return 'v1 ' + vertex.id + ' (' + vertex.x + ',' + vertex.y + ')';
            }
        },
        endpoint (edgeRef) {
            const edge = this.edgeForId(edgeRef.edge_id);
            if (!edgeRef.reverse) {
                const vertex = this.vertexForId(edge.v2);
                return vertex.id + ' (v2) ' + ' (' + vertex.x + ',' + vertex.y + ')';
            } else {
                const vertex = this.vertexForId(edge.v1);
                return vertex.id + ' (v1) ' + ' (' + vertex.x + ',' + vertex.y + ')';
            }
        },
        edgeForId (edge_id) { return helpers.edgeForId(edge_id, this.currentStoryGeometry); },
        vertexForId (vertex_id) {
            const vertex = helpers.vertexForId(vertex_id, this.currentStoryGeometry);
            return vertex;
        },
        updatecurrentStory (key, event) {
            var payload = { story: this.currentStory };
            payload[key] = event.target.value;
            // required to prevent input field value from containing incorrect data
            event.target.value = this.currentStory[key];
            this.$store.dispatch('models/updateStoryWithData', payload);
        },
        updatecurrentSpace (key, event) {
            var payload = { space: this.currentSpace };
            payload[key] = event.target.value;
            // required to prevent input field value from containing incorrect data
            event.target.value = this.currentSpace[key];
            this.$store.dispatch('models/updateSpaceWithData', payload);
        },
        updatecurrentShading (key, event) {
            var payload = { shading: this.currentShading };
            payload[key] = event.target.value;
            // required to prevent input field value from containing incorrect data
            event.target.value = this.currentShading[key];
            this.$store.dispatch('models/updateShadingWithData', payload);
        },
        assignObject (type, target) {
            this.$emit('assignObject', {
                type: type,
                target: target
            });
        }
    },
    computed: {
        currentSelectionsFace () { return this.$store.getters['application/currentSelectionsFace']; },
        currentStoryGeometry () { return this.$store.getters['application/currentStoryGeometry']; },
        ...mapState({
            currentStory: state => state.application.currentSelections.story,
            currentSpace: state => state.application.currentSelections.space,
            currentShading: state => state.application.currentSelections.shading,

            library: state => state.models.library
        })
    },
}
</script>

<style lang="scss" scoped>
@import "./../scss/config";
    #inspector {
        background-color: $gray-medium-dark;
        border-left: 1px solid $gray-darkest;
        font-size: .85rem;

        .list {
            height: calc(100% - 2rem);
            overflow: scroll;

            header {
                background-color: $gray-dark;
                > h3 {
                    display: inline-block;
                    margin: 1rem;
                }
            }
            .list-item {
                border-top: 1px solid $gray-medium-light;
                padding: .5rem 1rem;

                span {
                    display: block;
                    margin-bottom: .25rem;
                }
                button {
                    margin-top: .5rem;
                }
            }
        }

        #attributes-list {
            padding: 0 1rem;
            .input-text {
                margin: .25rem 0 .5rem 0;
            }
            label {
                font-size: .625rem;
                text-transform: uppercase;
            }
        }

        #components-list {
            .list-item {
                h4 {
                    margin: .5rem 0;
                }
                div {
                    border-top: 1px solid $gray-medium-light;
                    padding: .5rem 0;
                    position: relative;
                    svg {
                        cursor: pointer;
                        height: 1rem;
                        position: absolute;
                        right: 0;
                        top: calc(50% - .5rem);
                        path {
                            fill: $gray-lightest;
                        }
                    }
                }
            }
        }
    }
</style>
