<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<section id="inspector">

    <h3 @click="geometryInspector = !geometryInspector"><a>All Geometry</a></h3>
    <div v-if="geometryInspector">
        id: {{ currentStoryGeometry.id }}

        <div v-for="face in currentStoryGeometry.faces">
            <h3>Face {{ face.id }} {{currentSelectionsFace && currentSelectionsFace.id === face.id ? "(current)" : ""}}</h3>
            <div v-for="edgeRef in face.edgeRefs">
                verticesOnEdge: {{containedVertices(edgeForId(edgeRef.edge_id))}}
                <br>edge: {{ edgeRef.edge_id }}, reverse: {{ edgeRef.reverse }}, shared: {{ edgeForId(edgeRef.edge_id).isShared(currentStoryGeometry) }}
                <br>startpoint: {{ startpoint(edgeRef) }}
                <br>endpoint: {{ endpoint(edgeRef) }}
            </div>
        </div>
    </div>

    <h3 @click="storyInspector = !storyInspector"><a>Current Story</a></h3>
    <div v-if="storyInspector">
        <div class="input-text">
            <label>name</label>
            <input :value="currentStory.name" @change="updatecurrentStory('name', $event)">
        </div>

        <div class="input-text">
            <label>below_floor_plenum_height</label>
            <input :value="currentStory.below_floor_plenum_height" @change="updatecurrentStory('below_floor_plenum_height', $event)">
        </div>

        <div class="input-text">
            <label>floor_to_ceiling_height</label>
            <input :value="currentStory.floor_to_ceiling_height" @change="updatecurrentStory('floor_to_ceiling_height', $event)">
        </div>

        <div class="input-text">
            <label>multiplier</label>
            <input :value="currentStory.multiplier" @change="updatecurrentStory('multiplier', $event)">
        </div>
    </div>

    <h3 @click="spaceInspector = !spaceInspector"><a>Current Space</a></h3>
    <div v-if="spaceInspector">
        <div class="input-text">
            <label>name</label>
            <input :value="currentSpace.name" @change="updatecurrentSpace('name', $event)">
        </div>
    </div>

</section>
</template>

<script>

import { mapState } from 'vuex'
import helpers from './../store/modules/geometry/helpers'

export default {
    name: 'inspector',
    data() {
        return {
            geometryInspector: true,
            storyInspector: false,
            spaceInspector: false
        }
    },
    methods: {
        containedVertices (edge) {
            return helpers.verticesOnEdge(edge, this.currentStoryGeometry);
        },
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
                return 'v2 ' + vertex.id + ' (' + vertex.x + ',' + vertex.y + ')';
            } else {
                const vertex = this.vertexForId(edge.v1);
                return 'v1 ' + vertex.id + ' (' + vertex.x + ',' + vertex.y + ')';
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
        }
    },
    computed: {
        currentSelectionsFace () { return this.$store.getters['application/currentSelectionsFace']; },
        currentStoryGeometry () { return this.$store.getters['application/currentStoryGeometry']; },
        ...mapState({
            currentStory: state => state.application.currentSelections.story,
            currentSpace: state => state.application.currentSelections.space
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
        padding: 0 2rem;
        div {
            margin: 1rem 0;
        }
    }
</style>
