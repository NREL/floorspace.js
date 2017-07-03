const api = {
    doImport (data) {
        try { 
            window.application.$store.dispatch('importModel', {
                clientWidth: document.getElementById('svg-grid').clientWidth,
                clientHeight: document.getElementById('svg-grid').clientHeight,
                data: JSON.parse(data)
            });
        }catch(err){
            return false;
        }
        return true;
    },

    doExport () {
        return window.application.$store.getters['exportData'];
    },

    setConfig (config) {
        console.log(config);
        return true;
    }
};
