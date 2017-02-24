<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
    <div ref="canvas" id="canvas">

        <div class='input-number'>
            <label>name</label>
            <input v-model='fov' type="number">
        </div>

        <div class='input-number'>
            <label>name</label>
            <input v-model='zPosition' type="number">
        </div>

    </div>
</template>

<script>
const THREE = require('three');
import TrackballControls from './TrackballControls';

import { mapState } from 'vuex'
export default {
    name: 'canvas3d',
    data () {
        return {
            scene: null,
            camera: null,
            controls: null,

            zPosition: 50,
            fov: 50
        };
    },
    // recalculate and draw the grid when the window resizes
    mounted () {
        // camera
        this.camera = new THREE.PerspectiveCamera( this.fov, this.$refs.canvas.offsetWidth / this.$refs.canvas.offsetHeight, .1, 1000000 );
		this.camera.position.z = 20;

        // renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio( this.$refs.canvas.devicePixelRatio );
        this.renderer.setSize( this.$refs.canvas.offsetWidth, this.$refs.canvas.offsetHeight );
        this.renderer.sortObjects = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.setSize( this.$refs.canvas.offsetWidth, this.$refs.canvas.offsetHeight );
        this.$refs.canvas.appendChild( this.renderer.domElement );

        // scene
        this.scene = new THREE.Scene();
        this.scene.add( new THREE.AmbientLight( 0x505050 ) );

        const light = new THREE.SpotLight( 0xffffff, 1.5 );
        light.position.set( 0, 500, 2000 );
        light.castShadow = true;
        light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 200, 10000 ) );
        light.shadow.bias = - 0.00022;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        this.scene.add( light );

        // controls
        this.controls = new THREE.TrackballControls( this.camera );
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.3;

		const animate = () => {
			requestAnimationFrame( animate );
			this.controls.update();
			this.renderer.render( this.scene, this.camera );
		}
		animate();

        // handle resize
        window.addEventListener('resize', this.resizeCanvas);

        this.renderGeometry();
    },
    beforeDestroy () {
        window.removeEventListener('resize', this.resizeCanvas);
        // this.$refs.grid.removeEventListener('mousemove', this.calcSnap);
    },
    computed: {
        ...mapState({
            currentSpace: state => state.application.currentSelections.space,
            currentStory: state => state.application.currentSelections.story
        }),
        polygons () {
            return this.$store.getters['application/currentStoryGeometry'].faces.map((face) => {
                return {
                    face_id: face.id,
                    points: face.edgeRefs.map((edgeRef) => {
                        // look up the edge referenced by the face
                        const edge = this.$store.getters['application/currentStoryGeometry'].edges.find((e) => {
                            return e.id === edgeRef.edge_id;
                        });
                        // look up the vertex associated with v1 unless the edge reference on the face is reversed
                        if (!edge) {
                            // TODO: dangling edgeref, find out where the edge is getting dumped
                            debugger;
                        }
                        const vertexId = edgeRef.reverse ? edge.v2 : edge.v1;
                        return this.$store.getters['application/currentStoryGeometry'].vertices.find((v) => {
                            return v.id === vertexId;
                        });
                    })
                };
            });
        },
    },
    methods: {
        renderGeometry () {
            const objects = [];
            this.polygons.forEach((polygon) => {
                const shape = new THREE.Shape();
                // begining at origin, connect all vertices
                shape.moveTo( polygon.points[0].x, polygon.points[0].y );
                polygon.points.forEach( p => shape.lineTo(p.x, p.y));

                const geometry = new THREE.ExtrudeGeometry(shape, {
                   amount: 3,
                   bevelEnabled: false
                });

                const mesh = new THREE.Mesh( geometry,
                    new THREE.MeshPhongMaterial({
                        transparent: true,
                        opacity: 0.5,
                        side: THREE.DoubleSide,
                        color: Math.random() * 0xffffff
                    }
                ));
                // const lineSegments = new THREE.LineSegments( geometry,
                //     new THREE.LineBasicMaterial({
                //         color: Math.random() * 0xffffff
                //     })
                // );
                // mesh.add(lineSegments);
                this.scene.add(mesh);
            });
        },
        resizeCanvas () {
			this.camera.aspect = this.$refs.canvas.offsetWidth / this.$refs.canvas.offsetHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize(this.$refs.canvas.offsetWidth, this.$refs.canvas.offsetHeight );
		}
    },
    watch: {
        fov () {
            this.camera.fov = this.fov;
            this.camera.updateProjectionMatrix();
        },
        zPosition () {
            this.camera.position.z = this.zPosition;
            this.camera.updateProjectionMatrix();
        },
        polygons () {
            this.renderGeometry();
        }
    }
}

</script>
<style lang="scss" scoped>
@import "./../../scss/config";
// we can't style the dynamically created d3 elements here, put those styles in the scss folder


</style>
