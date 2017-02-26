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
        <span :class="tab === 'geometry' ? 'active' : ''" @click="tab = 'geometry'">Geometry</span>
    </section>

    <section v-if="tab === 'geometry'" id="list">
        <div v-for="face in currentStoryGeometry.faces">
            <h3 :class="currentSelectionsFace && currentSelectionsFace.id === face.id ? 'active' : ''">Face {{face.id}}</h3>
            <div v-for="edgeRef in face.edgeRefs">
                <br>edge {{ edgeRef.edge_id }} {{ edgeRef.reverse ? 'reversed ' : '' }} {{ edgeForId(edgeRef.edge_id).isShared(currentStoryGeometry) ? 'shared' : '' }}
                <br>startpoint {{ startpoint(edgeRef) }}
                <br>endpoint {{ endpoint(edgeRef) }}
            </div>
        </div>
    </section>

    <section v-if="tab === 'attributes'" id="list">
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
</section>
</template>

<script>

import { mapState } from 'vuex'
import helpers from './../store/modules/geometry/helpers'

export default {
    name: 'inspector',
    data() {
        return {
            tab: 'geometry',
            geometryInspector: true,
            storyInspector: false
        }
    },
    methods: {
        verticesOnEdge (edge) { return helpers.verticesOnEdge(edge, this.currentStoryGeometry); },
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
        }
    },
    computed: {
        currentSelectionsFace () { return this.$store.getters['application/currentSelectionsFace']; },
        currentStoryGeometry () { return this.$store.getters['application/currentStoryGeometry']; },
        ...mapState({
            currentStory: state => state.application.currentSelections.story,
            currentSpace: state => state.application.currentSelections.space,
            currentShading: state => state.application.currentSelections.shading
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

        #list {
            font-size: .85rem;
            height: calc(100% - 2rem);
            overflow: scroll;
            padding: 1rem;

            .active {
                color: $primary;
            }
            h3 {
                margin: 0 0 .5rem 0;
            }
            label {
                font-size: 0.625rem;
                text-transform: uppercase;

            }
            & > div {
                padding: .5rem 0rem 1rem 0rem;
            }
        }
    }
</style>
