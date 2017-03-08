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
            <select v-model='type'>
                <option v-for='(objects, type) in extendedLibrary' :value="type">{{ displayTypeForType(type) }}</option>
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
                <th class="destroy"></th>
            </tr>
        </thead>

        <tbody>
            <tr v-for='object in displayObjects'>
                <td v-for="column in columns">
                    <input :value="displayValueForKey(object, column)" @change="setDisplayValueForKey(object, column, $event.target.value)" :readonly="keyIsReadonly(object, column)">
                </td>
                <td class="destroy">
                    <svg @click="destroyObject(object)" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                        <path d="M137.05 128l75.476-75.475c2.5-2.5 2.5-6.55 0-9.05s-6.55-2.5-9.05 0L128 118.948 52.525 43.474c-2.5-2.5-6.55-2.5-9.05 0s-2.5 6.55 0 9.05L118.948 128l-75.476 75.475c-2.5 2.5-2.5 6.55 0 9.05 1.25 1.25 2.888 1.876 4.525 1.876s3.274-.624 4.524-1.874L128 137.05l75.475 75.476c1.25 1.25 2.888 1.875 4.525 1.875s3.275-.624 4.525-1.874c2.5-2.5 2.5-6.55 0-9.05L137.05 128z"/>
                    </svg>
                </td>
            </tr>
        </tbody>
    </table>

</section>
</template>

<script>
import helpers from './../store/modules/models/helpers'


export default {
    name: 'library',
    data() {
        return {
            type: null
        };
    },
    mounted () {
        this.type = Object.keys(this.extendedLibrary)[0];
    },
    computed: {
        /*
        * deep copy of the state.models.library extended to include stories, spaces, and shading
        */
        extendedLibrary () {
            // create a deep copy to avoid mutating the store's library
            const libClone = JSON.parse(JSON.stringify(this.$store.state.models.library));

            var spaces = [],
                shading = [];
            for (var i = 0; i < this.$store.state.models.stories.length; i++) {
                spaces = spaces.concat(this.$store.state.models.stories[i].spaces);
                shading = shading.concat(this.$store.state.models.stories[i].shading);
            }

            // extend the library clone with stories, spaces, and shading
            return {
                ...libClone,
                stories: this.$store.state.models.stories,
                spaces: spaces,
                shading: shading
            }
        },

        /*
        * return all objects in the extended library for a given type to be displayed at one time
        */
        displayObjects () {
            return this.extendedLibrary[this.type] || [];
        },

        /*
        * return all unique non private keys for the set of displayObjects
        */
        columns () {
            const columns = [];
            this.displayObjects.forEach((o) => {
                Object.keys(o).forEach((k) => {
                    //
                    if (!~columns.indexOf(k) && !this.keyIsPrivate(this.type, k)) { columns.push(k); }
                })
            });
            console.log(columns)
            return columns;
        }
    },
    methods: {
        /*
        * returns the formatted displayName for types defined in the library config
        */
        displayTypeForType (type) { return helpers.map[type].displayName; },

        /*
        * returns the formatted displayName for keys defined in the library config
        * only returns null for private keys - use to check if a key is private
        * custom user defined keys which do not exist in the config keymap will be returned unchanged
        */
        displayNameForKey (key) { return helpers.displayNameForKey(this.type, key); },

        /*
        * returns the readonly/private properties for keys defined in the library config
        * returns false for custom user defined keys
        */
        keyIsReadonly (object, key) { return helpers.keyIsReadonly(this.type, key); },
        keyIsPrivate (object, key) { return helpers.keyIsPrivate(this.type, key); },

        /*
        * return the value for a key on an object
        * invokes the getter method on keys defined in the keymap
        * returns the raw string value at obj[key] for custom user defined keys
        */
        displayValueForKey (object, key) {
            return helpers.displayValueForKey(object, this.$store.state, this.type, key);
        },

        /*
        * dispatch an update action for the supplied object
        * TODO: add setters and validation to the keymap
        */
        setDisplayValueForKey (object, key, value) {
            const result = helpers.setValueForKey(object, this.$store, this.type, key, value);
        },

        /*
        * destroy a library object
        * dispatches destroyStory, destroySpace, destroyShading, or destroyObject depending on the object's type
        */
        destroyObject (object) {
            if (this.type === 'stories' && this.$store.state.models.stories.length > 1) {
                this.$store.dispatch('models/destroyStory', {
                    story: object
                });
                this.currentStory = this.$store.state.models.stories[0];
            } else if (this.type === 'spaces') {
                // look up the story referencing the space to be destroyed
                const storyForSpace = this.$store.state.models.stories.find((story) => {
                    return story.spaces.find(s => s.id === object.id);
                });
                this.$store.dispatch('models/destroySpace', {
                    space: object,
                    story: storyForSpace
                });
            } else if (this.type === 'shading') {
                // look up the story referencing the shading to be destroyed
                const storyForShading = this.$store.state.models.stories.find((story) => {
                    return story.shading.find(s => s.id === object.id);
                });
                this.$store.dispatch('models/destroyShading', {
                    shading: object,
                    story: storyForShading
                });
            } else {
                this.$store.dispatch('models/destroyObject', {
                    object: object
                });
            }
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
                &.destroy {
                    width: 2rem;
                    svg {
                        cursor: pointer;
                        height: 1.25rem;
                        width: 1.5rem;
                        path {
                            fill: $gray-lightest;
                        }
                        &:hover {
                            path {
                                fill: $primary;
                            }
                        }
                    }
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
