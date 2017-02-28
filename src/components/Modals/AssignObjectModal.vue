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
            <h2>Select a {{ displayType }} to assign to {{ target.name }}</h2>
            <svg @click="$emit('close')" class="close" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path d="M137.05 128l75.476-75.475c2.5-2.5 2.5-6.55 0-9.05s-6.55-2.5-9.05 0L128 118.948 52.525 43.474c-2.5-2.5-6.55-2.5-9.05 0s-2.5 6.55 0 9.05L118.948 128l-75.476 75.475c-2.5 2.5-2.5 6.55 0 9.05 1.25 1.25 2.888 1.876 4.525 1.876s3.274-.624 4.524-1.874L128 137.05l75.475 75.476c1.25 1.25 2.888 1.875 4.525 1.875s3.275-.624 4.525-1.874c2.5-2.5 2.5-6.55 0-9.05L137.05 128z"/>
            </svg>
        </header>
        <table class="table">
            <thead>
                <tr>
                    <th v-for="column in columns">
                        <span>{{column}}</span>
                    </th>
                </tr>
            </thead>

            <tbody>
                <tr v-for='object in objects' @click="currentObject = currentObject === object ? null : object" :class="currentObject === object ? 'active' : ''">
                    <td v-for="column in columns">
                        <span>{{object.hasOwnProperty(column) ? object[column] : '--'}}</span>
                    </td>
                </tr>
            </tbody>
        </table>
        <footer>
            <button @click='assignObjectToTarget()' :class="currentObject ? 'active' : 'disabled'" id="saveAssignment">Save</button>
        </footer>
    </div>
</aside>
</template>

<script>

import { mapState } from 'vuex'
import factory from './../../store/modules/models/factory'

const map = {
    building_units: {
        displayName: 'Building Unit',
        propName: 'building_unit_id',
        create: factory.BuildingUnit
    },
    thermal_zones: {
        displayName: 'Thermal Zone',
        propName: 'thermal_zone_id',
        create: factory.ThermalZone
    },
    space_types: {
        displayName: 'Space Type',
        propName: 'space_type_id',
        create: factory.SpaceType
    },
    construction_sets: {
        displayName: 'Construction Set',
        propName: 'construction_set_id',
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
    name: 'assignObjectModal',
    props: ['type', 'target'],
    data() {
        return {
            currentObject: null
        };
    },
    mounted () {
    },
    computed: {
        ...mapState({
            library: state => state.models.library,
            currentStory: state => state.application.currentSelections.story,
            currentSpace: state => state.application.currentSelections.space,
            currentShading: state => state.application.currentSelections.shading
        }),
        objects () {
            return this.library[this.type];
        },
        displayType () { return map[this.type].displayName; },

        columns () {
            const columns = [];
            this.objects.forEach((o) => {
                Object.keys(o).forEach((k) => {
                    if (!~columns.indexOf(k)) { columns.push(k); }
                })
            });
            return columns;
        }
    },
    methods: {
        assignObjectToTarget () {
            if (!this.currentObject) { return; }

            if (this.target === this.currentStory) {
                var payload = { story: this.currentStory };
                if (this.type === 'windows') {
                    payload.windows = this.currentStory.windows.concat(this.currentObject);
                } else {
                    payload[map[this.type].propName] = this.currentObject.id;
                }
                this.$store.dispatch('models/updateStoryWithData', payload);
            } else if (this.target === this.currentSpace) {
                var payload = { space: this.currentSpace };
                if (this.type === 'daylighting_controls') {
                    payload.daylighting_controls = this.currentSpace.daylighting_controls.concat(this.currentObject);
                } else {
                    payload[map[this.type].propName] = this.currentObject.id;
                }
                this.$store.dispatch('models/updateSpaceWithData', payload);
            } else if (this.target === this.currentShading) {
                var payload = { shading: this.currentShading };
                if (this.type === 'daylighting_controls') {
                    payload.daylighting_controls = this.currentShading.daylighting_controls.concat(this.currentObject);
                } else {
                    payload[map[this.type].propName] = this.currentObject.id;
                }
                this.$store.dispatch('models/updateShadingWithData', payload);
            }
            this.$emit('close');
        }
    }
}
</script>

<style lang="scss" scoped>
@import "./../../scss/config";
table {
    border-spacing: 0;
    width: 100%;
    thead tr {
        height: 3rem;
        th {
            border-bottom: 2px solid $gray-medium-light;
        }
    }
    tbody tr {
        height: 2rem;
        &:nth-of-type(odd) {
            background-color: $gray-medium-dark;
        }
        &.active {
            color: $primary;
        }
    }
    thead tr, tbody tr {
        th, td {
            text-align: left;
            padding: 0 1rem;
            &:first-child {
                padding-left: 2.5rem;
            }
            &:last-child {
                flex-grow: 2;
            }
        }
    }
}
button#saveAssignment {
    &.disabled {
        border-color: $gray-medium-light;
        cursor: default;
    }
    &.active {
        border-color: $primary;
    }
}

</style>
