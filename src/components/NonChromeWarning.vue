<template>
  <p v-if="!isChrome"
    class="non-chrome-warning"
  >
    Warning. This web-app is designed to be embedded within the OpenStudio
    destkop app. Since we have control over that environment, we only test
    against recent versions of Chrome. Most things should work in firefox,
    but you'll have the best luck using Chrome.
  </p>
</template>

<script>
export default {
  computed: {
    isChrome() {
      var isChromium = window.chrome,
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
}
</script>
<style>
  .non-chrome-warning {
    background: tomato;
    padding: 20px;
    color: white;

  }
</style>
