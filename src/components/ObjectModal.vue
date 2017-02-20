<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<aside>
    <div id="overlay">
    </div>
    <div id="modal">
        <h2>New Object</h2>
        <svg @click="$emit('close')" id="close" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
            <path d="M137.05 128l75.476-75.475c2.5-2.5 2.5-6.55 0-9.05s-6.55-2.5-9.05 0L128 118.948 52.525 43.474c-2.5-2.5-6.55-2.5-9.05 0s-2.5 6.55 0 9.05L118.948 128l-75.476 75.475c-2.5 2.5-2.5 6.55 0 9.05 1.25 1.25 2.888 1.876 4.525 1.876s3.274-.624 4.524-1.874L128 137.05l75.475 75.476c1.25 1.25 2.888 1.875 4.525 1.875s3.275-.624 4.525-1.874c2.5-2.5 2.5-6.55 0-9.05L137.05 128z"/>
        </svg>
        <form>
            <div class='input-select'>
                <label>Type</label>
                <select v-model='displayType'>
                    <option v-for='(objects, type) in library'>{{ displayTypeForType(type) }}</option>
                </select>
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 14' height='10px'>
                    <path d='M.5 0v14l11-7-11-7z' transform='translate(13) rotate(90)'></path>
                </svg>
            </div>

            <div class='input-text'>
                <label>name</label>
                <input v-model='objectName'>
            </div>

            <div v-for='field in fields'>
                <div class='input-text'>
                    <label>Label</label>
                    <input v-model='field.label'>

                    <label>Value</label>
                    <input v-model='field.value'>
                </div>
            </div>

            <button @click.prevent='addField()'>Add Field</button>
            <button @click.prevent='createObject()'>Save</button>
        </form>
    </div>
</aside>
</template>

<script>

import { mapState } from 'vuex'
import factory from './../store/modules/models/factory'

const map = {
    building_units: {
        displayName: 'Building Unit',
        create: factory.BuildingUnit
    },
    thermal_zones: {
        displayName: 'Thermal Zone',
        create: factory.ThermalZone
    },
    space_types: {
        displayName: 'Space Type',
        create: factory.SpaceType
    },
    construction_sets: {
        displayName: 'Construction Set',
        create: factory.ConstructionSet
    },
    constructions: {
        displayName: 'Construction',
        create: factory.Construction
    },
    windows: {
        displayName: 'Window',
        create: factory.Window
    },
    daylighting_controls: {
        displayName: 'Daylighting Control',
        create: factory.DaylightingControl
    }
};

export default {
    name: 'library',
    data() {
        return {
            displayType: null,
            objectName: null,
            fields: []
        };
    },
    mounted () {
        this.displayType = this.displayTypeForType(Object.keys(this.library)[0]);
    },
    computed: {
        ...mapState({
            library: state => state.models.library
        }),
        objects () {
            return this.library[this.typeForDisplayType(this.displayType)];
        }
    },
    methods: {
        displayTypeForType (type) { return map[type].displayName; },
        typeForDisplayType (displayType) { return Object.keys(map).find(k => map[k].displayName === this.displayType); },
        addField () {
            this.fields.push({
                label: '',
                value: ''
            });
        },
        createObject () {
            const type = this.typeForDisplayType(this.displayType);
            var newObject = new map[type].create(this.objectName);
            this.fields.forEach((field) => {
                newObject[field.label] = field.value;
            })
            this.$store.dispatch('models/createObjectWithType', {
                type: type,
                object: newObject
            });
            this.$emit('close');
        }
    }
}
</script>

<style lang="scss" scoped>
@import "./../scss/config";
    #overlay {
        background-color: $gray-dark;
        height: 100vh;
        left: 0;
        opacity: 0.5;
        position: absolute;
        top: 0;
        width: 100%;
        z-index: 1;
    }
    #modal {
        background-color: $gray-dark;
        border: 2px solid $gray-medium;
        border-radius: 1rem;
        left: 50%;
        min-height: 10rem;
        padding: 1rem;
        position: fixed;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 25rem;
        z-index: 2;
        #close {
            position: absolute;
            height: 1.5rem;
            top: 1rem;
            right: 1rem;
            width: 1.5rem;
            path {
                fill: $primary;
            }
        }
        form {
            .input-select select {
                width: 10rem;
            }
            .input-text {
                margin: .5rem 0;
            }
        }

        input, select {
            border: 1px solid $gray-light;
            &[type="file"] {
                height: 0;
                visibility: hidden;
                width: 0;
            }
        }
    }
</style>
