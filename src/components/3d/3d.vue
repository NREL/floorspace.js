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
    </div>
</template>

<script>
const THREE = require('three');
import TrackballControls from './TrackballControls';
import DragControls from './DragControls';


import { mapState } from 'vuex'
export default {
    name: 'canvas3d',
    data () {
        return {
            canvas: null,
            scene: null,
            camera: null,

            fov: 50
        };
    },
    // recalculate and draw the grid when the window resizes
    mounted () {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( this.fov, this.$refs.canvas.offsetWidth / this.$refs.canvas.offsetHeight, 0.1, 100 );
		this.camera.position.z = 50;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( this.$refs.canvas.offsetWidth, this.$refs.canvas.offsetHeight );
        this.$refs.canvas.appendChild( this.renderer.domElement );

        this.renderGeometry();
    },
    computed: {
        ...mapState({
            currentSpace: state => state.application.currentSelections.space,
            currentStory: state => state.application.currentSelections.story
        }),
        polygons () {
            return [{
                face_id: 1,
                points: [
                    {"id":4,"x":1,"y":2,"X":1,"Y":2},
                    {"id":5,"x":3,"y":9,"X":3,"Y":9},
                    {"id":6,"x":6,"y":7,"X":6,"Y":7},
                    {"id":7,"x":6,"y":2,"X":6,"Y":2},
                    {"id":8,"x":4,"y":3,"X":4,"Y":3}
                ]
            }];
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
        renderCube () {
            // draw a cube
			for ( var i = 0; i < 1; i ++ ) {
                var geometry = new THREE.BoxGeometry(Math.random(),Math.random(),Math.random()),
                    cube = new THREE.Object3D();
                cube.add(new THREE.LineSegments(
                    geometry,
                    new THREE.LineBasicMaterial({
                        color: Math.random() * 0xffffff,
                        transparent: true,
                        opacity: 0.5
                    })
                ));

                cube.add(new THREE.Mesh(
                    geometry,
                    new THREE.MeshPhongMaterial({
                    transparent: true,
                    opacity: 0.5,
                        color: Math.random() * 0xffffff,
                        emissive: Math.random() * 0xffffff
                    })
                ));

                cube.scale.x = .5;
                cube.scale.y = .5;
                cube.scale.z = .5;
                cube.position.x = Math.random();
				cube.position.y = Math.random();
				cube.position.z = Math.random();

                cube.rotation.y = Math.random() * 2 * Math.PI;
                cube.rotation.z = Math.random() * 2 * Math.PI;
                this.scene.add(cube);
			}

            var render = () => {
                cube.rotation.y += .05;
                cube.rotation.x += .05;
                requestAnimationFrame( render );
                this.renderer.render(this.scene, this.camera);
            }

            render();
        },
        renderGeometry () {
            this.polygons.forEach((polygon) => {
                var shape = new THREE.Shape();
                shape.moveTo( polygon.points[0].x, polygon.points[0].y );

                polygon.points.forEach((point) => {
                    shape.lineTo(point.x, point.y);
                });

                var geometry = new THREE.ExtrudeGeometry(shape, {
                   amount: 10,
                   bevelSize: 0
                });

                var material = new THREE.MeshPhongMaterial({
                        transparent: true,
                        opacity: 0.5,
                        color: Math.random() * 0xffffff,
                        emissive: Math.random() * 0xffffff
                    })

                new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

                var object = new THREE.Mesh(
                    geometry, new THREE.MeshPhongMaterial({
                        transparent: true,
                        opacity: 0.5,
                        color: Math.random() * 0xffffff,
                        emissive: Math.random() * 0xffffff,
                        //wireframe:true
                    }));
                this.scene.add(object);
                var render = () => {
                    object.rotation.y += .01;
                    object.rotation.x += .01;
                    object.rotation.z += .01;

                    requestAnimationFrame( render );
                    this.renderer.render(this.scene, this.camera);
                }

                render();

            })



        }
    },
    watch: {
        fov () {
            this.camera.fov = this.fov;
            this.camera.updateProjectionMatrix();
        }
    }

    // mounted () {
	// 	var container,
    //         camera,
    //         controls,
    //         scene,
    //         renderer,
    //         objects = [];
    //
	// 	init();
	// 	animate();
    //
	// 	function init() {
	// 		container = document.createElement( 'div' );
	// 	    document.getElementById("canvas").appendChild( container );
    //
	// 		camera = new THREE.PerspectiveCamera( 70, document.getElementById("canvas").offsetWidth / document.getElementById("canvas").offsetHeight, 1, 10000 );
    //         camera.position.z = 1000;
    //
	// 		controls = new THREE.TrackballControls( camera );
	// 		controls.rotateSpeed = 1.0;
	// 		controls.zoomSpeed = 1.2;
	// 		controls.panSpeed = 0.8;
	// 		controls.noZoom = false;
	// 		controls.noPan = false;
	// 		controls.staticMoving = true;
	// 		controls.dynamicDampingFactor = 0.3;
    //
	// 		scene = new THREE.Scene();
    //
	// 		scene.add( new THREE.AmbientLight( 0x505050 ) );
    //
	// 		var light = new THREE.SpotLight( 0xffffff, 1.5 );
	// 		light.position.set( 0, 500, 2000 );
	// 		light.castShadow = true;
    //
	// 		light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 200, 10000 ) );
	// 		light.shadow.bias = - 0.00022;
    //
	// 		light.shadow.mapSize.width = 2048;
	// 		light.shadow.mapSize.height = 2048;
    //
	// 		scene.add( light );
    //
	// 		var geometry = new THREE.BoxGeometry( 40, 40, 40 );
    //
	// 		for ( var i = 0; i < 200; i ++ ) {
    //
	// 			var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
    //
	// 			object.position.x = Math.random() * -1000;
	// 			object.position.y = Math.random() * 600 - 300;
	// 			object.position.z = Math.random() * 800 - 400;
    //
	// 			object.rotation.x = Math.random() * 2 * Math.PI;
	// 			object.rotation.y = Math.random() * 2 * Math.PI;
	// 			object.rotation.z = Math.random() * 2 * Math.PI;
    //
	// 			object.scale.x = Math.random() * 2 + 1;
	// 			object.scale.y = Math.random() * 2 + 1;
	// 			object.scale.z = Math.random() * 2 + 1;
    //
	// 			object.castShadow = true;
	// 			object.receiveShadow = true;
    //
	// 			scene.add( object );
    //
	// 			objects.push( object );
    //
	// 		}
    //
	// 		renderer = new THREE.WebGLRenderer( { antialias: true } );
	// 		renderer.setClearColor( 0xf0f0f0 );
	// 		renderer.setPixelRatio( document.getElementById("canvas").devicePixelRatio );
	// 		renderer.setSize( document.getElementById("canvas").offsetWidth, document.getElementById("canvas").offsetHeight );
	// 		renderer.sortObjects = false;
    //
	// 		renderer.shadowMap.enabled = true;
	// 		renderer.shadowMap.type = THREE.PCFShadowMap;
    //
	// 		container.appendChild( renderer.domElement );
    //
	// 		var dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
	// 		dragControls.addEventListener( 'dragstart', function ( event ) { controls.enabled = false; } );
	// 		dragControls.addEventListener( 'dragend', function ( event ) { controls.enabled = true; } );
    //
	// 		var info = document.createElement( 'div' );
	// 		info.style.position = 'absolute';
	// 		info.style.top = '10px';
	// 		info.style.width = '100%';
	// 		info.style.textAlign = 'center';
	// 		info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> webgl - draggable cubes';
	// 		container.appendChild( info );
    //
	// 		window.addEventListener( 'resize', onWindowResize, false );
    //
	// 	}
    //
	// 	function onWindowResize() {
	// 		camera.aspect = document.getElementById("canvas").offsetWidth / document.getElementById("canvas").offsetHeight;
	// 		camera.updateProjectionMatrix();
	// 		renderer.setSize( document.getElementById("canvas").offsetWidth, document.getElementById("canvas").offsetHeight );
	// 	}
	// 	function animate() {
	// 		requestAnimationFrame( animate );
	// 		controls.update();
	// 		renderer.render( scene, camera );
	// 	}
    // }
}

</script>
<style lang="scss" scoped>
@import "./../../scss/config";
// we can't style the dynamically created d3 elements here, put those styles in the scss folder


</style>
