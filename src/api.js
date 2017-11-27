window.api = {
  config: null,
  initAlreadyRun: false,
  doImport: (data) => {
    try {
      window.application.$store.dispatch('importModel', {
        clientWidth: document.getElementById('svg-grid').clientWidth,
        clientHeight: document.getElementById('svg-grid').clientHeight,
        data: JSON.parse(data),
      });
    } catch (err) {
      console.error(err);
      return false;
    }
    return true;
  },
  doExport: () => window.application.$store.getters['exportData'],
  setConfig: (config) => {
    if (this.initAlreadyRun) {
      throw new Error('The application has already been started, configuration cannot be changed.');
    }

    if (config === undefined) {
      config = {}; // eslint-disable-line
    }
    window.api.config = Object.assign({
      units: 'm',
      showMapDialogOnStart: false,
      online: true,
      onChange: () => { window.versionNumber += 1; },
    }, config);
  },
  init: () => {
    if (this.initAlreadyRun) {
      throw new Error('This method can only be run once!');
    }
    window.versionNumber = 0;
    window.startApp();
    delete window.startApp;

    // don't dispatch actions until the application and data store are instantiated
    window.application.$store.dispatch('project/setUnits', { units: window.api.config.units });

    // if the map modal has been disabled, mark the map as initialized so that time travel can be initialized
    // TODO: we may want to intitialize timetravel in the importModel action instead
    window.application.$store.dispatch('project/setMapInitialized', { initialized: true });

    this.initAlreadyRun = true;
  },
};
