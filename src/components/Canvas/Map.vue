<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
    <div id="map-container">
        <div id="map" ref="map" :style="{ 'pointer-events': tool === 'Map' ? 'all': 'none' }"></div>

        <div v-show="tool === 'Map'" id="autocomplete">
            <span class="input-text">
                <input ref="addressSearch" type="text" placeholder="Search for a location"/>
            </span>
        </div>
        <div v-show="tool === 'Map'" id="help-text">
            <p>Drag the map and/or search to set desired location.  Use alt+shift to rotate the north axis. Click 'Done' when finished.</p>
            <button @click="finishSetup">Done</button>
        </div>

        <map-modal v-if="mapModalVisible && !mapInitialized" @close="mapModalVisible = false; showReticle()"></map-modal>
        <svg id="reticle"></svg>
    </div>
</template>

<script>

import { mapState } from 'vuex';
import { ResizeEvents } from 'src/components/Resize'
import MapModal from 'src/components/Modals/MapModal'

const googleMaps = require('google-maps-api')('AIzaSyDIja3lnhq63SxukBm9_mA-jn5R0Bj9RN8', ['places']);
const ol = require('openlayers');
const d3 = require('d3');

export default {
  name: 'map',
  data() {
    return {
      view: null,
      map: null,
      autocomplete: null,
      mapModalVisible: window.api ? window.api.config.showMapDialogOnStart : true,
      showGrid: false,
    };
  },

  /*
  * load the openlayers map, google maps autocomplete, and register a listener for view resizing
  */
  mounted() {
    this.showGrid = this.gridVisible;

    this.initAutoComplete();
    this.loadMap();
    ResizeEvents.$on('resize', this.updateMapView);
  },

  /*
  * remove listener for view resizing
  */
  beforeDestroy() {
    ResizeEvents.$off('resize', this.updateMapView);
  },

  methods: {
    /*
    * Asynchronously load google maps autocomplete
    * attatch to address search field
    */
    initAutoComplete() {
      googleMaps().then((maps) => {
        // attatch to address search field
        const autocomplete = new maps.places.Autocomplete(this.$refs.addressSearch);
        // when an address is selected from the dropdown update the component lat/long coordinates
        autocomplete.addListener('place_changed', () => {
          // check that the selected place has associated lat/log data
          const place = autocomplete.getPlace();
          if (place.geometry) {
            // changing component lat/long will trigger updateMapView, placing the map at the updated location
            this.latitude = place.geometry.location.lat();
            this.longitude = place.geometry.location.lng();
          }
        });
      });
    },

    /*
    * empty the map element and (re)load openlayers map canvas inside of it
    */
    loadMap() {
      this.$refs.map.innerHTML = '';
      this.view = new ol.View();
      this.map = new ol.Map({
        layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
        target: 'map',
        view: this.view,
      });

      this.updateMapView();
    },

    /*
    * position the map
    */
    updateMapView() {
      this.map.updateSize();
      // center of grid in RWU
      let gridCenterX = (this.min_x + this.max_x) / 2;
      let gridCenterY = (this.min_y + this.max_y) / 2;

      // default map resolution RWU/px
      let resolution = (this.max_x - this.min_x) / this.$refs.map.clientWidth;

      // translate units from ft to meters
      if (this.units === 'ft') {
        // meters in a foot
        const mPerFt = ol.proj.METERS_PER_UNIT['us-ft'];
        resolution *= mPerFt;
        gridCenterX *= mPerFt;
        gridCenterY *= mPerFt;
      }

      // current long/lat map position in meters
      const mapCenter = ol.proj.fromLonLat([this.longitude, this.latitude]);

      // openlayers places the center in the bottom left of the screen, so add the grid center (m) to the openlayers center
      // adjust for rotation
      // subtract the vertical grid center from the y adjustment because the y axis is inverted
      let deltaY = ((gridCenterX * Math.cos(this.rotation)) - (gridCenterY * Math.sin(this.rotation)));
      let deltaX = ((gridCenterY * Math.cos(this.rotation)) + (gridCenterX * Math.sin(this.rotation)));

      // Web Mercator projections use different resolutions at different latitudes
      // if the map has been placed, adjust the values for the current latitude
      if (this.view.getCenter()) {
        const resolutionAdjustment = 1 / ol.proj.getPointResolution(this.view.getProjection(), 1, this.view.getCenter());

        resolution *= resolutionAdjustment;
        deltaY *= resolutionAdjustment;
        deltaX *= resolutionAdjustment;
      }

      // adjust map position based on size of grid
      mapCenter[0] += deltaY;
      mapCenter[1] += deltaX;

      this.view.setResolution(resolution);
      this.view.setCenter(mapCenter);
      this.view.setRotation(this.rotation);
    },

    /*
    * after the user places the map, save the latitude, longitude, and rotation
    */
    finishSetup() {
      const center = ol.proj.transform(this.view.getCenter(), 'EPSG:3857', 'EPSG:4326')
      this.longitude = center[0];
      this.latitude = center[1];

      this.rotation = this.view.getRotation();

      this.$store.dispatch('project/setMapInitialized', { initialized: true });

      this.tool = 'Rectangle';

      // remove reticle
      d3.select('#reticle').remove();

      this.gridVisible = this.showGrid;
    },

    /*
    * render an svg reticle, hide the grid
    */
    showReticle() {
      if (this.tool !== 'Map') { return; }
      // hide grid
      this.gridVisible = false;

      // draw reticle
      const size = 100;
      const x = this.$refs.map.clientWidth / 2;
      const y = this.$refs.map.clientHeight / 2;

      d3.select('#reticle')
        .selectAll('#reticle path')
        .data([
          [{ x, y: y - size }, { x, y: y + size }],
          [{ x: x - size, y }, { x: x + size, y }],
        ])
        .enter()
        .append('path')
        .attr('stroke-width', '1')
        .attr('stroke', 'gray')
        .attr('d', d3.line().x(d => d.x).y(d => d.y));
    },
  },
  computed: {
    ...mapState({
      projectView: state => state.project.view,
      min_x: state => state.project.view.min_x,
      max_x: state => state.project.view.max_x,
      min_y: state => state.project.view.min_y,
      max_y: state => state.project.view.max_y,
      units: state => state.project.config.units,
      mapInitialized: state => state.project.map.initialized,
    }),
    gridVisible: {
      get() { return this.$store.state.project.grid.visible; },
      set(val) { this.$store.dispatch('project/setGridVisible', { visible: val }); },
    },
    tool: {
      get() { return this.$store.state.application.currentSelections.tool; },
      set(val) { this.$store.dispatch('application/setCurrentTool', { tool: val }); },
    },
    latitude: {
      get() { return this.$store.state.project.map.latitude; },
      set(val) { this.$store.dispatch('project/setMapLatitude', { latitude: val }); },
    },
    longitude: {
      get() { return this.$store.state.project.map.longitude; },
      set(val) { this.$store.dispatch('project/setMapLongitude', { longitude: val }); },
    },
    rotation: {
      get() { return this.$store.state.project.map.rotation; },
      set(val) { this.$store.dispatch('project/setMapRotation', { rotation: val }); },
    },
  },
  watch: {
    units() { this.updateMapView(); },
    latitude() { this.updateMapView(); },
    longitude() { this.updateMapView(); },
    rotation() { this.updateMapView(); },
    projectView: {
      handler() { this.updateMapView(); },
      deep: true,
    },
  },
  components: {
    MapModal,
  },
};

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
        width: calc(100% - 110px);
        border: 2px solid $gray-darkest;
        display: inline-block;
        // float: left;
    }

    button {
      display: inline-block;
      margin: 10px;
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
