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

// const ol = require('openlayers');
const openlayers = require('./../../../node_modules/openlayers/dist/ol-debug.js');
import { mapState } from 'vuex'
export default {
    name: 'map',
    data () { return {
        view: {},
        map: {}
    }; },
    mounted () {

        var osmSource = new ol.source.OSM();
        this.view = new ol.View({
            center: ol.proj.fromLonLat([this.longitude, this.latitude]),

            rotation: Math.PI / 4,
            zoom: this.zoom
        });

        this.map = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    source: osmSource
                })
            ],
            target: 'map',
            controls: ol.control.defaults({
                attributionOptions: ({
                    collapsible: false
                })
            }),
            view: this.view
        });
        console.log(this.map.getView().getCenter());
        setTimeout(()=>{
            this.map.getView().setCenter(ol.proj.fromLonLat([0, 0]))
            console.log(this.map.getView().getCenter());
        },3000)


    },
    computed: {
        ...mapState({
            mapVisible: state => state.project.map.visible,
            latitude: state => state.project.map.latitude,
            longitude: state => state.project.map.longitude,
            zoom: state => state.project.map.zoom,

            images: state => state.application.currentSelections.story.images
        })
    }
}

</script>
<style lang="scss" scoped>
@import "./../../scss/config";


</style>
