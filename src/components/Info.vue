<template>
  <div class="info">
    <InfoIcon class="button" />
    <span class="tooltip-text">
      <slot></slot>
    </span>
  </div>
</template>
<script>
import InfoIcon from './../assets/svg-icons/info_icon.svg';

export default {
  name: 'Info',
  components: {
    InfoIcon,
  },
}
</script>
<style lang="scss" scoped>
@import "./../scss/config";
.info {
  position: relative;
  display: inline-block;
  svg {
    fill: $gray-light;
  }
  .tooltip-text {
    visibility: hidden;
    width: 300px;
    background-color: black;
    color: $gray-lightest;
    text-align: center;
    padding: 5px 5px;
    border-radius: 6px;

    position: absolute;
    z-index: 1;
  }
  &:hover .tooltip-text {
    visibility: visible;
  }
}
</style>
