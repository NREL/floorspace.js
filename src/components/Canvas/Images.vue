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
import applicationHelpers from './../../store/modules/application/helpers.js'
import modelHelpers from './../../store/modules/models/helpers.js'

export default {
    name: 'images',
    data () {
        return { };
    },
    mounted () {
        this.loadImages();
    },
    methods: {

        loadImages() {
            const stage = new Konva.Stage({
                    container: 'images',
                    width: document.getElementById('canvas').clientWidth,
                    height: document.getElementById('canvas').clientHeight
                }),
                layer = new Konva.Layer();

            stage.add(layer);

            this.images.forEach((image) => {
                const konvaImage = new Konva.Image({
                        width: this.scaleX.invert(image.width),
                        height: this.scaleY.invert(image.height),
                    }),
                    group = new Konva.Group({
                        x: this.scaleX.invert(image.x),
                        y: this.scaleY.invert(image.y),
                        draggable: true
                    }),
                    imageObj = new Image();

                group.imageId = image.id;

                imageObj.onload = () => {
                    konvaImage.image(imageObj);
                    layer.draw();
                };
                imageObj.src = image.src;;

                layer.add(group);
                group.add(konvaImage);

                this.addAnchor(group, 0, 0, 'topLeft');
                this.addAnchor(group, this.scaleX.invert(image.width), 0, 'topRight');
                this.addAnchor(group, this.scaleX.invert(image.width), this.scaleY.invert(image.height), 'bottomRight');
                this.addAnchor(group, 0, this.scaleY.invert(image.height), 'bottomLeft');

                group.on('dragend', (e) => {
                    this.$store.dispatch('models/updateImageWithData', {
                        image: image,
                        x: this.scaleX(group.getX()),
                        y: this.scaleY(group.getY())
                    });
                });
            });
        },
        update(activeAnchor) {
            const group = activeAnchor.getParent(),
                image = modelHelpers.libraryObjectWithId(this.$store.state.models, group.imageId),
                ratio = image.width / image.height,
                topLeft = group.get('.topLeft')[0],
                topRight = group.get('.topRight')[0],
                bottomRight = group.get('.bottomRight')[0],
                bottomLeft = group.get('.bottomLeft')[0],
                imageObj = group.get('Image')[0],
                anchorX = activeAnchor.getX(),
                anchorY = activeAnchor.getY();

                const width = topRight.getX() - topLeft.getX(),
                    height = width / ratio;//bottomLeft.getY() - topLeft.getY();


            // update anchor positions
            switch (activeAnchor.getName()) {
                case 'topLeft':
                    topRight.setY(anchorY);
                    bottomLeft.setX(anchorX).setY(anchorY + height);
                    bottomRight.setX(anchorX + width).setY(anchorY + height);
                    break;
                case 'topRight':
                    topLeft.setY(anchorY);
                    bottomRight.setX(anchorX).setY(anchorY + height);
                    bottomLeft.setX(anchorX - width).setY(anchorY + height);
                    break;
                case 'bottomRight':
                    bottomLeft.setY(anchorY).setX(anchorX - width);
                    topRight.setX(anchorX).setY(anchorY - height);
                    topLeft.setY(anchorY - height);
                    break;
                case 'bottomLeft':
                    bottomRight.setY(anchorY).setX(anchorX + width);
                    topLeft.setX(anchorX).setY(anchorY - height);
                    topRight.setY(anchorY - height);
                    break;
            }

            // update image position and size on canvas
            imageObj.position(topLeft.position());


            if (width && height) {
                imageObj.width(width);
                imageObj.height(height);
            }

            // update image position and size in datastore
            this.$store.dispatch('models/updateImageWithData', {
                image: image,
                x: this.scaleX(topLeft.getX()),
                y: this.scaleY(topLeft.getY()),
                width: this.scaleX(width),
                height: this.scaleY(height)
            });
        },
        addAnchor(group, x, y, name) {
            const stage = group.getStage(),
                layer = group.getLayer(),
                anchor = new Konva.Circle({
                    x: x,
                    y: y,
                    fill: applicationHelpers.config.palette.neutral,
                    radius: 3,
                    name: name,
                    draggable: true
                });

            anchor.on('mousedown touchstart', () => {
                group.setDraggable(false);
                anchor.moveToTop();
            });
            anchor.on('dragmove', () => {
                this.update(anchor);
                layer.draw();
            });
            anchor.on('dragend', () => {
                group.setDraggable(true);
                layer.draw();
            });

            anchor.on('mouseover', () => {
                document.body.style.cursor = 'pointer';
                anchor.setRadius(6);
                anchor.getLayer().draw();
            });
            anchor.on('mouseout', () => {
                document.body.style.cursor = 'default';
                anchor.setRadius(3);
                anchor.getLayer().draw();
            });

            group.add(anchor);
        }
    },
    computed: {
        ...mapState({
            currentTool: state => state.application.currentSelections.tool,
            images: state => state.application.currentSelections.story.images,

            scaleX: state => state.application.scale.x,
            scaleY: state => state.application.scale.y,
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
