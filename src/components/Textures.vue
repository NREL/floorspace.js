<template>
  <svg id="pattern-defs">
    <defs>
      <template v-for="(color, modifier) in modifiers">
        <!-- ATTENCION!

          If you add a pattern here, it will not display unless
          you also add its name in appconfig.js

          A warning will show in the console, and this situation will be
          caught by our e2e tests.

          Sorry for the duplication...
        -->
        <pattern
          :id="`circles-2${modifier}`"
          patternUnits="userSpaceOnUse"
          width="5" height="5"
        >
          <rect width="5" height="5" fill="#fff" fill-opacity="0.7" />
          <circle cx='1.5' cy='1.5' r='1.5' :fill="color"/>
        </pattern>
        <pattern
          :id="`circles-5${modifier}`"
          patternUnits="userSpaceOnUse"
          width="9" height="9"
        >
          <rect width="9" height="9" fill="#fff" fill-opacity="0.7" />
          <circle cx='3' cy='3' r='3' :fill="color"/>
        </pattern>
        <pattern
          :id="`circles-8${modifier}`"
          patternUnits="userSpaceOnUse"
          width="10" height="10"
        >
          <rect width="10" height="10" fill="#fff" fill-opacity="0.7" />
          <circle cx='4.5' cy='4.5' r='4.5' :fill="color"/>
        </pattern>
        <pattern
          :id="`diagonal-stripe-1${modifier}`"
          patternUnits="userSpaceOnUse"
          width="10" height="10"
        >
          <rect width="10" height="10" fill="#fff" fill-opacity="0.7" />
          <path d='M-1,1 l2,-2
                   M0,10 l10,-10
                   M9,11 l2,-2' :stroke="color" stroke-width='1'/>
        </pattern>
        <pattern
          :id="`diagonal-stripe-4${modifier}`"
          patternUnits="userSpaceOnUse"
          width="10" height="10"
        >
          <rect width="10" height="10" fill="#fff" fill-opacity="0.7" />
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
          <rect width="10" height="10" fill="#fff" fill-opacity="0.7" />
          <rect x='0' y='0' width='5' height='5' :fill='color' />
        </pattern>
        <pattern
          :id="`dots-8${modifier}`"
          patternUnits="userSpaceOnUse"
          width="10" height="10"
        >
          <rect width="10" height="10" fill="#fff" fill-opacity="0.7" />
          <rect x='0' y='0' width='8' height='8' :fill='color' />
        </pattern>
        <pattern
          :id="`crosshatch${modifier}`"
          patternUnits="userSpaceOnUse"
          width="8" height="8"
        >
          <rect width="8" height="8" fill="#fff" fill-opacity="0.7" />
          <path d='M0 0L8 8ZM8 0L0 8Z' stroke-width='0.5' :stroke='color' stroke-opacity="0.8" />
        </pattern>
        <pattern
          :id="`vertical-line${modifier}`"
          patternUnits="userSpaceOnUse"
          width="4" height="49"
        >
          <rect width='4' height='50' fill='#fff' fill-opacity="0.8" />
          <rect width='2' height='50' fill='#fff' fill-opacity="0.5" />
          <rect x='2' width='1' height='50' :fill='color' fill-opacity="0.5" />
        </pattern>
      </template>
    </defs>
  </svg>
</template>

<script>
import _ from 'lodash';
import { textures } from '../store/modules/application/appconfig';

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
    this.checkTexturesList();
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
    checkTexturesList() {
      const
        missingTextures = _.difference(textures, _.map(this.patterns, 'id')),
        extraTextures = _.difference(_.map(this.patterns, 'id'), textures);
      if (missingTextures.length) {
        console.error(`[warning]: Textures were added to Textures.vue, but not to appconfig.js.
  This will cause those textures not to be used. The following are missing from appconfig:
  ${missingTextures}`);
      }
      if (extraTextures.length) {
        console.error(`[warning]: Textures were added to appconfig.js, but not to Textures.vue.
  Those textures will not be visible. The following are missing from Textures.vue:
  ${extraTextures}`);
      }
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
            #grid svg .polygons .window .hatch[data-texture="${id}"] {
              fill: url(#${id});
            }
            #grid svg .polygons .window .facing-selection .hatch[data-texture="${id}"] {
              fill: url(#${id}-facing-selection);
            }
            #grid svg .polygons .window .selected .hatch[data-texture="${id}"] {
              fill: url(#${id}-selected);
            }
            #grid svg .highlight .window .hatch[data-texture="${id}"] {
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
