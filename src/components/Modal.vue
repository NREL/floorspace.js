<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<aside id="modal">
    <h2>Set Background</h2>
    <p>Enter the map coordinates for the area you'd like to display, or upload a custom image.</p>
    <div id="coordinates">
        <div class="input-number">
            <label>latitude</label>
            <input v-model.number.lazy="latitude">
        </div>
        <div class="input-number">
            <label>longitude</label>
            <input v-model.number.lazy="longitude">
        </div>

        <div class="input-number">
            <label>zoom</label>
            <input v-model.number.lazy="zoom">
        </div>
    </div>
    <input ref="fileInput" @change="uploadImage" type="file"/>
    <button @click="$refs.fileInput.click()">Upload Image</button>
    <button @click="mapVisible = !mapVisible" id="import">{{mapVisible ? "Hide Map" : "Show Map"}}</button>

</aside>
</template>

<script>

import { mapState } from 'vuex'
import helpers from './../store/modules/geometry/helpers'

export default {
    name: 'modal',
    methods: {
        uploadImage (event) {
            const file = event.target.files[0],
                reader = new FileReader();

            reader.addEventListener("load", () => {
                this.src = reader.result;
                this.$store.dispatch('models/createImageForStory', {
                    story: this.currentStory,
                    src: reader.result
                });
            }, false);

            if (file) { reader.readAsDataURL(file); }
        }
    },
    computed: {
        ...mapState({
            currentStory: state => state.application.currentSelections.story,
        }),
        mapVisible: {
            get () { return this.$store.state.project.map.visible; },
            set (val) { this.$store.dispatch('project/setMapVisible', { visible: val }); }
        },
        latitude: {
            get () { return this.$store.state.project.map.latitude; },
            set (val) { this.$store.dispatch('project/setMapLatitude', { latitude: parseFloat(val) }); }
        },
        longitude: {
            get () { return this.$store.state.project.map.longitude; },
            set (val) { this.$store.dispatch('project/setMapLongitude', { longitude: parseFloat(val) }); }
        },
        zoom: {
            get () { return this.$store.state.project.map.zoom; },
            set (val) { this.$store.dispatch('project/setMapZoom', { zoom: parseFloat(val) }); }
        }
    },
}
</script>

<style lang="scss" scoped>
@import "./../scss/config";
    #modal {
        background-color: $gray-dark;
        border: 2px solid $primary;
        border-radius: 1rem;
        left: 50%;
        padding: 1rem;
        position: fixed;
        top: 50%;
        transform: translate(-50%, calc(-50% - 5rem));
        width: 25rem;
        #coordinates {
            display: flex;
            margin-bottom: 1rem;
        }
        input {
            border: 1px solid $gray-light;
            &[type="file"] {
                height: 0;
                visibility: hidden;
                width: 0;
            }
        }
    }
</style>
