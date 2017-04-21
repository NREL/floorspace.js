<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
    <div id="canvas" ref="canvas">
        <div id="map" ref="map" :style="{ 'pointer-events': currentTool === 'Map' ? 'all': 'none' }"></div>
        <div id="images" ref="images" :style="{ 'pointer-events': currentTool === 'Drag' ? 'all': 'none' }"></div>
    </div>
</template>

<script>

const openlayers = require('./../../../node_modules/openlayers/dist/ol-debug.js');
const Konva = require('konva');
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
        this.loadImages();
        this.loadMap();
    },
    methods: {
        loadMap() {
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
        loadImages() {
            var width = this.$refs.canvas.clientWidth;
            var height = this.$refs.canvas.clientHeight;
            function update(activeAnchor) {
                var group = activeAnchor.getParent();
                var topLeft = group.get('.topLeft')[0];
                var topRight = group.get('.topRight')[0];
                var bottomRight = group.get('.bottomRight')[0];
                var bottomLeft = group.get('.bottomLeft')[0];
                var image = group.get('Image')[0];
                var anchorX = activeAnchor.getX();
                var anchorY = activeAnchor.getY();
                // update anchor positions
                switch (activeAnchor.getName()) {
                    case 'topLeft':
                        topRight.setY(anchorY);
                        bottomLeft.setX(anchorX);
                        break;
                    case 'topRight':
                        topLeft.setY(anchorY);
                        bottomRight.setX(anchorX);
                        break;
                    case 'bottomRight':
                        bottomLeft.setY(anchorY);
                        topRight.setX(anchorX);
                        break;
                    case 'bottomLeft':
                        bottomRight.setY(anchorY);
                        topLeft.setX(anchorX);
                        break;
                }
                image.position(topLeft.position());
                var width = topRight.getX() - topLeft.getX();
                var height = bottomLeft.getY() - topLeft.getY();
                if(width && height) {
                    image.width(width);
                    image.height(height);
                }
            }
            function addAnchor(group, x, y, name) {
                var stage = group.getStage();
                var layer = group.getLayer();
                var anchor = new Konva.Circle({
                    x: x,
                    y: y,
                    stroke: '#666',
                    fill: '#ddd',
                    strokeWidth: 2,
                    radius: 8,
                    name: name,
                    draggable: true,
                    dragOnTop: false
                });
                anchor.on('dragmove', function() {
                    update(this);
                    layer.draw();
                });
                anchor.on('mousedown touchstart', function() {
                    group.setDraggable(false);
                    this.moveToTop();
                });
                anchor.on('dragend', function() {
                    group.setDraggable(true);
                    layer.draw();
                });
                // add hover styling
                anchor.on('mouseover', function() {
                    var layer = this.getLayer();
                    document.body.style.cursor = 'pointer';
                    this.setStrokeWidth(4);
                    layer.draw();
                });
                anchor.on('mouseout', function() {
                    var layer = this.getLayer();
                    document.body.style.cursor = 'default';
                    this.setStrokeWidth(2);
                    layer.draw();
                });
                group.add(anchor);
            }
            var stage = new Konva.Stage({
                container: 'images',
                width: width,
                height: height
            });
            var layer = new Konva.Layer();
            stage.add(layer);
            // darth vader
            var darthVaderImg = new Konva.Image({
                width: 200,
                height: 137
            });
            // yoda
            var yodaImg = new Konva.Image({
                width: 93,
                height: 104
            });
            var darthVaderGroup = new Konva.Group({
                x: 180,
                y: 50,
                draggable: true
            });
            layer.add(darthVaderGroup);
            darthVaderGroup.add(darthVaderImg);
            addAnchor(darthVaderGroup, 0, 0, 'topLeft');
            addAnchor(darthVaderGroup, 200, 0, 'topRight');
            addAnchor(darthVaderGroup, 200, 138, 'bottomRight');
            addAnchor(darthVaderGroup, 0, 138, 'bottomLeft');
            var yodaGroup = new Konva.Group({
                x: 20,
                y: 110,
                draggable: true
            });
            layer.add(yodaGroup);
            yodaGroup.add(yodaImg);
            addAnchor(yodaGroup, 0, 0, 'topLeft');
            addAnchor(yodaGroup, 93, 0, 'topRight');
            addAnchor(yodaGroup, 93, 104, 'bottomRight');
            addAnchor(yodaGroup, 0, 104, 'bottomLeft');
            var imageObj1 = new Image();
            imageObj1.onload = function() {
                darthVaderImg.image(imageObj1);
                layer.draw();
            };
            imageObj1.src = 'https://i.kinja-img.com/gawker-media/image/upload/s--cABEgGOx--/c_scale,fl_progressive,q_80,w_800/xkguz9qxka9dfo73noba.png';
            var imageObj2 = new Image();
            imageObj2.onload = function() {
                yodaImg.image(imageObj2);
                layer.draw();
            };
            imageObj2.src = 'https://static1.squarespace.com/static/53a9f885e4b0dd0e73d2f493/t/53dbfd65e4b06e886b54d336/1406926183061/blueextinguisher+image_tm.jpg?format=2500w';

        }
    },
    computed: {
        ...mapState({

            currentMode: state => state.application.currentSelections.mode,
            currentTool: state => state.application.currentSelections.tool,
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

</style>
