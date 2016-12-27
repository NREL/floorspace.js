<template>
<nav id="navigation">
    <section id="tabs">
        <span v-for="tab in tabs" :class="currentTab === tab ? 'active' : ''" @click="currentTab = tab">
            {{ tab }}
        </span>

    </section>
    <section id="breadcrumbs">
        {{ currentStory }} > {{ currentThermalZone }} > {{ currentSpace }}

    </section>
    <h2>{{currentTab}}</h2>


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
            tabs: ['stories', 'thermal zones', 'spaces'],
            stories: ['ground level'],
            spaces: ['space 1', 'space 2', 'space 3'],
            thermalZones: ['zone 1', 'zone 2', 'zone 3'],
            currentTab: 'spaces',
            currentStory: '',
            currentThermalZone: '',
            currentSpace: ''
        }
    },
    computed: {
        navItems: function() {
            if (this.currentTab === 'stories') {
                this.currentStory = this.stories[0];
                return this.stories;
            } else if (this.currentTab === 'thermal zones') {
                this.currentThermalZone = this.thermalZones[0];
                return this.thermalZones;
            } else if (this.currentTab === 'spaces') {
                this.currentSpace = this.spaces[0];
                return this.spaces;
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

    #tabs {
        border-bottom: 1px solid $gray-darkest;
        display: flex;
        span {
            border-right: 1px solid $gray-darkest;
            display: inline-block;
            font-size: 0.625rem;
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
