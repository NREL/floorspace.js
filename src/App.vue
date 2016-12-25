<template>
    <div id="app">
        <toolbar></toolbar>
        <main>
                <navigation></navigation>
                <canvas-view></canvas-view>
                <inspector></inspector>
        </main>
    </div>
</template>

<script>
import Canvas from './components/Canvas'
import Navigation from './components/Navigation'
import Toolbar from './components/Toolbar'
import Inspector from './components/Inspector'

export default {
    name: 'app',
    components: {
        'canvas-view': Canvas,
        'navigation': Navigation,
        'toolbar': Toolbar,
        'inspector': Inspector
    }
}
</script>

<style src="./scss/main.scss" lang="scss"></style>
<style lang="scss" scoped>
@import "./scss/config";

</style>
