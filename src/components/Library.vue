<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the 'OpenStudio' trademark, 'OS', 'os', or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<section id='library'>
    <header>
        <h1>Object Library</h1>
        <div class='input-select'>
            <label>Type</label>
            <select v-model='displayType'>
                <option v-for='(objects, type) in libraryObjects'>{{ displayTypeForType(type) }}</option>
            </select>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 14' height='10px'>
                <path d='M.5 0v14l11-7-11-7z' transform='translate(13) rotate(90)'></path>
            </svg>
        </div>
    </header>

    <table class="table">
        <thead>
            <tr>
                <th v-for="column in columns">
                    <span>{{displayNameForKey(column)}}</span>
                </th>
            </tr>
        </thead>

        <tbody>
            <tr v-for='object in objects' @click="currentObject = object" :class="currentObject === object ? 'active' : ''">
                <td v-for="column in columns">
                    <input :value="displayValueForKey(object, column)" @change="setDisplayValueForKey(object, column, $event.target.value)" :readonly="valueForKeyIsReadonly(object, column)">
                </td>
            </tr>
        </tbody>
    </table>

</section>
</template>

<script>
import { mapState } from 'vuex'
import factory from './../store/modules/models/factory'
import helpers from './../store/modules/models/helpers'


export default {
    name: 'library',
    data() {
        return {
            currentObject: null,
            displayType: null,
            objectName: null,
            fields: []
        };
    },
    mounted () {
        this.displayType = this.displayTypeForType(Object.keys(this.libraryObjects)[0]);
    },
    computed: {
        libraryObjects () {
            const lib = JSON.parse(JSON.stringify(this.$store.state.models.library));
            lib.stories = this.$store.state.models.stories;
            lib.spaces = [];

            for (var i = 0; i < this.$store.state.models.stories.length; i++) {
                lib.spaces = lib.spaces.concat(this.$store.state.models.stories[i].spaces);
            }
            return lib;
        },
        objects () {
            return this.libraryObjects[this.type] || [];
        },
        columns () {
            const columns = [];
            this.objects.forEach((o) => {
                Object.keys(o).forEach((k) => {
                    if (!~columns.indexOf(k) && this.displayNameForKey(k)) { columns.push(k); }
                })
            });
            return columns;
        },
        type () {
            return Object.keys(helpers.map).find(k => helpers.map[k].displayName === this.displayType);
        }
    },
    methods: {
        displayTypeForType (type) { return helpers.map[type].displayName; },
        displayNameForKey (key) { return helpers.displayNameForKey(this.type, key); },
        displayValueForKey (object, key) {
            return helpers.displayValueForKey(object, this.$store.state, this.type, key);
        },
        valueForKeyIsReadonly (object, key) {
            return helpers.valueForKeyIsReadonly(this.type, key);
        },
        setDisplayValueForKey (object, key, value) {
            console.log('models/updateObjectWithData', {
                object: object,
                [key]: value
            });
            this.$store.dispatch('models/updateObjectWithData', {
                object: object,
                [key]: value
            });
        },
        addField () {
            this.fields.push({
                label: '',
                value: ''
            });
        },
        initObject () {
            var newObject = new helpers.map[this.type].init(this.objectName);
            this.fields.forEach((field) => {
                newObject[field.label] = field.value;
            })
            this.$store.dispatch('models/initObjectWithType', {
                type: this.type,
                object: newObject
            });
        }
    }
}
</script>

<style lang='scss' scoped>
@import './../scss/config';
#library {
    background-color: $gray-darkest;
    border-top: 1px solid $gray-medium;
    overflow: scroll;
    position: relative;
    header {
        display: flex;
        padding: 0 2.5rem;
        h1 {
            flex-grow: 3;
        }
        .input-select {
            float: right;
            margin-right: 2.5rem;
            width: 10rem;
        }
    }

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
                input {
                    background-color: inherit;
                    border: none;
                    color: $gray-lightest;
                    font-size: 1rem;
                }
            }
        }
    }
}

</style>
