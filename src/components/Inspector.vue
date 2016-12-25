<template>
<section id="inspector">
    <h1>Inspector</h1>
</section>
</template>

<script>
export default {
    name: 'inspector',
    data() {
        return {
            msg: 'Welcome to GeoSketch'
        }
    }
}
</script>

<style lang="scss" scoped>
@import "./../scss/config";
    #inspector {
        background-color: $gray-dark;
        border-left: 1px solid $gray-darkest;
    }
</style>
