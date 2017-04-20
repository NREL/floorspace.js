<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
    <div id="map"></div>
</template>

<script>

const openlayers = require('./../../../node_modules/openlayers/dist/ol-debug.js');
import { mapState } from 'vuex'
export default {
    name: 'map',
    data () {
        return {
            view: null,
            map: null
        };
    },
    mounted () {
        this.view = new ol.View({
            center: ol.proj.fromLonLat([this.longitude, this.latitude]),
            rotation: Math.PI / 4,
            zoom: this.zoom
        });

        this.map = new ol.Map({
            layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
            target: 'map',
            view: this.view
        });

    },
    computed: {
        ...mapState({
            images: state => state.application.viewSelections.story.images
        }),
        mapVisible: {
            get () { return this.$store.state.project.map.visible; },
            set (val) { this.$store.dispatch('project/setMapVisible', { visible: val }); }
        },

        latitude: {
            get () { return this.$store.state.project.map.latitude; },
            set (val) { this.$store.dispatch('project/setMapLatitude', { latitude: val }); }
        },

        longitude: {
            get () { return this.$store.state.project.map.longitude; },
            set (val) { this.$store.dispatch('project/setMapLongitude', { longitude: val }); }
        },

        zoom: {
            get () { return this.$store.state.project.map.zoom; },
            set (val) { this.$store.dispatch('project/setMapZoom', { zoom: val }); }
        },

        rotation: {
            get () { return this.$store.state.project.map.rotation; },
            set (val) { this.$store.dispatch('project/setMapRotation', { rotation: val }); }
        },

        // the current position of the map view, return the position information from the store if none is set
        viewLongitude () { return this.view ? ol.proj.transform(this.view.getCenter(), 'EPSG:3857', 'EPSG:4326')[0] : null; },
        viewLatitude () { return this.view ? ol.proj.transform(this.view.getCenter(), 'EPSG:3857', 'EPSG:4326')[1] : null; },
        viewZoom () { return this.view ? this.view.getZoom() : this.zoom; },
        viewRotation () { return this.map ? this.view.getRotation() : this.rotation; }
    },
    watch: {
        // latitude () { this.view.setCenter(ol.proj.fromLonLat([this.longitude, this.latitude])); },
        // longitude () { this.view.setCenter(ol.proj.fromLonLat([this.longitude, this.latitude])); },
        // zoom () { this.view.setZoom(this.zoom); },
        // rotation () { this.view.setRotation(this.rotation); },

        // update the store to match the position of the map view
        viewLongitude (val) { this.longitude = val; },
        viewLatitude (val) { this.latitude = val; },
        viewZoom (val) { this.zoom = val; },
        viewRotation (val) { this.rotation = val; }
    }
}

</script>
<style lang="scss" scoped>
@import "./../../scss/config";
#mapinfo {
    z-index: 2;
    color: black;
    position: absolute;
    left: 17.5rem;
    top: 5rem;
    width: calc(100% - 35rem);
}

</style>
