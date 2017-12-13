<template>
  <svg id="pattern-defs">
    <defs>
      <template v-for="(color, modifier) in modifiers">
        <!-- ATTENCION!

          If you add a pattern here, it will not display unless
          you also add its name in config.scss.
        -->
        <pattern
          :id="`circles-2${modifier}`"
          patternUnits="userSpaceOnUse"
          width="10" height="10"
        >
          <circle cx='1.5' cy='1.5' r='1.5' :fill="color"/>
        </pattern>
        <pattern
          :id="`circles-5${modifier}`"
          patternUnits="userSpaceOnUse"
          width="10" height="10"
        >
          <circle cx='3' cy='3' r='3' :fill="color"/>
        </pattern>
        <pattern
          :id="`circles-8${modifier}`"
          patternUnits="userSpaceOnUse"
          width="10" height="10"
        >
          <circle cx='4.5' cy='4.5' r='4.5' :fill="color"/>
        </pattern>
        <pattern
          :id="`diagonal-stripe-1${modifier}`"
          patternUnits="userSpaceOnUse"
          width="10" height="10"
        >
          <path d='M-1,1 l2,-2
                   M0,10 l10,-10
                   M9,11 l2,-2' :stroke="color" stroke-width='1'/>
        </pattern>
        <pattern
          :id="`diagonal-stripe-4${modifier}`"
          patternUnits="userSpaceOnUse"
          width="10" height="10"
        >
          <path d='M-1,1 l2,-2
                   M0,10 l10,-10
                   M9,11 l2,-2' :stroke="color" stroke-width='3'/>
        </pattern>
        <pattern
          :id="`diagonal-stripe-6${modifier}`"
          patternUnits="userSpaceOnUse"
          width="10" height="10"
        >
          <rect width='10' height='10' :fill='color'/>
          <path d='M-1,1 l2,-2
                   M0,10 l10,-10
                   M9,11 l2,-2' stroke="white" stroke-width='1'/>
        </pattern>
        <pattern
          :id="`dots-5${modifier}`"
          patternUnits="userSpaceOnUse"
          width="10" height="10"
        >
          <rect x='0' y='0' width='5' height='5' :fill='color' />
        </pattern>
        <pattern
          :id="`dots-8${modifier}`"
          patternUnits="userSpaceOnUse"
          width="10" height="10"
        >
          <rect x='0' y='0' width='8' height='8' :fill='color' />
        </pattern>

      </template>
    </defs>
  </svg>
</template>

<script>
export default {
  name: 'Textures',
  data() {
    return {
      modifiers: {
        '-highlight': 'green',
        '-selected': 'green',
        '-facing-selection': 'blue',
        '': '#222'
      },
    };
  },
}
</script>
<style>
</style>
