<template>
    <nav id="toolbar">
        <section class="tools">
            the actual tools
        </section>
        <section class="settings">

            <div class="input-select">
                <label>zoom</label>
                <select v-model="scale">
                    <option v-for="i in 10">{{ i * 10 }}%</option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 14" height="10px">
                    <path d="M.5 0v14l11-7-11-7z" transform="translate(13) rotate(90)"></path>
                </svg>
            </div>

            <div class="input-select" id="drawing-mode">
                <label>drawing mode</label>
                <select v-model="mode">
                    <option v-for="mode in modes">{{ mode }}</option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 14" height="10px">
                    <path d="M.5 0v14l11-7-11-7z" transform="translate(13) rotate(90)"></path>
                </svg>
            </div>

        </section>

    </nav>
</template>

<script>
export default {
    name: 'toolbar',
    data: function() {
        var data =  {
            modes: ['Space', 'Select', 'Rectangle', 'Polygon', 'Place Component', 'Apply Property', 'Scale'],
            scale: '100' + '%',
            mode: null
        };
        data.mode = data.modes[0];
        return data;
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
            margin: 0 1rem 0 0;
            &:first-child {
                margin-left: 5rem;
            }

        }
        #drawing-mode > select {
            width: 8.5rem;
        }
    }
}
</style>
