const api = {
    doImport (data) {
        
        window.application.$store.dispatch('importData', {
            clientWidth: document.getElementById('svgcanvas').clientWidth,
            clientHeight: document.getElementById('svgcanvas').clientHeight,
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
