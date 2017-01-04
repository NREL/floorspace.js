<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->


<template>
<nav id="navigation">
    <section id="tabs">
        <span :class="tab === 'stories' ? 'active' : ''" @click="tab = 'stories'">Stories</span>
        <span :class="tab === 'thermalZones' ? 'active' : ''" @click="tab = 'thermalZones'">Thermal Zones</span>
        <span :class="tab === 'spaces' ? 'active' : ''" @click="tab = 'spaces'">Spaces</span>
    </section>
    <section id="breadcrumbs" v-show="currentStory || currentThermalZone || currentSpace">
        <span v-if="currentStory">
            {{ currentStory }}
        </span>
        <span v-if="currentStory && currentThermalZone">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 14"><path d="M.5 0v14l11-7-11-7z"/></svg>
            {{ currentThermalZone }}
        </span>
        <span v-if="currentStory && currentThermalZone && currentSpace">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 14"><path d="M.5 0v14l11-7-11-7z"/></svg>
            {{ currentSpace }}
        </span>
    </section>

    <div v-for="item in navItems" :class="currentItem === item ? 'active' : ''" @click="currentItem = item">
        {{item}}
    </div>
</nav>
</template>

<script>
export default {
    name: 'navigation',
    data() {
        var data =  {
            tab: 'stories',
            selectedItem: '',
            // this shouldn't be arrays - this should be a heirarchical structure
            stories: ['ground level'],
            spaces: ['space 1', 'space 2', 'space 3'],
            thermalZones: ['zone 1', 'zone 2', 'zone 3'],
        };
        data.currentStory = data.stories[0];
        data.currentThermalZone = data.thermalZones[0];
        data.currentSpace = data.spaces[0];

        return data;
    },
    computed: {
        navItems: function() {
            return this.$data[this.tab];
        },
        currentItem: {
            // defaults to first item
            get: function() {
                if (this.tab === 'stories') {
                    return this.currentStory;
                } else if (this.tab === 'thermalZones') {
                    return this.currentThermalZone;
                } else if (this.tab === 'spaces') {
                    return this.currentSpace;
                }
            },
            set: function (item) {
                if (this.tab === 'stories') {
                    this.currentStory = this.currentStory === item ? null : item;
                } else if (this.tab === 'thermalZones') {
                    this.currentThermalZone = this.currentThermalZone === item ? null : item;
                } else if (this.tab === 'spaces') {
                    this.currentSpace = this.currentSpace === item ? null : item;
                }
            }
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
    }
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
}
</style>
