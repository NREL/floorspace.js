<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<nav id="navigation">
    <section id="selections">
        <div class='input-select'>
            <select v-model='mode'>
                <option v-for='mode in modes' :value="mode">{{ displayNameForMode(mode) }}</option>
            </select>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 14' height='10px'>
                <path d='M.5 0v14l11-7-11-7z' transform='translate(13) rotate(90)'></path>
            </svg>
        </div>

        <button @click="createItem('stories')">
            <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path d="M208 122h-74V48c0-3.534-2.466-6.4-6-6.4s-6 2.866-6 6.4v74H48c-3.534 0-6.4 2.466-6.4 6s2.866 6 6.4 6h74v74c0 3.534 2.466 6.4 6 6.4s6-2.866 6-6.4v-74h74c3.534 0 6.4-2.466 6.4-6s-2.866-6-6.4-6z"/>
            </svg>
            {{displayNameForMode('stories')}}
        </button>
        <button @click="createItem(mode)">
            <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path d="M208 122h-74V48c0-3.534-2.466-6.4-6-6.4s-6 2.866-6 6.4v74H48c-3.534 0-6.4 2.466-6.4 6s2.866 6 6.4 6h74v74c0 3.534 2.466 6.4 6 6.4s6-2.866 6-6.4v-74h74c3.534 0 6.4-2.466 6.4-6s-2.866-6-6.4-6z"/>
            </svg>
            {{displayNameForMode(mode)}}
        </button>
    </section>

    <section id="breadcrumbs">
        <span @click="clearSubSelections">
            {{ currentStory.name }}
            <template v-if="mode !== 'stories' && currentSubSelection">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 14"><path d="M.5 0v14l11-7-11-7z"/></svg>
                {{ currentSubSelection.name }}
            </template>
        </span>

    </section>

    <div id="navigation-search" class="input-text">
        <label>Search</label>
        <input v-model="search">
    </div>

    <div id="list">
        <section id="story-list">
            <div v-for="item in stories" :key="item.id" :class="{ active: currentStory && currentStory.id === item.id }" @click="selectItem(item, 'stories')" :style="{'background-color': item && item.color }">
                {{item.name}}
                <svg @click="destroyItem(item)" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                    <path d="M137.05 128l75.476-75.475c2.5-2.5 2.5-6.55 0-9.05s-6.55-2.5-9.05 0L128 118.948 52.525 43.474c-2.5-2.5-6.55-2.5-9.05 0s-2.5 6.55 0 9.05L118.948 128l-75.476 75.475c-2.5 2.5-2.5 6.55 0 9.05 1.25 1.25 2.888 1.876 4.525 1.876s3.274-.624 4.524-1.874L128 137.05l75.475 75.476c1.25 1.25 2.888 1.875 4.525 1.875s3.275-.624 4.525-1.874c2.5-2.5 2.5-6.55 0-9.05L137.05 128z"/>
                </svg>
            </div>
        </section>

        <section id="subselection-list">
            <div v-for="item in items" :key="item.id" :class="{ active: currentSubSelection && currentSubSelection.id === item.id }" @click="selectItem(item, mode)" :style="{'background-color': item && currentSubSelection && currentSubSelection.id === item.id ? item.color : ''}">
                <span :style="{'background-color': item && item.color }"></span>
                {{item.name}}
                <svg @click="destroyItem(item)" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                    <path d="M137.05 128l75.476-75.475c2.5-2.5 2.5-6.55 0-9.05s-6.55-2.5-9.05 0L128 118.948 52.525 43.474c-2.5-2.5-6.55-2.5-9.05 0s-2.5 6.55 0 9.05L118.948 128l-75.476 75.475c-2.5 2.5-2.5 6.55 0 9.05 1.25 1.25 2.888 1.876 4.525 1.876s3.274-.624 4.524-1.874L128 137.05l75.475 75.476c1.25 1.25 2.888 1.875 4.525 1.875s3.275-.624 4.525-1.874c2.5-2.5 2.5-6.55 0-9.05L137.05 128z"/>
                </svg>
            </div>
        </section>
    </div>

</nav>
</template>

<script>
import { mapState } from 'vuex'
import modelHelpers from './../store/modules/models/helpers'
import applicationHelpers from './../store/modules/application/helpers'

export default {
    name: 'navigation',
    data() {
        return {
            search: ''
        };
    },
    mounted () {
        this.mode = 'spaces';
    },
    computed: {
        /*
        * arrays of all stories, building_units, space_types, and thermal_zones (top level)
        */
        ...mapState({
            building_units: state => state.models.library.building_units,
            space_types: state => state.models.library.space_types,
            thermal_zones: state => state.models.library.thermal_zones,
        }),

        stories() { return this.$store.state.models.stories.filter(s => ~s.name.toLowerCase().indexOf(this.search.toLowerCase())); },

        // spaces and shading for currently selected story
        spaces () { return this.currentStory.spaces; },
        shading () { return this.currentStory.shading; },

        // list items to display for current mode
        items () {
            var items = [];
            switch (this.mode) {
                case 'stories':
                    items = this.stories;
                    break;
                case 'spaces':
                    items = this.spaces;
                    break;
                case 'shading':
                    items = this.shading;
                    break;
                case 'building_units':
                    items = this.building_units;
                    break;
                case 'thermal_zones':
                    items = this.thermal_zones;
                    break;
                case 'space_types':
                    items = this.space_types;
                    break;
            }
            return items.filter(i => ~i.name.toLowerCase().indexOf(this.search.toLowerCase()));
        },
        mode: {
            get () { return this.$store.state.application.currentSelections.mode; },
            set (mode) { this.$store.dispatch('application/setApplicationMode', { 'mode': mode }); }
        },
        modes () { return this.$store.state.application.modes; },

        /*
        * current selection getters and setters
        * these dispatch actions to update the data store when a new item is selected
        */
        currentStory: {
            get () { return this.$store.state.application.currentSelections.story; },
            set (item) { this.$store.dispatch('application/setCurrentStory', { 'story': item }); }
        },
        currentSpace: {
            get () { return this.$store.state.application.currentSelections.space; },
            set (item) { this.$store.dispatch('application/setCurrentSpace', { 'space': item }); }
        },
        currentShading: {
            get () { return this.$store.state.application.currentSelections.shading; },
            set (item) { this.$store.dispatch('application/setCurrentShading', { 'shading': item }); }
        },
        currentThermalZone: {
            get () { return this.$store.state.application.currentSelections.thermal_zone; },
            set (item) { this.$store.dispatch('application/setCurrentThermalZone', { 'thermal_zone': item }); }
        },
        currentBuildingUnit: {
            get () { return this.$store.state.application.currentSelections.building_unit; },
            set (item) { this.$store.dispatch('application/setCurrentBuildingUnit', { 'building_unit': item }); }
        },
        currentSpaceType: {
            get () { return this.$store.state.application.currentSelections.space_type; },
            set (item) { this.$store.dispatch('application/setCurrentSpaceType', { 'space_type': item }); }
        },
        currentSubSelection () {
            switch (this.mode) {
                case 'stories':
                    return this.currentStory;
                case 'spaces':
                    return this.currentSpace;
                case 'shading':
                    return this.currentShading;
                case 'building_units':
                    return this.currentBuildingUnit;
                case 'thermal_zones':
                    return this.currentThermalZone;
                case 'space_types':
                    return this.currentSpaceType;
            }
        }

    },
    methods: {
        // initialize an empty story, space, shading, building_unit, or thermal_zone depending on the selected mode
        createItem (mode) {
            switch (mode) {
                case 'stories':
                    this.$store.dispatch('models/initStory');
                    break;
                case 'spaces':
                    this.$store.dispatch('models/initSpace', {
                        story: this.$store.state.application.currentSelections.story
                    });
                    break;
                case 'shading':
                    this.$store.dispatch('models/initShading', {
                        story: this.$store.state.application.currentSelections.story
                    });
                    break;
                case 'building_units':
                case 'thermal_zones':
                case 'space_types':
                    const newObject = new modelHelpers.map[this.mode].init(this.displayNameForMode(this.mode) + " " + (1 + this.items.length));
                    this.$store.dispatch('models/createObjectWithType', {
                        type: this.mode,
                        object: newObject
                    });
                    break;
            }

            this.selectItem(this.items[this.items.length - 1]);
        },

        /*
        * dispatch an action to destroy the currently selected item
        */
        destroyItem (item) {
            switch (this.mode) {
                case 'stories':
                    if (this.stories.length <= 1) { return; }
                    this.$store.dispatch('models/destroyStory', {
                        story: item
                    });
                    this.currentStory = this.stories[0];
                    break;
                case 'spaces':
                    this.$store.dispatch('models/destroySpace', {
                        space: item,
                        story: this.$store.state.application.currentSelections.story
                    });
                    break;
                case 'shading':
                    this.$store.dispatch('models/destroyShading', {
                        shading: item,
                        story: this.$store.state.application.currentSelections.story
                    });
                    break;
                case 'building_units':
                case 'thermal_zones':
                case 'space_types':
                    this.$store.dispatch('models/destroyObject', { object: item });
                    break;
            }
        },
        selectItem (item, mode) {
            switch (mode) {
                case 'stories':
                    this.currentStory = item;
                    break;
                case 'spaces':
                    this.currentSpace = (this.currentSpace && this.currentSpace.id === item.id) ? null : item;
                    break;
                case 'shading':
                    this.currentShading = (this.currentShading && this.currentShading.id === item.id) ? null : item;
                    break;
                case 'building_units':
                    this.currentBuildingUnit = (this.currentBuildingUnit && this.currentBuildingUnit.id === item.id) ? null : item;
                    break;
                case 'thermal_zones':
                    this.currentThermalZone = (this.currentThermalZone && this.currentThermalZone.id === item.id) ? null : item;
                    break;
                case 'space_types':
                    this.currentSpaceType = (this.currentSpaceType && this.currentSpaceType.id === item.id) ? null : item;
                    break;
            }
        },
        clearSubSelections () {
            this.currentShading = null;
            this.currentSpace = null;
            this.currentBuildingUnit = null;
            this.currentThermalZone = null;
            this.currentSpaceType = null;
        },

        // display name for library type (mode) selected
        displayNameForMode (mode) { return applicationHelpers.displayNameForMode(mode); },
    }
}
</script>

<style lang="scss" scoped>
@import "./../scss/config";

#navigation {
    background-color: $gray-medium-dark;
    border-right: 1px solid $gray-darkest;
    font-size: 0.75rem;
    #selections {
        display: flex;
        padding: .25rem;
        justify-content: space-between;
        button {
            display: flex;
            line-height: 1rem;
            svg {
                height: 1rem;
                margin: 0 .25rem 0 -.1rem;
                width: 1rem;
                path {
                    fill: $gray-lightest;
                }
            }
        }
    }

    #navigation-search {
        padding: .5rem 1rem;
        border-bottom: 1px solid $gray-darkest;
    }

    #breadcrumbs, #story-list > div, #subselection-list > div {
        align-items: center;
        display: flex;
        justify-content: space-between;
    }

    #list {
        height: 100%;
        display: flex;
        #story-list {
            border-right: 1px solid $gray-darkest;
            width: 6rem;
        }
        #subselection-list {
            flex-grow: 2;
        }

        #story-list, #subselection-list {
            overflow: scroll;
            height: calc(100% - 5rem);
            > div  {
                border-bottom: 1px solid $gray-darkest;
                cursor: pointer;
                height: 2rem;
                padding: 0 .5rem;
                span {
                    display: inline-block;
                    height: 1rem;
                    width: 1rem;
                }
                &.active {
                    color: $secondary;
                    svg {
                        cursor: pointer;
                        height: 1rem;
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
            }
        }
    }

    #breadcrumbs {
        background-color: $gray-medium-dark;
        border-bottom: 1px solid $gray-darkest;
        border-top: 1px solid $gray-darkest;
        height: 2.5rem;
        padding: 0 1rem;
        span {
            cursor: pointer;
        }
        svg {
            margin: 0 .25rem;
            width: .5rem;
            path {
                fill: $gray-medium-light;
            }
        }
    }

}
</style>
