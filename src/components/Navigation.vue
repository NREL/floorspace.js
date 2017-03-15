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
            <!-- <label>Type</label> -->
            <select v-model='currentStory'>
                <option v-for='story in stories' :value="story">{{ story.name }}</option>
            </select>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 14' height='10px'>
                <path d='M.5 0v14l11-7-11-7z' transform='translate(13) rotate(90)'></path>
            </svg>
        </div>

        <div class='input-select'>
            <label>SubUnit</label>
            <select v-model='tab'>
                <option value>None</option>
                <option v-for='(displayName, name) in tabs' :value="name">{{ displayName }}</option>
            </select>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 14' height='10px'>
                <path d='M.5 0v14l11-7-11-7z' transform='translate(13) rotate(90)'></path>
            </svg>
        </div>
        <!--
        <span :class="{ active: tab === 'stories' }" @click="tab = 'stories'">Story</span>
        <span :class="{ active: tab === 'spaces' }" @click="tab = 'spaces'">Spaces</span>
        <span :class="{ active: tab === 'shading' }" @click="tab = 'shading'">Shading</span>
        <span :class="{ active: tab === 'building_units' }" @click="tab = 'building_units'">Building Unit</span>
        <span :class="{ active: tab === 'thermal_zones' }" @click="tab = 'thermal_zones'">Thermal Zone</span>
        <span :class="{ active: tab === 'space_types' }" @click="tab = 'space_types'">Space Type</span>
        -->
    </section>

    <section id="breadcrumbs">
        <span @click="clearSubSelections">
            {{ currentStory.name }}
            <template v-if="tab !== 'stories' && currentSubSelection">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 14"><path d="M.5 0v14l11-7-11-7z"/></svg>
                {{ currentSubSelection.name }}
            </template>
        </span>

        <button @click="createItem" id="new-item" height="50" viewBox="0 0 256 256" width="50" xmlns="http://www.w3.org/2000/svg">
            New {{displayType}}
        </button>
    </section>

    <section id="list">
        <div v-for="item in items" :key="item.id" :class="{ active: currentSubSelection && currentSubSelection.id === item.id }" @click="selectItem(item)">
            {{item.name}}
            <svg @click="destroyItem(item)" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path d="M137.05 128l75.476-75.475c2.5-2.5 2.5-6.55 0-9.05s-6.55-2.5-9.05 0L128 118.948 52.525 43.474c-2.5-2.5-6.55-2.5-9.05 0s-2.5 6.55 0 9.05L118.948 128l-75.476 75.475c-2.5 2.5-2.5 6.55 0 9.05 1.25 1.25 2.888 1.876 4.525 1.876s3.274-.624 4.524-1.874L128 137.05l75.475 75.476c1.25 1.25 2.888 1.875 4.525 1.875s3.275-.624 4.525-1.874c2.5-2.5 2.5-6.55 0-9.05L137.05 128z"/>
            </svg>
        </div>
    </section>

</nav>
</template>

<script>
import { mapState } from 'vuex'
import helpers from './../store/modules/models/helpers'

export default {
    name: 'navigation',
    data() {
        return {
            tab: null,
            tabs: {
                spaces: "Space",
                shading: "Shading",
                building_units: "Building Unit",
                thermal_zones: "Thermal Zone",
                space_types: "Space Type"
            }
        };
    },
    mounted () {
        if (this.currentSpace) {
            this.tab = 'spaces';
        } else if (this.currentShading) {
            this.tab = 'shading';
        } else if (this.currentBuildingUnit) {
            this.tab = 'building_units';
        } else if (this.currentThermalZone) {
            this.tab = 'thermal_zones';
        } else if (this.currentSpaceType) {
            this.tab = 'space_types';
        } else {
            this.tab = 'stories';
        }
    },
    computed: {
        /*
        * arrays of all stories, building_units, space_types, and thermal_zones (top level)
        * TODO: filter out items not referenced by current story
        */
        ...mapState({
            stories: state => state.models.stories,
            building_units: state => state.models.library.building_units,
            space_types: state => state.models.library.space_types,
            thermal_zones: state => state.models.library.thermal_zones,
        }),
        // spaces and shading for currently selected story
        spaces () { return this.currentStory.spaces; },
        shading () { return this.currentStory.shading; },

        // display name for library type (tab) selected
        displayType () { return this.tab === "stories" ? 'Story': this.tabs[this.tab]; },

        // list items to display for current tab
        items () {
            switch (this.tab) {
                case 'stories':
                    return this.stories;
                case 'spaces':
                    return this.spaces;
                case 'shading':
                    return this.shading;
                case 'building_units':
                    return this.building_units;
                case 'thermal_zones':
                    return this.thermal_zones;
                case 'space_types':
                    return this.space_types;
            }
            return [];
        },

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
            switch (this.tab) {
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
        // initialize an empty story, space, shading, building_unit, or thermal_zone depending on the selected tab
        createItem () {
            switch (this.tab) {
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
                    const newObject = new helpers.map[this.tab].init(this.displayType + " " + (1 + this.items.length));
                    this.$store.dispatch('models/createObjectWithType', {
                        type: this.tab,
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
            switch (this.tab) {
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
        selectItem (item) {
            switch (this.tab) {
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
        }
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
    }
    #breadcrumbs, #list > div {
        align-items: center;
        display: flex;
        justify-content: space-between;
        padding: 0 1rem;
    }

    #list {
        overflow: scroll;
        height: calc(100% - 4.25rem);
        > div  {
            cursor: pointer;
            height: 2rem;
            &.active {
                background-color: $gray-medium-light;
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

    #breadcrumbs {
        background-color: $gray-medium-dark;
        border-bottom: 1px solid $gray-darkest;
        border-top: 1px solid $gray-darkest;
        height: 2.5rem;
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
