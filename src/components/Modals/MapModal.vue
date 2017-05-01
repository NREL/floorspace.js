<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<aside>
    <div @click="$emit('close')" class="overlay"></div>
    <div class="modal">
        <header>
            <h2>Enable the Map?</h2>
            <svg @click="$emit('close')" class="close" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path d="M137.05 128l75.476-75.475c2.5-2.5 2.5-6.55 0-9.05s-6.55-2.5-9.05 0L128 118.948 52.525 43.474c-2.5-2.5-6.55-2.5-9.05 0s-2.5 6.55 0 9.05L118.948 128l-75.476 75.475c-2.5 2.5-2.5 6.55 0 9.05 1.25 1.25 2.888 1.876 4.525 1.876s3.274-.624 4.524-1.874L128 137.05l75.475 75.476c1.25 1.25 2.888 1.875 4.525 1.875s3.275-.624 4.525-1.874c2.5-2.5 2.5-6.55 0-9.05L137.05 128z"/>
            </svg>
        </header>

        <div class="content">
            <p>If you would like to geolocate your floorplan, place the map at your desired location before drawing any geometry. Use alt+shift to rotate the north axis. Once geometry has been drawn, the map cannot be rotated.</p>
            <button @click="mapEnabled = true; tool='Map'; $emit('close')">Place Map</button>
            <button @click="mapEnabled = false; mapVisible = false; $emit('close')">Disable Map</button>
            <div class="input-text">
                <label>Address</label>
                <input v-model="address">
            </div>
        </div>



    </div>
</aside>
</template>

<script>

export default {
    name: 'MapModal',
    data () {
        return {
            address: ""
        }
    },
    computed: {
        mapEnabled: {
            get () { return this.$store.state.project.map.enabled; },
            set (val) { this.$store.dispatch('project/setMapEnabled', { enabled: val }); }
        },

        tool: {
            get () { return this.$store.state.application.currentSelections.tool; },
            set (val) { this.$store.dispatch('application/setApplicationTool', { tool: val }); }
        }
    }

}
</script>

<style lang="scss" scoped>
@import "./../../scss/config";
.content {
    margin: 0 2rem 2rem 2rem;
    button {
        margin: 1rem .5rem;

    }
}

</style>
