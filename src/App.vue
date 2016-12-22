<template>
  <div id="app">
    <canvas-view></canvas-view>
    <navigation></navigation>
    <toolbar></toolbar>
    <inspector></inspector>
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
<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
}
</style>
