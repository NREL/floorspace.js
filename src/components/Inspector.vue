<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<section id="inspector">
    <section id="tabs">
        <span :class="tab === 'attributes' ? 'active' : ''" @click="tab = 'attributes'">Attributes</span>
        <span :class="tab === 'components' ? 'active' : ''" @click="tab = 'components'">Components</span>
        <span :class="tab === 'geometry' ? 'active' : ''" @click="tab = 'geometry'">Geometry</span>
    </section>

    <section v-if="tab === 'geometry'" id="geometry-list">
        <div v-for="face in currentStoryGeometry.faces" class="alternating">
            <h3 :class="currentSelectionsFace && currentSelectionsFace.id === face.id ? 'active' : ''">Face {{face.id}}</h3>
            <div v-for="edgeRef in face.edgeRefs">
                edge {{ edgeRef.edge_id }} {{ edgeRef.reverse ? 'reversed ' : '' }} {{ edgeForId(edgeRef.edge_id).isShared(currentStoryGeometry) ? 'shared' : '' }}
                <br>startpoint {{ startpoint(edgeRef) }}
                <br>endpoint {{ endpoint(edgeRef) }}
            </div>
        </div>
    </section>

    <section v-if="tab === 'attributes'" id="attributes-list">
        <template v-if="!currentSpace && !currentShading">
            <h3>{{currentStory.name}}</h3>

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
            <h3>Space</h3>
            <label>name</label>
            <div class="input-text">
                <input :value="currentSpace.name" @change="updatecurrentSpace('name', $event)">
            </div>
        </template>

        <template v-if="currentShading">
            <h3>Shading</h3>
            <label>name</label>
            <div class="input-text">
                <input :value="currentShading.name" @change="updatecurrentShading('name', $event)">
            </div>
        </template>
    </section>

    <section v-if="tab === 'components'" id="components-list">
        <template v-if="!currentSpace && !currentShading">
            <h3>{{ currentStory.name }}</h3>
            <button @click="assignObject('windows', currentStory)">Add Window</button>
        </template>

        <template v-if="currentSpace">
            <h3>{{ currentSpace.name }}</h3>
            <div class="alternating">
                <div>
                    <h4>{{ displayTypeForType('daylighting_controls') }}</h4>
                    <span v-for="item in currentSpace.daylighting_controls">{{ item }}</span>
                    <button @click="assignObject('daylighting_controls', currentSpace)">Add daylighting_controls</button>
                </div>
                <div>
                    <h4>{{ displayTypeForType('building_units') }}</h4>
                    <p v-for="(val, key) in getComponent(currentSpace.building_unit_id, 'building_units')">
                        {{ key }}: {{ val }}
                    </p>
                    <button @click="assignObject('building_units', currentSpace)">Add {{ displayTypeForType('building_units') }}</button>
                </div>
                <div>
                    <h4>{{ displayTypeForType('thermal_zones') }}</h4>
                    <p v-for="(val, key) in getComponent(currentSpace.thermal_zone_id, 'thermal_zones')">
                        {{ key }}: {{ val }}
                    </p>
                    <button @click="assignObject('thermal_zones', currentSpace)">Add {{ displayTypeForType('thermal_zones') }}</button>
                </div>
                <div>
                    <h4>{{ displayTypeForType('space_types') }}</h4>
                    <p v-for="(val, key) in getComponent(currentSpace.building_unit_id, 'space_types')">
                        {{ key }}: {{ val }}
                    </p>
                    <button @click="assignObject('space_types', currentSpace)">Add {{ displayTypeForType('space_types') }}</button>
                </div>
                <div>
                    <h4>{{ displayTypeForType('construction_sets') }}</h4>
                    <p v-for="(val, key) in getComponent(currentSpace.construction_set_id, 'construction_sets')">
                        {{ key }}: {{ val }}
                    </p>
                    <button @click="assignObject('construction_sets', currentSpace)">Add {{ displayTypeForType('construction_sets') }}</button>
                </div>
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
        overflow: scroll;
        #tabs {
            border-bottom: 1px solid $gray-darkest;
            border-top: 1px solid $gray-darkest;
            display: flex;
            height: 1.75rem;
            font-size: 0.625rem;
            span {
                border-right: 1px solid $gray-darkest;
                display: inline-block;
                padding: .5rem;
                text-transform: uppercase;
            }
            .active {
                background-color: $gray-medium-light;
                svg {
                    height: 1rem;
                    path {
                        fill: $gray-lightest;
                    }
                }
            }
        }

        #attributes-list, #geometry-list, #components-list {
            font-size: .85rem;
            height: calc(100% - 2rem);
            overflow: scroll;

            .alternating > div {
                padding: .5rem 1rem;
                &:nth-of-type(odd) {
                    background-color: $gray-medium-light;
                }
            }
        }

        #attributes-list {
            padding: 0 1rem;
            .alternating > div {
                padding: 0;
            }
        }



    }
</style>
