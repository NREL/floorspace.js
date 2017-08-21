<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import ResizeEvents from './ResizeEvents';
/*
* <resize-group> wraps a <resize> component and the elements that should be moved when the component is resized
* when a resize event is fired on the shared ResizeEvents Vue, the resize-group will
* check the updated size of the resize component, and reposition its other children accordingly
*/
export default {
  props: ['resizeTarget'],
  mounted() { ResizeEvents.$on('resize', this.handleResize); },
  beforeDestroy() { ResizeEvents.$off('resize', this.handleResize); },
  methods: {
    handleResize() {
      // get all sibling nodes for an element
      function getSiblings(el) {
        const siblings = [];
        for (let sibling = el.parentNode.firstChild; sibling; sibling = sibling.nextSibling) {
          if (sibling.nodeType === 1 && sibling !== el) { siblings.push(sibling); }
        }
        return siblings;
      }



        const navigationWidth = document.getElementById('layout-navigation').style.width.replace('px', '');
        // update the left positions of the navigation's sibling elements so that they display directly beside the resized navigation
        getSiblings(document.getElementById('layout-navigation')).forEach((el) => { el.style.left = `${navigationWidth}px`; });

    },
  },
};
</script>

<style src="src/scss/main.scss" lang="scss"></style>
<style lang="scss" scoped>
@import "src/scss/config";

</style>
