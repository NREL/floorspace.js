<template>
<nav id="navigation">
    <section id="tabs">
        <span :class="tab === 'stories' ? 'active' : ''" @click="tab = 'stories'">Stories</span>
        <span :class="tab === 'thermalZones' ? 'active' : ''" @click="tab = 'thermalZones'">Thermal Zones</span>
        <span :class="tab === 'spaces' ? 'active' : ''" @click="tab = 'spaces'">Spaces</span>
    </section>
    <section id="breadcrumbs">
        ... > {{ currentStory }} > {{ currentThermalZone }} > {{ currentSpace }}

    </section>
    <h2>{{tab}}</h2>


    <div v-for="item in navItems" :class="currentItem === item ? 'active' : ''" @click="currentItem = item">
        {{item}}
    </div>
</nav>
</template>

<script>
export default {
    name: 'navigation',
    data() {
        return {
            tab: 'stories',
            selectedItem: '',

            // this shouldn't be arrays - this should be a heirarchical structure
            stories: ['ground level'],
            spaces: ['space 1', 'space 2', 'space 3'],
            thermalZones: ['zone 1', 'zone 2', 'zone 3'],

            currentStory: '',
            currentThermalZone: '',
            currentSpace: ''
        }
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
    font-size: 0.625rem;
    #breadcrumbs {
        background-color: $gray-medium-light;
        padding: .5rem;
    }
    #tabs {
        border-bottom: 1px solid $gray-darkest;
        display: flex;
        span {
            border-right: 1px solid $gray-darkest;
            display: inline-block;
            padding: .5rem;
            text-transform: uppercase;
        }
    }
    div {
        width: 100%;
        padding: 0.75rem;
    }

    .active {
        background-color: $gray-medium-light;
    }
}
</style>
