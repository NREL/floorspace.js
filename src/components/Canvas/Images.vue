<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
  <div id="images" ref="images" :style="{ 'pointer-events': currentTool === 'Drag' ? 'auto': 'none' }"></div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import applicationHelpers from './../../store/modules/application/helpers';
import ResizeEvents from '../../components/Resize/ResizeEvents';

const Konva = require('konva');
const d3 = require('d3');

export default {
  name: 'images',
  data() {
    return {
      stage: null,
      layer: null,
      // cache images on the component so that we can check which property was altered in the images watcher
      imageCache: [],
    };
  },
  mounted() {
    ResizeEvents.$on('resize-resize', this.renderImages);
    window.addEventListener('resize', this.renderImages);
    this.renderImages();
  },
  beforeDestroy() {
    ResizeEvents.$off('resize-resize', this.renderImages);
    window.removeEventListener('resize', this.renderImages);
  },
  methods: {
    // render
    renderImages() {
      // keep a cache of images each time we render
      // change detection on the images array will use this cache to determine which image property has changed
      // and determine whether a rerender is required
      this.imageCache = JSON.parse(JSON.stringify(this.images));

      // create stage
      this.stage = new Konva.Stage({
        container: 'images',
        width: document.getElementById('canvas').clientWidth,
        height: document.getElementById('canvas').clientHeight,
      });
      this.layer = new Konva.Layer();
      this.stage.add(this.layer);

      // render each image in the store
      this.images.forEach(this.renderImage);

      // place the stage based on the current viewbox (panned/zoomed view)
      this.scaleAndPlaceStage();
    },
    renderImage(image) {
      // values in pixels
      const y = -1 * this.scaleY.invert(image.y);
      const x = this.scaleX.invert(image.x);
      const w = this.scaleX.invert(image.width);
      const h = this.scaleY.invert(image.height);

      // (x, y) is the image center position in pixels
      // konva places image by their upper left corner, so adjust by half the height and half the width
      const imageGroup = new Konva.Group({
        // image center position in pixels
        x,
        y,
        // offset from center point and rotation point
        offset: {
          x: (w / 2),
          y: (h / 2),
        },
        draggable: true,
      });
      const imageObj = new Konva.Image({
        x: 0,
        y: 0,
        width: w,
        height: h,
        opacity: image.opacity,
        name: 'image',
        // add a green border to the currentImage
        stroke: '#6AAC15',
        strokeWidth: 3,
        strokeEnabled: (this.currentImage && this.currentImage.id === image.id),
      });
      const imageCenter = new Konva.Circle({
        x: (w / 2),
        y: (h / 2),
        radius: 3,
        name: 'center',
      });

      // store imageId on group to look up the associated image object when user interacts with group
      imageGroup.imageId = image.id;

      // layout
      this.layer.add(imageGroup);
      imageGroup
        .add(imageObj)
        .add(imageCenter)
        .setZIndex(image.z)
        .rotation(image.r);

      // load image
      const imageReader = new Image();
      imageReader.onload = () => {
        imageObj.image(imageReader);
        this.layer.draw();
      };
      imageReader.src = image.src;

      // initialize rotate and resize controls on the image group
      this.initRotation(imageGroup);
      this.initResize(imageGroup);

      // events
      // set as currentImage when an image's group is clicked (or dragged)
      imageGroup.on('click', () => { this.currentImage = image; });

      imageGroup.on('dragend', () => {
        this.currentImage = image;

        // update store
        const updatedWidth = imageObj.size().width;
        const updatedHeight = imageObj.size().height;
        const updatedRotation = imageGroup.rotation();
        // get center relative to layer since group might be rotated
        const updatedCenterX = imageCenter.getAbsolutePosition(this.layer).x;
        const updatedCenterY = -1 * imageCenter.getAbsolutePosition(this.layer).y;

        this.$store.dispatch('models/updateImageWithData', {
          image,
          x: this.scaleX(updatedCenterX),
          y: this.scaleY(updatedCenterY),
          r: updatedRotation,
          width: this.scaleX(updatedWidth),
          height: this.scaleY(updatedHeight),
        });
      });
    },
    // set up rotation behavior
    initRotation(group) {
      const imageCenter = group.get('.center')[0];
      // fixed anchor (visible)
      const rotateAnchorCircle = new Konva.Circle({
        radius: 6,
        name: 'rotateAnchorCircle',
        stroke: applicationHelpers.config.palette.neutral,
        strokeWidth: 2,
      });

      // line between center and fixed anchor
      const rotateAnchorLine = new Konva.Line({
        stroke: applicationHelpers.config.palette.neutral,
        strokeWidth: 2,
        name: 'rotateAnchorLine',
      });

      // draggable anchor (invisible)
      const rotateAnchor = rotateAnchorCircle.clone({
        name: 'rotateAnchor',
        draggable: true,
        strokeEnabled: false,
      });

      group
        .add(rotateAnchorCircle)
        .add(rotateAnchorLine)
        .add(rotateAnchor);

      rotateAnchorLine.setZIndex(-10);

      // rotate on drag
      rotateAnchor.on('dragmove', () => {
        const {
          x: anchorX,
          y: anchorY,
        } = rotateAnchor.position();
        const {
          x: imageCenterX,
          y: imageCenterY,
        } = imageCenter.position();
        // current rotation of image in degrees
        const rotationOffset = 270 + group.rotation();
        const radToDeg = 180 / Math.PI;
        const dragAngleDegrees = radToDeg * Math.atan((anchorY - imageCenterY) / (anchorX - imageCenterX));

        let updatedAngle = rotationOffset + dragAngleDegrees;
        if (anchorX < imageCenterX) { updatedAngle -= 180; }


        group.rotation(updatedAngle % 360);
      });

      rotateAnchor.on('dragend', () => {
        rotateAnchorCircle.setRadius(6);
        // snap draggable rotation anchor to match visible, fixed rotation anchor
        rotateAnchor.position(rotateAnchorCircle.position());
        this.layer.draw();
      });

      // hover effect
      rotateAnchor.on('dragstart mouseover mousedown', () => {
        document.body.style.cursor = 'pointer';
        rotateAnchorCircle.setRadius(10);
        this.layer.draw();
      });

      rotateAnchor.on('mouseout', () => {
        document.body.style.cursor = 'default';
        rotateAnchorCircle.setRadius(6);
        this.layer.draw();
      });
    },
    // set up resize behavior
    initResize(group) {
      const { width: w, height: h } = group.get('.image')[0].size();

      this.addResizeAnchor(group, 0, 0, 'topLeft');
      this.addResizeAnchor(group, w, 0, 'topRight');
      this.addResizeAnchor(group, w, h, 'bottomRight');
      this.addResizeAnchor(group, 0, h, 'bottomLeft');
      this.redrawAnchors(group);
    },
    // recalc center and rotate anchors
    redrawAnchors(group) {
      const imageObj = group.get('.image')[0];
      const center = group.get('.center')[0];
      const rotateAnchor = group.get('.rotateAnchor')[0];
      const rotateAnchorCircle = group.get('.rotateAnchorCircle')[0];
      const rotateAnchorLine = group.get('.rotateAnchorLine')[0];
      const pos = imageObj.position();
      const { width, height } = imageObj.size();

      center.position({
        x: pos.x + (width / 2),
        y: pos.y + (height / 2),
      });

      rotateAnchorCircle.position({
        x: pos.x + (width / 2),
        y: pos.y + (height * 1.25),
      });

      rotateAnchor.position({
        x: pos.x + (width / 2),
        y: pos.y + (height * 1.25),
      });

      rotateAnchorLine.points([
        rotateAnchorCircle.getX(), rotateAnchorCircle.getY(),
        center.getX(), center.getY(),
      ]);

      group.draw();
    },
    addResizeAnchor(group, w, h, name) {
      const anchor = new Konva.Circle({
        x: w,
        y: h,
        fill: applicationHelpers.config.palette.neutral,
        radius: 3,
        name,
        draggable: true,
      });

      // resize on drag
      anchor.on('dragmove', () => {
        const topLeft = group.get('.topLeft')[0];
        const topRight = group.get('.topRight')[0];
        const bottomRight = group.get('.bottomRight')[0];
        const bottomLeft = group.get('.bottomLeft')[0];
        const { x: anchorX } = anchor.position();
        const imageObj = group.get('.image')[0];
        // look up the image in the data store by the imageID stored on the canvas group
        const image = this.images.find(i => i.id === group.imageId);
        // maintain aspect ratio
        const ratio = image.width / image.height;
        const width = topRight.getX() - topLeft.getX();
        const height = width / ratio;

        let imagePos;

        // update anchor positions
        switch (anchor.getName()) {
          case 'topLeft':
            topLeft.position({
              x: anchorX,
              y: bottomRight.getY() - height,
            });
            topRight.setY(bottomRight.getY() - height);
            bottomLeft.setX(anchorX);

            imagePos = {
              x: bottomRight.getX() - width,
              y: bottomRight.getY() - height,
            };
            break;
          case 'topRight':
            topLeft.setY(bottomRight.getY() - height);
            topRight.setY(bottomRight.getY() - height);
            bottomRight.setX(anchorX);

            imagePos = {
              x: bottomLeft.getX(),
              y: bottomLeft.getY() - height,
            };
            break;
          case 'bottomRight':
            topRight.setX(anchorX);
            bottomRight.position({
              x: anchorX,
              y: height,
            });
            bottomLeft.setY(height);

            imagePos = imageObj.position();
            break;
          case 'bottomLeft':
            topLeft.setX(anchorX);
            bottomRight.setY(height);
            bottomLeft.position({
              x: anchorX,
              y: height,
            });

            imagePos = {
              x: topRight.getX() - width,
              y: topRight.getY(),
            };
            break;
          default:
            break;
        }

        // update image size and position
        imageObj.size({ width, height }).position(imagePos);

        this.redrawAnchors(group);
      });

      // hover effect
      anchor.on('mouseover', () => {
        document.body.style.cursor = 'pointer';
        anchor.setRadius(6)
        .draw();
      });

      anchor.on('mouseout', () => {
        document.body.style.cursor = 'default';
        anchor.setRadius(3)
        .draw();
      });

      group.add(anchor);
    },
    /*
    * Set the scale and position of the canvas based on the current viewbox
    */
    scaleAndPlaceStage() {
      // original rwu/px resolution when scales were set
      const originalResolution = (this.scaleX.range()[1] - this.scaleX.range()[0]) / (this.scaleX.domain()[1] - this.scaleX.domain()[0]);
      // current rwu/px resolution based on current viewbox (after panning and zooming)
      const currentResolution = (this.view.max_x - this.view.min_x) / this.$refs.images.clientWidth;
      // scaling factor to render canvas images at current resolution
      const scale = originalResolution / currentResolution;

      this.stage
        // scale will not be 1 if the user has zoomed in or out
        .scale({
          x: scale,
          y: scale,
        })
        // place the canvas at the pixel value corresponding to our RWU 0
        .position({
          x: this.rwuToPx(0, 'x'),
          y: this.rwuToPx(0, 'y'),
        })
        .draw();
    },
    rwuToPx(rwu, axis) {
      let currentScale;
      if (axis === 'x') {
        currentScale = d3.scaleLinear()
          .range([0, this.$refs.images.clientWidth])
          .domain([this.view.min_x, this.view.max_x]);
      } else if (axis === 'y') {
        currentScale = d3.scaleLinear()
          .range([this.$refs.images.clientHeight, 0]) // inverted y axis
          .domain([this.view.min_y, this.view.max_y]);
      }
      return currentScale(rwu);
    },
  },
  computed: {
    ...mapGetters({
      currentStory: 'application/currentStory',
      // currentSubSelection: 'application/currentSubSelection',
      // currentSubSelectionType: 'application/currentSubSelectionType',
    }),
    ...mapState({
      currentTool: state => state.application.currentSelections.tool,
      scaleX: state => state.application.scale.x,
      scaleY: state => state.application.scale.y,
      view: state => state.project.view,
    }),
    images() { return this.currentStory.images; },

    currentImage: {
      get() { return this.$store.getters['application/currentImage']; },
      set(item) { this.$store.dispatch('application/setCurrentSubSelectionId', { id: item.id }); },
    },
  },
  watch: {
    /*
    * Compare the new images to a cached copy of the images because Vue will not store the previous value of an object that has changed
    * konva will handle updating the canvas when the dimensions or location of an image are changed so don't rerender if
    * if 'height', 'width', 'x', or 'y' have been updated
    * if z index or opacity has changed, or an image has been added/removed, we must re render the canvas
    */
    images: {
      handler(newImages) {
        // an image has been added or removed
        if (newImages.length !== this.imageCache.length) {
          this.renderImages();
          return;
        }

        // no images were added or deleted, check if the property changed is one that should trigger a re-render
        const ignoredProperties = ['height', 'width', 'x', 'y', 'r'];
        newImages.forEach((newImage, i) => {
          const cachedImage = this.imageCache[i];
          // compare properties of new image to corresponding cached image
          Object.keys(newImage).forEach((k) => {
            if (newImage[k] !== cachedImage[k] && ignoredProperties.indexOf(k) === -1) {
              this.renderImages();
            }
          });
        });
      },
      // deep watch so that changes to properties on individual images trigger the handler
      deep: true,
    },
    currentImage() {
      this.renderImages();
    },
    // if the view boundaries change
    view: {
      handler() { this.scaleAndPlaceStage(); },
      deep: true,
    },
  },
};
</script>
<style lang="scss" scoped>
@import "./../../scss/config";
</style>
