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
    <svg @click="$emit('close')" id="close" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <path d="M137.05 128l75.476-75.475c2.5-2.5 2.5-6.55 0-9.05s-6.55-2.5-9.05 0L128 118.948 52.525 43.474c-2.5-2.5-6.55-2.5-9.05 0s-2.5 6.55 0 9.05L118.948 128l-75.476 75.475c-2.5 2.5-2.5 6.55 0 9.05 1.25 1.25 2.888 1.876 4.525 1.876s3.274-.624 4.524-1.874L128 137.05l75.475 75.476c1.25 1.25 2.888 1.875 4.525 1.875s3.275-.624 4.525-1.874c2.5-2.5 2.5-6.55 0-9.05L137.05 128z"/>
    </svg>
    <div id="mode">
        <button @click="setBackground('map')" :class="mapVisible ? 'active' : ''">Map</button>
        <button @click="setBackground('image')" :class="imageVisible ? 'active' : ''">Image</button>
        <button @click="setBackground()"  :class="!mapVisible && !imageVisible ? 'active' : ''">None</button>
    </div>

    <template v-if="mapVisible">
        <span>Enter the map coordinates for the area you'd like to display.</span>
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
    </template>

    <template v-if="imageVisible">
        <span>Upload a custom image for this story.</span>
        <input ref="fileInput" @change="uploadImage" type="file"/>
        <button @click="$refs.fileInput.click()" id="uploadImage">Upload an Image</button>
    </template>
</aside>
</template>

<script>

import { mapState } from 'vuex'
import helpers from './../store/modules/geometry/helpers'

export default {
    name: 'modal',
    methods: {
        setBackground (mode) {
            if (mode === 'map') {
                this.mapVisible = true;
                this.imageVisible = false;
            } else if (mode === 'image') {
                this.mapVisible = false;
                this.imageVisible = true;
            } else {
                this.mapVisible = false;
                this.imageVisible = false;
            }
        },

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
            images: state => state.models.images,
        }),
        mapVisible: {
            get () { return this.$store.state.project.map.visible; },
            set (val) { this.$store.dispatch('project/setMapVisible', { visible: val }); }
        },
        imageVisible: {
            get () { return this.currentStory.imageVisible; },
            set (val) { this.$store.dispatch('models/updateStoryWithData', {
                    story: this.currentStory,
                    imageVisible: val
                });
            }
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
        border: 2px solid $gray-medium;
        border-radius: 1rem;
        left: 50%;
        min-height: 10rem;
        padding: 1rem;
        position: fixed;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 25rem;
        #close {
            position: absolute;
            height: 1.5rem;
            top: 1rem;
            right: 1rem;
            width: 1.5rem;
            path {
                fill: $primary;
            }
        }
        #coordinates {
            display: flex;
            margin: 1rem 0 1rem -1rem;
        }
        #mode {
            display: flex;
            margin-bottom: 1rem;
            button {
                margin-right: .5rem;
                &.active {
                    border: 1px solid $primary;
                }
            }
        }
        span {
            display: block;

        }
        button#uploadImage {
            border: 1px solid #bbc3c7;
            display: block;
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
