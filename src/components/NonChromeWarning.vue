<template>
  <p v-if="!isChrome" class="non-chrome-warning">
    Warning. This web-app is currently only tested against recent versions of
    Chrome.
  </p>
</template>

<script>
export default {
  computed: {
    isChrome() {
      var isChromium = window.chrome || window.qt,
        winNav = window.navigator,
        vendorName = winNav.vendor,
        isOpera = winNav.userAgent.indexOf("OPR") > -1,
        isIEedge = winNav.userAgent.indexOf("Edge") > -1,
        isIOSChrome = winNav.userAgent.match("CriOS");

      if (isIOSChrome) {
        return false;
      } else if (
        isChromium !== null &&
        typeof isChromium !== "undefined" &&
        vendorName === "Google Inc." &&
        isOpera === false &&
        isIEedge === false
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>
<style>
.non-chrome-warning {
  background: tomato;
  padding: 20px;
  color: white;
}
</style>
