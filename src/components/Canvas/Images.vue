<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
    <div id="images" ref="images" :style="{ 'pointer-events': currentTool === 'Drag' ? 'all': 'none' }"></div>
</template>

<script>

// const openlayers = require('./../../../node_modules/openlayers/dist/ol-debug.js');
const Konva = require('konva');
import { mapState } from 'vuex'
export default {
    name: 'images',
    data () {
        return { };
    },
    mounted () {
        this.loadImages();
    },
    methods: {
        update(activeAnchor) {
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
            if (width && height) {
                image.width(width);
                image.height(height);
            }
        },
        addAnchor(group, x, y, name) {
            var stage = group.getStage();
            var layer = group.getLayer();
            var anchor = new Konva.Circle({
                x: x,
                y: y,
                stroke: '#666',
                fill: '#ddd',
                strokeWidth: 1,
                radius: 8,
                name: name,
                draggable: true,
                dragOnTop: false
            });

            anchor.on('dragmove', (e) => {
                this.update(e.target);
                layer.draw();
            });
            anchor.on('mousedown touchstart', function () {
                group.setDraggable(false);
                this.moveToTop();
            });
            anchor.on('dragend', () => {
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
        },
        loadImages() {

            const stage = new Konva.Stage({
                container: 'images',
                width: document.getElementById('canvas').clientWidth,
                height: document.getElementById('canvas').clientHeight
            });

            const layer = new Konva.Layer();
            stage.add(layer);


            this.images.forEach((image) => {
                console.log(image);
                // yoda
                var konvaImage = new Konva.Image({
                    width: 93,
                    height: 104
                });

                var imageGroup = new Konva.Group({
                    x: 20,
                    y: 110,
                    draggable: true
                });
                layer.add(imageGroup);
                imageGroup.add(konvaImage);
                this.addAnchor(imageGroup, 0, 0, 'topLeft');
                this.addAnchor(imageGroup, 93, 0, 'topRight');
                this.addAnchor(imageGroup, 93, 104, 'bottomRight');
                this.addAnchor(imageGroup, 0, 104, 'bottomLeft');

               var imageObj2 = new Image();
                imageObj2.onload = function() {
                    konvaImage.image(imageObj2);
                    layer.draw();
                };
                imageObj2.src = image.src;
            })
        }
    },
    computed: {
        ...mapState({
            currentTool: state => state.application.currentSelections.tool,
            images: state => state.application.currentSelections.story.images
        })
    },
    watch: {
        images() {
            this.loadImages();
        }
    }
}

</script>
<style lang="scss" scoped>
@import "./../../scss/config";

</style>
