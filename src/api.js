window.api = {
  config: {},
  doImport(data) {
    try {
      window.application.$store.dispatch('importModel', {
        clientWidth: document.getElementById('svg-grid').clientWidth,
        clientHeight: document.getElementById('svg-grid').clientHeight,
        data: JSON.parse(data),
      });
    } catch (err) {
      return false;
    }
    return true;
  },
  doExport() {
    return window.application.$store.getters['exportData'];
  },
  setConfig({
    units = 'm',
    showMapDialogOnStart = true,
    online = true,
    onChange = function change() {},
  }) {
    this.config = { units, showMapDialogOnStart, online, onChange };

    startApp();
    // don't dispatch actions until the application and data store are instantiated
    window.application.$store.dispatch('project/setUnits', { units });
  },
};
