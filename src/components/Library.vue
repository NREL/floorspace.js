<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<section id="library">
    <header>
        <h1>Object Library</h1>
        <button @click="createObject()" id="import">New Object</button>

        <div class="input-select" id="typeSelect">
            <label>Type</label>
            <select v-model="type">
                <option v-for="(objects, type) in library">{{ displayTypeName(type) }}</option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 14" height="10px">
                <path d="M.5 0v14l11-7-11-7z" transform="translate(13) rotate(90)"></path>
            </svg>
        </div>

    </header>

    <div class="input-number">
        <label>name</label>
        <input v-model="objectName">
    </div>
    <ul>
        <li v-for="object in objects">{{object}}</li>
    </ul>

</section>
</template>

<script>
import { mapState } from 'vuex'
import factory from './../store/modules/models/factory'

const map = {
    building_units: {
        displayName: "Building Unit",
        constructor: factory.BuildingUnit
    },
    thermal_zones: {
        displayName: "Thermal Zone",
        constructor: factory.ThermalZone
    },
    space_types: {
        displayName: "Space Type",
        constructor: factory.SpaceType
    },
    construction_sets: {
        displayName: "Construction Set",
        constructor: factory.ConstructionSet
    },
    constructions: {
        displayName: "Construction",
        constructor: factory.Construction
    },
    windows: {
        displayName: "Window",
        constructor: factory.Window
    },
    daylighting_controls: {
        displayName: "Daylighting Control",
        constructor: factory.DaylightingControl
    }
};

export default {
    name: 'navigation',
    data() {
        return {
            type: null,
            objectName: null
        };
    },
    mounted () {
        this.type = this.displayTypeName(Object.keys(this.library)[0]);
    },
    computed: {
        ...mapState({
            library: state => state.models.library
        }),
        objects () {
            const type = Object.keys(map).find(k => map[k].displayName === this.type);

            return this.library[type];
        }
    },
    methods: {
        displayTypeName (type) {
            return map[type].displayName;
        },
        createObject () {


            const type = Object.keys(map).find(k => map[k].displayName === this.type)
            var newObject = new map[type].constructor(this.objectName);
            this.$store.dispatch('models/createObjectWithType', {
                type: type,
                object: newObject
            });
        }
    }
}
</script>

<style lang="scss" scoped>
@import "./../scss/config";
#library {
    background-color: $gray-medium-light;
    overflow: scroll;
    padding: 0 2.5rem;
    position: relative;
    header {
        align-items: center;
        display: flex;
        button {
            margin-left: 1rem;
        }
        #typeSelect{
            margin-left: auto;
            & > select {
                width: 8.5rem;
            }
        }
    }
}

</style>
