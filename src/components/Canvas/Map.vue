<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
    <div id="map-container">
        <div id="map" ref="map" :style="{ 'pointer-events': mapSetup ? 'all': 'none' }"></div>
        <div id="autocomplete" v-show="mapSetup">
            <span class="input-text">
                <input
                    ref="autocompleteText"
                    type="text"
                    placeholder="Search for a location"
                />
            </span>
            <button @click="finishSetup">Done</button>
        </div>
        <div v-if="mapSetup" id="help-text">
            <p>Drag the map and/or search to set desired location.  Use alt+shift to rotate the north axis. Click 'Done' when finished.</p>
        </div>
        <map-modal v-if="mapModalVisible && !mapInitialized" @close="mapModalVisible = false; loadMap();"></map-modal>
        <svg id="reticle"></svg>
    </div>
</template>

<script>

const ol = require('openlayers'),
    d3 = require('d3');

import { mapState } from 'vuex'
import MapModal from 'src/components/Modals/MapModal'
import { ResizeEvents } from 'src/components/Resize'

export default {
    name: 'map',
    data () {
        return {
            view: null,
            map: null,
            autocomplete: null,
            mapModalVisible: true
        };
    },
    mounted () {
        ResizeEvents.$on('resize-resize',this.handleResize);

        if (window.google) {
            this.loadAutocomplete();
        } else {
            const script = document.createElement('script');

            window.googPlacesReady = this.loadAutocomplete;

            script.type = 'text/javascript';
            script.src = 'https://maps.googleapis.com/maps/api/js?libraries=places&callback=googPlacesReady';
            document.body.appendChild(script);
        }

        this.loadMap();
    },
    beforeDestroy () {
        ResizeEvents.$off('resize-resize',this.handleResize);
    },
    methods: {
        handleResize() {
            // console.info("MAP RESIZE");
            this.map.updateSize();
        },
        loadMap() {
            const mapNode = document.getElementById("map");

            while (mapNode.firstChild) {
                mapNode.removeChild(mapNode.firstChild);
            }

            this.view = new ol.View();
            this.map = new ol.Map({
                layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
                target: 'map',
                view: this.view
            });

            this.updateMapView();
        },
        updateMapView() {
            const mPerFt = ol.proj.METERS_PER_UNIT['us-ft'];
            let res = (this.projectView.max_x - this.projectView.min_x)/this.$refs.map.clientWidth;
            const deltaX = this.projectView.min_x + (this.projectView.max_x - this.projectView.min_x)/2,
                deltaY = this.projectView.min_y + (this.projectView.max_y - this.projectView.min_y)/2,
                center = ol.proj.fromLonLat([this.longitude,this.latitude]), // meters
                sine = Math.sin(this.rotation),
                cosine = Math.cos(this.rotation);

            let latitudeModifier = 1;
            // Once map is loaded and we know where we are, then adjust scale by a modifier to account for skew based on latitude (because of how mercator projection works)
            if (this.view.getCenter()) {
              let projection = this.view.getProjection();
              latitudeModifier = 1 / ol.proj.getPointResolution(projection, 1, this.view.getCenter());
            }

            res = res * latitudeModifier;

            // center[0] += (deltaX * cosine + deltaY * sine) * latitudeModifier;
            // center[1] -= (deltaY * cosine - deltaX * sine) * latitudeModifier; // ol origin is bottom left

            // inverted y axis
            center[0] += (deltaX * cosine - deltaY * sine) * latitudeModifier;
            center[1] += (deltaY * cosine + deltaX * sine) * latitudeModifier; // ol origin is bottom left

            this.view.setResolution(res);
            this.view.setCenter(center);
            this.view.setRotation(this.rotation);
            this.updateReticle();
        },
        // setup
        loadAutocomplete () {
            this.autocomplete = new google.maps.places.Autocomplete(this.$refs.autocompleteText);
            this.autocomplete.addListener('place_changed', this.selectLocation);
        },
        selectLocation () {
            var place = this.autocomplete.getPlace();

            if (place.geometry) {
                this.latitude = place.geometry.location.lat(),
                this.longitude = place.geometry.location.lng();
            }
        },
        finishSetup () {
            const center = ol.proj.transform(this.view.getCenter(), 'EPSG:3857', 'EPSG:4326')

            this.longitude = center[0];
            this.latitude = center[1];
            this.rotation = this.view.getRotation();
            this.tool = 'Rectangle';
            this.$store.dispatch('project/setMapInitialized', { initialized: true });
            this.updateReticle();
        },
        updateReticle () {
            const svg = d3.select('#reticle');

            if (!this.mapModalVisible && this.mapSetup) {
                // hide grid
                this.$store.dispatch('project/setGridVisible', { visible: false });

                // draw reticle
                const size = 100,
                    x = this.$refs.map.clientWidth/2,
                    y = this.$refs.map.clientHeight/2;

                svg.selectAll('#reticle path')
                    .data([
                        [{ x, y: y-size }, { x, y: y + size }],
                        [{ x: x-size, y }, { x: x + size, y }]
                    ])
                    .enter()
                    .append('path')
                    .attr('stroke-width', '1')
                    .attr('stroke','gray')
                    .attr('d', d3.line().x(d => d.x).y(d => d.y));

            } else {
                // cleanup
                svg.select("#reticle path").remove();
                // this.$store.dispatch('project/setGridVisible', { visible: true });
            }
        }
    },
    computed: {
        ...mapState({
            projectView: state => state.project.view,
            mapInitialized: state => state.project.map.initialized,
        }),
        tool: {
            get () { return this.$store.state.application.currentSelections.tool; },
            set (val) { this.$store.dispatch('application/setApplicationTool', { tool: val }); }
        },
        mapSetup () { return this.tool === 'Map'; },
        latitude: {
            get () { return this.$store.state.project.map.latitude; },
            set (val) { this.$store.dispatch('project/setMapLatitude', { latitude: val }); }
        },
        longitude: {
            get () { return this.$store.state.project.map.longitude; },
            set (val) { this.$store.dispatch('project/setMapLongitude', { longitude: val }); }
        },
        rotation: {
            get () { return this.$store.state.project.map.rotation; },
            set (val) { this.$store.dispatch('project/setMapRotation', { rotation: val }); }
        }
    },
    watch: {
        latitude () { this.updateMapView(); },
        longitude () { this.updateMapView(); },
        rotation () { this.updateMapView(); },
        projectView: {
            handler () { this.updateMapView(); },
            deep: true
        }
    },
    components: {
        MapModal
    }
}

</script>
<style lang="scss" scoped>
@import "./../../scss/config";

#map-container {
    position: relative;
    height: 100%;
    width: 100%;

    #map {
        height: 100%;
        min-width: 100%;
    }
}

#autocomplete {
    z-index: 100;
    position: absolute;
    right: 0;
    top: 10px;

    > * {
        float: left;
        margin-right: 10px;
    }

    input:focus {
        outline: none;
    }
}

#help-text {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 3;

    p {
        color: $gray-darkest;
        background: white;
        padding: 2px 4px;
        margin: 10px;
        border: 2px solid $gray-darkest;
        display: inline-block;
    }
}

#reticle {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

</style>
