<template>
        <nav id="toolbar">
            <div id="zoom">
                <div class="input-number">

                    <label>zoom</label>
                    <input type="number" value="100%">
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 14">
                            <path d="M.5 0v14l11-7-11-7z" transform="translate(13) rotate(90)"></path>
                            <path d="M.5 0v14l11-7-11-7z" transform="translate(0 15) rotate(-90)"></path>
                        </svg>
                    </span>
                </div>
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
    background-color: $gray-medium;
    border-bottom: 1px solid $gray-darkest;
    display: flex;
    padding: 0 8.75rem;
    #zoom {


        .input-number {
            position: relative;
            span {
                background-color: $gray-medium-light;
                border: 1px solid $gray-darkest;
                border-radius: 0 1rem 1rem 0;


                position: absolute;
                top:0;
                right: 1px;
                width: 1.5rem;
                height: .75rem;
                padding: 0.25rem 0;

                svg {
                    height: .5rem;
                    width: .5rem;
                    path {
                        fill: $gray-light;
                    }
                }
            }

            label {
                text-transform: uppercase;
                font-size: 0.625rem;
            }
            input {
                background-color: $gray-medium-dark;
                border: 1px solid $gray-darkest;
                border-radius: 1rem;
                color: $gray-light;
                height: .75rem;
                padding: 0.25rem 1rem;
                margin: 0 0.5rem;
                width: 2rem;
            }
            input:focus {
                outline: none;
            }
            input[type=number]::-webkit-inner-spin-button,
            input[type=number]::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
        }

    }
}
</style>
