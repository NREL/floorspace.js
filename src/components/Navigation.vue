<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->


<template>
<nav id="navigation">
    <div class="input-text">
        <input v-model="searchTerm" placeholder="Search">
    </div>

    <section id="tabs">
        <span :class="tab === 'stories' ? 'active' : ''" @click="tab = 'stories'">Stories</span>
        <span :class="tab === 'spaces' ? 'active' : ''" @click="tab = 'spaces'">Spaces</span>
    </section>

    <section id="breadcrumbs" v-show="currentStory || currentSpace">
        <span>{{ currentStory.name }}</span>
        <span v-if="currentSpace">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 14"><path d="M.5 0v14l11-7-11-7z"/></svg>
            {{ currentSpace.name }}
        </span>

        <svg @click="addItem" id="new-item" height="50" viewBox="0 0 256 256" width="50" xmlns="http://www.w3.org/2000/svg">
            <path d="M208 122h-74V48c0-3.534-2.466-6.4-6-6.4s-6 2.866-6 6.4v74H48c-3.534 0-6.4 2.466-6.4 6s2.866 6 6.4 6h74v74c0 3.534 2.466 6.4 6 6.4s6-2.866 6-6.4v-74h74c3.534 0 6.4-2.466 6.4-6s-2.866-6-6.4-6z"/>
        </svg>
    </section>

    <div v-for="item in (tab === 'spaces' ? spaces : stories)" :key="item.id" :class="(currentSpace === item || currentStory === item ) ? 'active' : ''" @click="selectItem(item)">
        <div class="input-text">
            <input @input="setName(item)" v-model="item.name">
        </div>
    </div>

</nav>
</template>

<script>
export default {
    name: 'navigation',
    data() {
        var data =  {
            tab: 'stories',
            searchTerm: ''
        };
        return data;
    },
    computed: {
        // all stories, spaces only for the currently selected story
        stories() { return this.$store.state.stories; },
        spaces () { return this.currentStory.spaces; },

        // currently selected story - this is always set
        currentStory: {
            get () { return this.$store.getters.currentStory; },
            set (item) {
                this.$store.commit('setCurrentSelectionsStoryId', {
                    'story_id': item.id
                });
            }
        },
        // currently selected space, may not be set
        currentSpace: {
            get () { return this.$store.getters.currentSpace; },
            set (item) {
                this.$store.commit('setCurrentSelectionsSpaceId', {
                    'space_id': item.id
                });
            }
        }
    },
    methods: {
        // initialize an empty story or space depending on the selected tab
        addItem () {
            this.$store.commit(this.tab === 'stories' ? 'initStory' : 'initSpace' );
        },
        // update the currentStory or currentSpace
        selectItem (item) {
            if (this.tab === 'stories') {
                this.currentStory = item;
            } else if (this.tab === 'spaces') {
                this.currentSpace = item;
            }
        },
        setName(item) {
            this.$store.commit(this.tab === 'stories' ? 'updateStoryWithData' : 'updateSpaceWithData', {
                'id': item.id,
                'name': item.name
            });
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

    #tabs {
        border-bottom: 1px solid $gray-darkest;
        display: flex;
        font-size: 0.625rem;
        span {
            border-right: 1px solid $gray-darkest;
            display: inline-block;
            padding: .5rem;
            text-transform: uppercase;
        }
    }

    .active {
        background-color: $gray-medium-light;
    }

    #breadcrumbs, div {
        align-items: center;
        display: flex;
        height: 2.5rem;
        padding: 0 1rem;
    }

    #breadcrumbs {
        background-color: $gray-medium-light;
        border-bottom: 1px solid $gray-medium-dark;
        svg {
            margin: 0 0rem 0 .5rem;
            width: .5rem;
            path {
                fill: $gray-medium-dark;
            }
        }
        #new-item {
            width: 1.5rem;
            >path {
                fill: $gray-light;
            }
        }
    }


}
</style>
