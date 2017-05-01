const api = {
    doImport (data) {
        window.application.$store.dispatch('importData', {
            clientWidth: document.getElementById('svg-grid').clientWidth,
            clientHeight: document.getElementById('svg-grid').clientHeight,
            data: JSON.parse(data)
        });
    },

    doExport () {
        return window.application.$store.getters['exportData'];
    },

    setConfig (config) {
        console.log(config);
    }
};
