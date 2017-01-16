<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<section id="inspector">
    <h3>Current Story</h3>

    <div class="input-text">
        <label>name</label>
        <input :value="currentStory.name" @input="updatecurrentStory('name', $event)">
    </div>

    <div class="input-text">
        <label>below_floor_plenum_height</label>
        <input :value="currentStory.below_floor_plenum_height" @input="updatecurrentStory('below_floor_plenum_height', $event)">
    </div>

    <div class="input-text">
        <label>floor_to_ceiling_height</label>
        <input :value="currentStory.floor_to_ceiling_height" @input="updatecurrentStory('floor_to_ceiling_height', $event)">
    </div>

    <div class="input-text">
        <label>multiplier</label>
        <input :value="currentStory.multiplier" @input="updatecurrentStory('multiplier', $event)">
    </div>

    <h3>Current Space</h3>

    <div class="input-text" v-for="(value, key) in currentSpace">
        <label>{{key}}</label>
        <input :value="value" @input="updatecurrentStory(key, $event)" readonly="true">
    </div>

</section>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'inspector',
    data() {
        return {}
    },
    methods: {
        updatecurrentStory (key, event) {
            var payload = { story: this.$store.state.application.currentSelections.story };
            payload[key] = event.target.value;
            this.$store.commit('models/updateStoryWithData', payload);
        }
    },
    computed: {
        ...mapState({
            currentStory: state => state.application.currentSelections.story,
            currentSpace: state => state.application.currentSelections.space
        })
    }
}
</script>

<style lang="scss" scoped>
@import "./../scss/config";
    #inspector {
        background-color: $gray-medium;
        border-left: 1px solid $gray-darkest;
        overflow: scroll;
        padding: 0 2rem;
        div {
            margin: 1rem 0;
        }
    }
</style>
