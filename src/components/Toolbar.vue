<template>
        <nav id="toolbar">
                <p>Toolbar</p>
        </nav>
</template>

<script>
export default {
    name: 'toolbar',
    data() {
        return {
            msg: 'Welcome to GeoSketch'
        }
    }
}
</script>

<style lang="scss" scoped>
@import "./../scss/config";

#toolbar {
    background-color: $gray-dark;
    border-bottom: 1px solid $gray-darkest;
    overflow-y: hidden;
}
</style>
