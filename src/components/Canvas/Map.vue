<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
    <div id="map" ref="map" :style="{ 'pointer-events': currentTool === 'Map' ? 'all': 'none' }"></div>
</template>

<script>

const ol = require('openlayers'),
    Konva = require('konva');
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
        this.loadMap();
    },
    methods: {
        loadMap() {
            const mapNode = document.getElementById("map");
            while (mapNode.firstChild) {
                mapNode.removeChild(mapNode.firstChild);
            }
            this.view = new ol.View({
                center: ol.proj.fromLonLat([this.longitude, this.latitude]),
                rotation: this.rotation,
                zoom: this.zoom
            });
            this.map = new ol.Map({
                layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
                target: 'map',
                view: this.view,
                interactions: ol.interaction.defaults({ altShiftDragRotate: !this.currentStoryGeometry.faces.length})
            });
            this.setMapView();
        },
        setMapView() {
            const val = this.projectView;
            const ftPerM = ol.proj.METERS_PER_UNIT['us-ft'];
            const res = (val.max_x - val.min_x)/this.$refs.map.clientWidth*ftPerM,
                view = this.map.getView(),
                centerX = ftPerM*(val.min_x + (val.max_x - val.min_x)/2),
                centerY = ftPerM*(val.min_y + (val.max_y - val.min_y)/2),
                originM = ol.proj.fromLonLat([this.longitude,this.latitude]); // meters

            view.setResolution(res);

            originM[0] += centerX;
            originM[1] -= centerY; // ol origin is bottom left

            view.setCenter(originM);
        }
    },
    computed: {
        ...mapState({
            currentTool: state => state.application.currentSelections.tool,
            projectView: state => state.project.view,
        }),
        currentStoryGeometry () { return this.$store.getters['application/currentStoryGeometry']; },
        mapVisible: {
            get () { return this.$store.state.project.map.visible; },
            set (val) { this.$store.dispatch('project/setMapVisible', { visible: val }); }
        },

        // the position information for the map in the data store
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

        // // the current position of the map view on the canvas, return the position information from the store if none is set
        // viewLongitude () { return this.view ? ol.proj.transform(this.view.getCenter(), 'EPSG:3857', 'EPSG:4326')[0] : null; },
        // viewLatitude () { return this.view ? ol.proj.transform(this.view.getCenter(), 'EPSG:3857', 'EPSG:4326')[1] : null; },
        // viewZoom () { return this.view ? this.view.getZoom() : this.zoom; },
        // viewRotation () { return this.view ? this.view.getRotation() : this.rotation; }
    },
    watch: {
        'currentStoryGeometry.faces.length' (newVal, oldVal) {
            if (oldVal === 0 && newVal === 1) {
                this.loadMap();
            }
        },
        // // watch for changes to map position in the datastore, update the view to reflect what's in the data store (used during model imports)
        // latitude () { this.view.setCenter(ol.proj.fromLonLat([this.longitude, this.latitude])); },
        // longitude () { this.view.setCenter(ol.proj.fromLonLat([this.longitude, this.latitude])); },
        // zoom () { this.view.setZoom(this.zoom); },
        // rotation () { this.view.setRotation(this.rotation); },

        // // update the store to match the position of the map view
        // viewLongitude (val) { this.longitude = val; },
        // viewLatitude (val) { this.latitude = val; },
        // viewZoom (val) { this.zoom = val; },
        // viewRotation (val) { this.rotation = val; },
        projectView: {
            handler (val) {
                this.setMapView();
            },
            deep: true
        }
    }
}

</script>
<style lang="scss" scoped>
@import "./../../scss/config";

</style>
