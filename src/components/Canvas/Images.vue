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
const Konva = require('konva');
import { mapState } from 'vuex'
import applicationHelpers from './../../store/modules/application/helpers.js'
import modelHelpers from './../../store/modules/models/helpers.js'

export default {
    name: 'images',
    data () {
        return {
            // cache images on the component so that we can check which property was altered in the images watcher
            imageCache: []
        };
    },
    mounted () {
        window.addEventListener('resize', this.renderImages);
        this.renderImages();
    },
    beforeDestroy () {
        window.removeEventListener('resize', this.renderImages);
    },
    methods: {
        // render
        renderImages () {
            // udpate image cache
            this.imageCache = JSON.parse(JSON.stringify(this.images));

            const stage = new Konva.Stage({
                    container: 'images',
                    width: document.getElementById('canvas').clientWidth,
                    height: document.getElementById('canvas').clientHeight
                }),
                layer = new Konva.Layer();

            stage.add(layer);

            this.images.forEach(this.renderImage.bind(this,layer));
            // layer.draw();
        },
        renderImage (layer, image) {
            const imageReader = new Image(),
                { width: w, height: h, x, y } = image,
                imageGroup = new Konva.Group({
                    x: this.scaleX.invert(x + w/2),
                    y: this.scaleY.invert(y + h/2),
                    offset: {
                        x: this.scaleX.invert(w/2),
                        y: this.scaleY.invert(h/2)
                    },
                    draggable: true
                }),
                imageObj = new Konva.Image({
                    x: 0,
                    y: 0,
                    width: this.scaleX.invert(w),
                    height: this.scaleY.invert(h),
                    stroke: '#6AAC15',
                    strokeWidth: 3,
                    strokeEnabled: (this.currentImage && this.currentImage.id === image.id),
                    opacity: image.opacity,
                    name: 'image'
                }),
                imageCenter = new Konva.Circle({
                    x: this.scaleX.invert(w/2),
                    y: this.scaleY.invert(h/2),
                    // fill: 'blue',
                    // radius: 3,
                    name: 'center',
                    draggable: false
                });

            // store imageId on group to look up the associated image object when user interacts with group
            imageGroup.imageId = image.id; 

            // layout
            layer.add(imageGroup);
            imageGroup
                .add(imageObj)
                .add(imageCenter)
                .setZIndex(image.z)
                .rotation(image.r);
            
            // load image
            imageReader.onload = () => {
                imageObj.image(imageReader);
                layer.draw();
            };
            imageReader.src = image.src;

            // load controls
            this.initRotation(imageGroup);
            this.initResize(imageGroup);

            // events
            imageGroup.on('click', (e) => {
                // imageGroup.moveToTop();
                this.currentImage = image;
            });

            imageGroup.on('dragend', (e) => {
                this.currentImage = image;

                // update store
                const { width: w, height: h } = imageObj.size(),
                    r = imageGroup.rotation(),
                    // get center relative to layer since group might be rotated
                    { x, y } = imageCenter.getAbsolutePosition(layer);

                this.$store.dispatch('models/updateImageWithData', {
                    image,
                    x: this.scaleX(x - w/2),
                    y: this.scaleY(y - h/2),
                    r,
                    width: this.scaleX(w),
                    height: this.scaleY(h)
                });

                this.renderImages();
            });
        },
        // set up rotation behavior
        initRotation (group) {
            const imageCenter = group.get('.center')[0],
                layer = group.getLayer();

            // fixed anchor (visible)
            const rotateAnchorCircle = new Konva.Circle({
                radius: 6,
                draggable: false,
                name: 'rotateAnchorCircle',
                stroke: applicationHelpers.config.palette.neutral,
                strokeWidth: 2,
            });
            
            // line between center and fixed anchor
            const rotateAnchorLine = new Konva.Line({
                stroke: applicationHelpers.config.palette.neutral,
                // stroke: 'blue',
                strokeWidth: 2,
                name: 'rotateAnchorLine'
            });

            // draggable anchor (invisible)
            const rotateAnchor = rotateAnchorCircle.clone({
                name: 'rotateAnchor',
                draggable: true,
                strokeEnabled: false,
                // fill: 'blue'
            });

            group
                .add(rotateAnchorCircle)
                .add(rotateAnchorLine)
                .add(rotateAnchor);

            rotateAnchorLine.setZIndex(-10);

            // rotate on drag
            rotateAnchor.on('dragmove', () => {
                const { x: anchorX, y: anchorY } = rotateAnchor.position();
                const { x: centerX, y: centerY } = imageCenter.position();
                const rotationOffset = group.rotation();

                var angle = 270 + (180/Math.PI)*Math.atan((anchorY - centerY)/(anchorX - centerX)) + rotationOffset;

                if (anchorX < centerX) {
                    angle -= 180;
                }

                angle %= 360;

                group.rotation(angle%360);
            });

            rotateAnchor.on('dragend', () => {
                rotateAnchorCircle.setRadius(6);
                // snap draggable rotation anchor to match visible, fixed rotation anchor
                rotateAnchor.position(rotateAnchorCircle.position());
                layer.draw();
            });

            // hover effect
            rotateAnchor.on('dragstart mouseover mousedown', () => {
                document.body.style.cursor = 'pointer';
                rotateAnchorCircle.setRadius(10);
                layer.draw();
            });

            rotateAnchor.on('mouseout', () => {
                document.body.style.cursor = 'default';
                rotateAnchorCircle.setRadius(6);
                layer.draw();
            });
        },
        // set up resize behavior
        initResize (group) {
            const imageObj = group.get('.image')[0],
                { width: w, height: h } = imageObj.size();

            addResizeAnchor.call(this, group, 0, 0, 'topLeft');
            addResizeAnchor.call(this, group, w, 0, 'topRight');
            addResizeAnchor.call(this, group, w, h, 'bottomRight');
            addResizeAnchor.call(this, group, 0, h, 'bottomLeft');
            redrawAnchors();

            function addResizeAnchor(group, w, h, name) {
                const anchor = new Konva.Circle({
                    x: w,
                    y: h,
                    fill: applicationHelpers.config.palette.neutral,
                    // fill: 'red',
                    radius: 3,
                    name: name,
                    draggable: true
                });

                // resize on drag
                anchor.on('dragmove', () => {
                    const topLeft = group.get('.topLeft')[0],
                        topRight = group.get('.topRight')[0],
                        bottomRight = group.get('.bottomRight')[0],
                        bottomLeft = group.get('.bottomLeft')[0],
                        { x: anchorX, y: anchorY } = anchor.position(),
                        imageObj = group.get('.image')[0],
                        // look up the image in the data store by the imageID stored on the canvas group
                        image = this.images.find(i => i.id === group.imageId),
                        // maintain aspect ratio
                        ratio = image.width / image.height,
                        width = topRight.getX() - topLeft.getX(),
                        height = width / ratio;

                    var imagePos;

                    // update anchor positions
                    switch (anchor.getName()) {
                        case 'topLeft':
                            topRight.setY(bottomRight.getY() - height);
                            bottomLeft.setX(anchorX);
                            imagePos = {
                                x: bottomRight.getX() - width,
                                y: bottomRight.getY() - height
                            };
                            break;
                        case 'topRight':
                            topLeft.setY(bottomRight.getY() - height);
                            bottomRight.setX(anchorX);
                            imagePos = {
                                x: bottomLeft.getX(),
                                y: bottomLeft.getY() - height
                            };
                            break;
                        case 'bottomRight':
                            bottomLeft.setY(height);
                            topRight.setX(anchorX);
                            imagePos = imageObj.position();
                            break;
                        case 'bottomLeft':
                            bottomRight.setY(height);
                            topLeft.setX(anchorX);
                            imagePos = {
                                x: topRight.getX() - width,
                                y: topRight.getY()
                            };
                            break;
                    }

                    // update image size and position
                    imageObj.size({ width, height })
                        .position(imagePos);

                    redrawAnchors();
                });

                // hover effect
                anchor.on('mouseover', () => {
                    document.body.style.cursor = 'pointer';
                    anchor.setRadius(6).draw();
                });

                anchor.on('mouseout', () => {
                    document.body.style.cursor = 'default';
                    anchor.setRadius(3).draw();
                });

                group.add(anchor);
            };

            // recalc center and rotate anchors
            function redrawAnchors() {
                const center = group.get('.center')[0],
                    rotateAnchor = group.get('.rotateAnchor')[0],
                    rotateAnchorCircle = group.get('.rotateAnchorCircle')[0],
                    rotateAnchorLine = group.get('.rotateAnchorLine')[0],
                    pos = imageObj.position(),
                    { width, height } = imageObj.size();

                center.position({
                    x: pos.x + width/2,
                    y: pos.y + height/2
                });

                rotateAnchorCircle.position({
                    x: pos.x + width/2,
                    y: pos.y + height*1.25
                });

                rotateAnchor.position({
                    x: pos.x + width/2,
                    y: pos.y + height*1.25
                });

                rotateAnchorLine.points([
                    rotateAnchorCircle.getX(),rotateAnchorCircle.getY(),
                    center.getX(),center.getY()
                ]);

                group.draw();
            };
        }
    },
    computed: {
        ...mapState({
            currentTool: state => state.application.currentSelections.tool,
            images: state => state.application.currentSelections.story.images,
            scaleX: state => state.application.scale.x,
            scaleY: state => state.application.scale.y,
        }),

        currentImage: {
            get () { return this.$store.state.application.currentSelections.image; },
            set (item) { this.$store.dispatch('application/setCurrentImage', { 'image': item }); }
        }
    },
    watch: {
        /*
        * Compare the new images to a cached copy of the images because Vue will not store the previous value of an object that has changed
        * if 'height', 'width', 'x', or 'y' have been updated, the canvas will already be updated too so there is no need to re rendering
        * if z index or opacity has changed, or an image has been added/removed, we must re render the canvas
        */
        images: {
            handler (newImages) {
                if (newImages.length !== this.imageCache.length) { this.renderImages(); }

                // no images were added or deleted, check if the property changed is one that should trigger a re-render
                const ignoredProperties = ['height', 'width', 'x', 'y', 'r'];
                for (var i = 0; i < newImages.length; i++) {
                    const newImage = newImages[i],
                        cachedImage = this.imageCache[i];
                    Object.keys(newImage).forEach((k) => {
                        if (newImage[k] !== cachedImage[k] && !~ignoredProperties.indexOf(k)) {
                            this.renderImages();
                        }
                    });
                }
            },
            // deep watch so that changes to properties on individual images trigger the handler
            deep: true
        },
        currentImage() { this.renderImages(); }
    }
}
</script>
<style lang="scss" scoped>
@import "./../../scss/config";
</style>
