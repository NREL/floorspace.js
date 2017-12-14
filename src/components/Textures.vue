<template>
  <svg id="pattern-defs">
    <defs>
      <template v-for="(color, modifier) in modifiers">
        <!-- ATTENCION!

          If you add a pattern here, it will not display unless
          you also add its name in appconfig.js

          Sorry for the duplication...
        -->
        <pattern
          :id="`circles-2${modifier}`"
          patternUnits="userSpaceOnUse"
          width="5" height="5"
        >
          <circle cx='1.5' cy='1.5' r='1.5' :fill="color"/>
        </pattern>
        <pattern
          :id="`circles-5${modifier}`"
          patternUnits="userSpaceOnUse"
          width="9" height="9"
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
import _ from 'lodash';

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
  mounted() {
    this.loadCssStyles();
  },
  methods: {
    loadCssStyles() {
      const css = document.createElement('style');
      css.type = 'text/css';
      if (css.styleSheet) {
        css.styleSheet.cssText = this.styles;
      } else {
        css.appendChild(document.createTextNode(this.styles));
      }
      document.head.appendChild(css);
    },
  },
  computed: {
    modSuffixes() { return _.filter(Object.keys(this.modifiers), _.identity) },
    patterns() {
      return _.reject(
        Array.from(this.$el.querySelectorAll('pattern')),
        // don't make css classes for modified textures
        p => this.modSuffixes.some(ms => _.endsWith(p.getAttribute('id'), ms)),
      );
    },
    cssStyles() {
      return this.patterns
        .map((pattern) => {
          const
            id = pattern.getAttribute('id'),
            width = pattern.getAttribute('width'),
            height = pattern.getAttribute('height'),
            contents = pattern.innerHTML,
            wrapped = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>${contents}</svg>`;
          return `
            .texture-${id} {
              background-image: url("data:image/svg+xml;base64,${btoa(wrapped)}");
              background-repeat: repeat;
            }`;
        });
    },
    windowStyles() {
      return _.map(this.patterns, p => p.getAttribute('id'))
        .map((id) => `
            #grid svg .polygons .windows .window .hatch[data-texture="${id}"] {
              fill: url(#${id});
            }
            #grid svg .polygons .windows .window .facing-selection .hatch[data-texture="${id}"] {
              fill: url(#${id}-facing-selection);
            }
            #grid svg .polygons .windows .window .selected .hatch[data-texture="${id}"] {
              fill: url(#${id}-selected);
            }
            #grid svg .highlight .window .window-wall-ratio .hatch[data-texture="${id}"] {
              fill: url(#${id}-highlight);
            }
          `);
    },
    styles() {
      return [...this.cssStyles, ...this.windowStyles].join('\n');
    },
  },
}
</script>
<style>
</style>
