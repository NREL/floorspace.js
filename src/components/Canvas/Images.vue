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
            layer.draw();
        },
        renderImage (layer,image) {
            const { width: w, height: h, x, y } = image;
            /*
            * Container Group
            * maintains image x, y coordinates
            * does not rotate
            * drag to reposition image
            */
            const containerGroup = new Konva.Group({
                x: this.scaleX.invert(x),
                y: this.scaleY.invert(y),
                draggable: true
            });
            /*
            * Image Group
            * image and anchors
            * maintains image rotation
            */
            const imageGroup = new Konva.Group({
                x: this.scaleX.invert(w/2),
                y: this.scaleY.invert(h/2),
                offset: {
                    x: this.scaleX.invert(w/2),
                    y: this.scaleY.invert(h/2)
                },
                draggable: false,
                name: 'imageGroup'
            });
            const konvaImage = new Konva.Image({
                width: this.scaleX.invert(w),
                height: this.scaleY.invert(h),
                stroke: '#6AAC15',  
                strokeWidth: 3,
                strokeEnabled: (this.currentImage && this.currentImage.id === image.id),
                opacity: image.opacity
            });
            const imageCenter = new Konva.Circle({
                x: this.scaleX.invert(w/2),
                y: this.scaleY.invert(h/2),
                // fill: 'blue',
                radius: 3,
                name: 'imageCenter',
                draggable: false
            });

            // store imageId on group to look up the associated image object when user interacts with group
            containerGroup.imageId = image.id;
            imageGroup.imageId = image.id; 

            // layout
            containerGroup.add(imageGroup);
            layer.add(containerGroup);
            imageGroup.add(konvaImage)
                .add(imageCenter)
                .setZIndex(image.z)
                .rotation(image.r);
            konvaImage.setZIndex(image.z);
            
            // load image
            const imageObj = new Image();

            imageObj.onload = () => {
                konvaImage.image(imageObj);
                layer.draw();
            };
            imageObj.src = image.src;

            // translate image dimensions from RWU to px
            this.initResizeAnchor(containerGroup, 0, 0, 'topLeft');
            this.initResizeAnchor(containerGroup, w, 0, 'topRight');
            this.initResizeAnchor(containerGroup, w, h, 'bottomRight');
            this.initResizeAnchor(containerGroup, 0, h, 'bottomLeft');
            this.initRotation(containerGroup, w, h);

            // events
            containerGroup.on('click', (e) => {
                // containerGroup.moveToTop();
                this.currentImage = image;
            });

            containerGroup.on('dragend', (e) => {
                this.currentImage = image;
                this.commitChanges(containerGroup);
            });
        },
        // resize
        initResizeAnchor (containerGroup, x, y, name) {
            const group = containerGroup.get('.imageGroup')[0], 
                layer = group.getLayer(),
                anchor = new Konva.Circle({
                    x: this.scaleX.invert(x),
                    y: this.scaleY.invert(y),
                    fill: applicationHelpers.config.palette.neutral,
                    // fill: 'red',
                    radius: 3,
                    name: name,
                    draggable: true
                });

            // drag
            anchor.on('dragstart', () => {
                this.removeRotation(containerGroup);
            })

            anchor.on('dragmove', () => {
                this.resize(containerGroup, anchor);
                layer.draw();
            });

            // hover effect
            anchor.on('mouseover', () => {
                document.body.style.cursor = 'pointer';
                anchor.setRadius(6);
                layer.draw();
            });

            anchor.on('mouseout', () => {
                document.body.style.cursor = 'default';
                anchor.setRadius(3);
                layer.draw();
            });

            group.add(anchor);
        },
        resize (containerGroup, activeAnchor) {
            const topLeft = containerGroup.get('.topLeft')[0],
                topRight = containerGroup.get('.topRight')[0],
                bottomRight = containerGroup.get('.bottomRight')[0],
                bottomLeft = containerGroup.get('.bottomLeft')[0],
                imageObj = containerGroup.get('Image')[0],
                imageCenter = containerGroup.get('.imageCenter')[0],
                layer = containerGroup.getLayer(),
                { x: anchorX, y: anchorY } = activeAnchor.position(),

                // look up the image in the data store by the imageID stored on the canvas containerGroup
                image = this.images.find(i => i.id === containerGroup.imageId),
                // maintain aspect ratio
                ratio = image.width / image.height,
                width = topRight.getX() - topLeft.getX(),
                height = width / ratio;

            var imagePos;

            // update anchor positions
            switch (activeAnchor.getName()) {
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
                .position(imagePos)

            // image center
            imageCenter.position({
                x: imagePos.x + width/2,
                y: imagePos.y + height/2
            });

            layer.draw();
        },
        // rotate
        initRotation (containerGroup, w, h) {
            const layer = containerGroup.getLayer();
            /*
            * Create new group for rotate anchor
            *   Includes draggable anchor initialized on top of fixed anchor for actual rotation
            * Adds visual reference to image group
            *   Includes fixed anchor and connecting line to image center
            */
            const imageGroup = containerGroup.get('.imageGroup')[0];
            const rotateGroup = new Konva.Group({
                draggable: false,
                name: 'rotateGroup',
                ...imageGroup.position(),
                offset: imageGroup.offset(),
                rotation: imageGroup.rotation()
            });

            // draggable anchor (invisible)
            const rotateAnchor = new Konva.Circle({
                x: this.scaleX.invert(w/2),
                y: this.scaleY.invert(h*1.25),
                radius: 6,
                name: 'rotate',
                draggable: true,
                strokeWidth: 0
            });

            // fixed anchor (visible)
            const rotateAnchorFixed = rotateAnchor.clone({
                draggable: false,
                name: 'rotateFixed',
                stroke: applicationHelpers.config.palette.neutral,
                strokeWidth: 2,
            });

            // center point
            const centerAnchor = new Konva.Circle({
                x: this.scaleX.invert(w/2),
                y: this.scaleY.invert(h/2),
                name: 'center',
                draggable: false
            });
            
            rotateGroup.add(centerAnchor);
            rotateGroup.add(rotateAnchor);
            containerGroup.add(rotateGroup);

            // line between center and fixed anchor
            const rotateLine = new Konva.Line({
                points: [
                    rotateAnchorFixed.getX(),rotateAnchorFixed.getY(),
                    centerAnchor.getX(),centerAnchor.getY()
                ],
                stroke: applicationHelpers.config.palette.neutral,
                strokeWidth: 2,
                name: 'rotateLine'
            });

            imageGroup.add(rotateAnchorFixed);
            imageGroup.add(rotateLine);
            rotateLine.setZIndex(containerGroup.getZIndex()-10); // render behind image

            // rotate on drag
            rotateAnchor.on('dragmove', () => {
                const { x: anchorX, y: anchorY } = rotateAnchor.position();
                const { x: centerX, y: centerY } = centerAnchor.position();
                const rotationOffset = rotateGroup.rotation();

                var angle = 270 + (180/Math.PI)*Math.atan((anchorY - centerY)/(anchorX - centerX)) + rotationOffset;

                if (anchorX < centerX) {
                    angle -= 180;
                }

                imageGroup.rotation(angle%360);
            });

            rotateAnchor.on('mouseup touchend', () => {
                rotateAnchorFixed.setRadius(6);

                // snap draggable rotation anchor to match visible, fixed rotation anchor
                rotateGroup.rotation(imageGroup.rotation());
                rotateAnchor.position(rotateAnchorFixed.position());
                layer.draw();
            });

            // hover effect
            rotateAnchor.on('mouseover', () => {
                document.body.style.cursor = 'pointer';
                rotateAnchorFixed.setRadius(10);
                layer.draw();
            });

            rotateAnchor.on('mouseout', () => {
                document.body.style.cursor = 'default';
                rotateAnchorFixed.setRadius(6);
                layer.draw();
            });

            rotateAnchor.on('mousedown touchstart', () => {
                rotateAnchorFixed.setRadius(10);
                layer.draw();
            });
        },
        removeRotation (containerGroup) {
            containerGroup.get('.rotateGroup,.rotateFixed,.rotateLine').destroy();
        },
        // update store
        commitChanges (containerGroup) {
            const imageObj = containerGroup.get('Image')[0],
                topLeft = containerGroup.get('.topLeft')[0],
                topRight = containerGroup.get('.topRight')[0],
                bottomRight = containerGroup.get('.bottomRight')[0],
                bottomLeft = containerGroup.get('.bottomLeft')[0],
                imageGroup = containerGroup.get('.imageGroup')[0],
                { width, height } = imageObj.size(),
                { x: centerX, y: centerY } = containerGroup.get('.imageCenter')[0].getAbsolutePosition(containerGroup),
                { x: containerX, y: containerY } = containerGroup.position(),
                image = this.images.find(i => i.id === containerGroup.imageId),
                layer = containerGroup.getLayer();

            // transfer resize to container group so it can be committed
            imageObj.position({ x: 0, y: 0 });
            imageGroup.position({ x: width/2, y: height/2 }).offset({ x: width/2, y: height/2 });
            containerGroup.position({
                x: containerX + centerX - width/2,
                y: containerY + centerY - height/2
            });

            // reset anchor positions
            topLeft.position({ x: 0, y: 0 });
            topRight.position({ x: width, y: 0 });
            bottomRight.position({ x: width, y: height });
            bottomLeft.position({ x: 0, y: height });

            // update store
            this.$store.dispatch('models/updateImageWithData', {
                image: image,
                // store new image coordinates in rwu
                x: this.scaleX(containerGroup.getX()),
                y: this.scaleY(containerGroup.getY()),
                r: imageGroup.rotation(),
                width: this.scaleX(width),
                height: this.scaleY(height)
            });

            // containerGroup.destroy();
            // this.renderImage(layer,image);
            // layer.draw();
            this.renderImages();
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
