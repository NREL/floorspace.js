<template>
<nav id="navigation">
    <section id="tabs">
        <span class="active">Stories</span>
        <span>Thermal Zones</span>
        <span>Spaces</span>
    </section>
    <h1>Navigation</h1>
    <div class="active">item</div>
    <div>item</div>
    <div>item</div>
    <div>item</div>
    <div>item</div>
    <div>item</div>
</nav>
</template>

<script>
export default {
    name: 'navigation',
    data() {
        return {}
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
            font-size: 10px;
            padding: .5rem;
            text-transform: uppercase;

            // &:last-child{
            //     border: 0;
            // }
        }
    }
    div {
        width: 100%;
        padding: 0.75rem;
        // &:nth-child(odd)  {
        //     background-color: $gray-medium;
        // }
    }

    .active {
        background-color: $gray-medium-light;
    }
}
</style>
