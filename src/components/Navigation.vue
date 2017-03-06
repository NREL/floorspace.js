<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<nav id="navigation">
    <section class="tabs">
        <span :class="tab === 'stories' ? 'active' : ''" @click="tab = 'stories'">Stories</span>
        <span :class="tab === 'spaces' ? 'active' : ''" @click="tab = 'spaces'">Spaces</span>
        <span :class="tab === 'shading' ? 'active' : ''" @click="tab = 'shading'">Shading</span>
    </section>

    <section id="breadcrumbs">
        <span @click="clearSpaceAndShading">
            {{ currentStory.name }}
            <template v-if="(tab === 'shading' && currentShading) || (tab === 'spaces' && currentSpace)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 14"><path d="M.5 0v14l11-7-11-7z"/></svg>
                {{ tab === 'shading' ? currentShading.name : currentSpace.name }}
            </template>
        </span>

        <button @click="addItem" id="new-item" height="50" viewBox="0 0 256 256" width="50" xmlns="http://www.w3.org/2000/svg">
            New {{displayType}}
        </button>
    </section>

    <section id="list">
        <div v-for="item in items" :key="item.id" :class="(currentSpace === item || currentStory === item || currentShading === item) ? 'active' : ''" @click="selectItem(item)">
            {{item.name}}
            <svg @click="destroyItem" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path d="M137.05 128l75.476-75.475c2.5-2.5 2.5-6.55 0-9.05s-6.55-2.5-9.05 0L128 118.948 52.525 43.474c-2.5-2.5-6.55-2.5-9.05 0s-2.5 6.55 0 9.05L118.948 128l-75.476 75.475c-2.5 2.5-2.5 6.55 0 9.05 1.25 1.25 2.888 1.876 4.525 1.876s3.274-.624 4.524-1.874L128 137.05l75.475 75.476c1.25 1.25 2.888 1.875 4.525 1.875s3.275-.624 4.525-1.874c2.5-2.5 2.5-6.55 0-9.05L137.05 128z"/>
            </svg>
        </div>
    </section>

</nav>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'navigation',
    data() {
        return {
            tab: null
        };
    },
    mounted () {
        if (this.currentSpace) {
            this.tab = 'spaces';
        } else if (this.currentShading) {
            this.tab = 'shading';
        } else {
            this.tab = 'stories';
        }
    },
    computed: {
        // all stories
        ...mapState({ stories: state => state.models.stories }),
        // spaces for the currently selected story
        spaces () { return this.currentStory.spaces; },
        // shading for the currently selected story
        shading () { return this.currentStory.shading; },
        items () {
            if (this.tab === 'stories') {
                return this.stories;
            } else if (this.tab === 'spaces') {
                return this.spaces;
            } else if (this.tab === 'shading') {
                return this.shading;
            }
        },
        displayType () {
            if (this.tab === 'stories') {
                return "Story";
            } else if (this.tab === 'spaces') {
                return "Space";
            } else if (this.tab === 'shading') {
                return "Shading";
            }
        },

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
        }
    },
    methods: {
        // initialize an empty story, space, or shading depending on the selected tab
        addItem () {
            if (this.tab === 'stories') {
                this.$store.dispatch('models/initStory');
            } else if (this.tab === 'spaces') {
                this.$store.dispatch('models/initSpace', {
                    story: this.$store.state.application.currentSelections.story
                });
            } else if (this.tab === 'shading') {
                this.$store.dispatch('models/initShading', {
                    story: this.$store.state.application.currentSelections.story
                });
            }

            this.selectItem(this.items[this.items.length - 1]);
        },
        destroyItem () {
            if (this.tab === 'stories' && this.stories.length > 1) {
                this.$store.dispatch('models/destroyStory', {
                    story: this.$store.state.application.currentSelections.story
                });
                this.currentStory = this.stories[0];
            } else if (this.tab === 'spaces' && this.spaces.length > 1) {
                this.$store.dispatch('models/destroySpace', {
                    space: this.$store.state.application.currentSelections.space,
                    story: this.$store.state.application.currentSelections.story
                });
                this.currentSpace = this.spaces[0];
            } else if (this.tab === 'shading' && this.shading.length > 1) {
                this.$store.dispatch('models/destroyShading', {
                    shading: this.$store.state.application.currentSelections.shading,
                    story: this.$store.state.application.currentSelections.story
                });

            }
        },
        selectItem (item) {
            if (this.tab === 'stories') {
                this.currentStory = item;
            } else if (this.tab === 'spaces') {
                this.currentSpace = (this.currentSpace && this.currentSpace.id === item.id) ? null : item;
            } else if (this.tab === 'shading') {
                this.currentShading = (this.currentShading && this.currentShading.id === item.id) ? null : item;
            }
        },
        clearSpaceAndShading () {
            this.currentShading = null;
            this.currentSpace = null;

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
