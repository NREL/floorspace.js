<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
     <svg></svg>
  </div>
</template>

<script>
export default {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to GeoSketch'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    svg {
        height: 100%;
        width: 100%;
        background-color: white;
    }

</style>
