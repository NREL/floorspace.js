<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->
<template>
    <div id="canvas" ref="canvas">
        <svg id="north_axis" height="1792" viewBox="0 0 1792 1792" width="1792" xmlns="http://www.w3.org/2000/svg" :transform="`rotate(${northAxis})`">
          <path d="M1277 493q-9 19-29 19h-224v1248q0 14-9 23t-23 9H800q-14 0-23-9t-9-23V512H544q-21 0-29-19t5-35L870 74q10-10 23-10 14 0 24 10l355 384q13 16 5 35z"/>
        </svg>
        <map-view v-if="mapEnabled" v-show="mapVisible"></map-view>
        <images-view></images-view>
    </div>
</template>

<script>

// this import order is important, if the grid is loaded before the other elements or after the toolbar, it ends up warped

import Map from './Map'
import Images from './Images'

import { mapState } from 'vuex'

export default {
    name: 'app',
    data () { return {}; },
    computed: {
        ...mapState({
            mapEnabled: state => state.project.map.enabled,
            mapVisible: state => state.project.map.visible,
            northAxis: state => state.project.config.north_axis,
        })
    },
    components: {
        'map-view': Map,
        'images-view': Images,
    }
}
</script>

<style lang="scss" scoped>
@import "./../../scss/config";
svg#north_axis {
  height: 2.25rem;
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 3rem;
  z-index: 90;
}
#canvas {
    background: white;
    height: 100%;
    width: 100%;
}

</style>
