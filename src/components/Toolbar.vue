<template>
        <nav id="toolbar">
            <section class="tools">
                the actual tools
            </section>
            <section class="settings">
                <div id="zoom">
                    <div class="input-number">
                        <label>zoom</label>
                        <input type="text" :value="100 | percentage">
                        <span class="arrows">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 14">
                                <path d="M.5 0v14l11-7-11-7z" transform="translate(0 15) rotate(-90)"></path>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 14">
                                <path d="M.5 0v14l11-7-11-7z" transform="translate(13) rotate(90)"></path>
                            </svg>
                        </span>
                    </div>
               </div>
               <div class="input-number">
                   <label>zoom</label>
                   <input type="text" :value="100 | percentage">
                   <span class="arrows">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 14">
                           <path d="M.5 0v14l11-7-11-7z" transform="translate(0 15) rotate(-90)"></path>
                       </svg>
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 14">
                           <path d="M.5 0v14l11-7-11-7z" transform="translate(13) rotate(90)"></path>
                       </svg>
                   </span>
               </div>
            </section>

        </nav>
</template>

<script>
export default {
    name: 'toolbar',
    data: function() {
        return {};
    },
    filters: {
        percentage: function(value) {
            return value + '%';
        }
    }
}
</script>

<style lang="scss" scoped>
@import "./../scss/config";

#toolbar {
    border-bottom: 1px solid $gray-darkest;
    section {
        align-items: center;
        display: flex;
        height: 2.5rem;
        width: 100%;
        &.tools {
            background-color: $gray-medium-dark;
        }
        &.settings {
            background-color: $gray-medium-light;
        }
        >div {
            margin: 0 .5rem;
            &:first-child {
                margin-left: 5rem;
            }
        }
    }
}
</style>
