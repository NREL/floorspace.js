<template>
        <nav id="toolbar">
            <div id="zoom">
                <span>zoom</span>
                <input type="text" value="100%">
               <!-- <svg height="256" viewBox="0 0 256 256" width="256" xmlns="http://www.w3.org/2000/svg"><path d="M208 122h-74V48c0-3.534-2.466-6.4-6-6.4s-6 2.866-6 6.4v74H48c-3.534 0-6.4 2.466-6.4 6s2.866 6 6.4 6h74v74c0 3.534 2.466 6.4 6 6.4s6-2.866 6-6.4v-74h74c3.534 0 6.4-2.466 6.4-6s-2.866-6-6.4-6z"/></svg>

               <svg xmlns="http://www.w3.org/2000/svg" height="256" viewBox="0 0 256 256" width="256"><path d="M208 134.4H48c-3.534 0-6.4-2.866-6.4-6.4s2.866-6.4 6.4-6.4h160c3.534 0 6.4 2.866 6.4 6.4s-2.87 6.4-6.4 6.4z"/></svg> -->
            </div>
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
    align-items: center;
    background-color: $gray-dark;
    border-bottom: 1px solid $gray-darkest;
    display: flex;
    padding: 0 8.75rem;
    #zoom {
        span {
            text-transform: uppercase;
            font-size: 0.625rem;
        }
        input {
            background-color: $gray-darkest;
            color: $gray-light;
            border: 1px solid $gray-light;
            border-radius: 1rem;
            padding: 0.25rem 1rem;
            margin: 0 0.5rem;
            width: 2rem;
        }
        svg {
            height: 3rem;
            width: 2.5rem;
            path {
                fill: $gray-light;
            }
        }
    }
}
</style>
