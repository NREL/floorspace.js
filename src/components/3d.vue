<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
    <section ref="canvas" id="canvas"></section>
</template>

<script>
const THREE = require('three');
import { mapState } from 'vuex'
export default {
    name: 'canvas3d',
    // recalculate and draw the grid when the window resizes
    mounted () {
        const scene = new THREE.Scene(),
            camera = new THREE.PerspectiveCamera( 75, this.$refs.canvas.clientWidth/this.$refs.canvas.clientHeight, 0.1, 1000 ),
            renderer = new THREE.WebGLRenderer();

        renderer.setSize( this.$refs.canvas.clientWidth, this.$refs.canvas.clientHeight );
        this.$refs.canvas.appendChild( renderer.domElement );

        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial({
            color: 0xDF5236,
            opacity: .5,
            transparent: true,
            side: THREE.BackSide 
        });
        var cube = new THREE.Mesh( geometry, material );
        scene.add( cube );

        camera.position.z = 5;

        var render = function () {
        	requestAnimationFrame( render );

        	cube.rotation.x += 0.05;
        	cube.rotation.y += 0.05;

        	renderer.render(scene, camera);
        };

        render();
    }
}

</script>
<style lang="scss" scoped>
@import "./../scss/config";
// we can't style the dynamically created d3 elements here, put those styles in the scss folder
#canvas {
	body { margin: 0; }
	#canvas { width: 100%; height: 100% }
}
</style>
