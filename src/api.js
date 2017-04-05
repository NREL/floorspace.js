const api = {
    doImport (data) {
        const input = document.getElementById("json-input"),
            event = new Event('input', {
                'bubbles': true,
                'cancelable': true
            });
        input.value = data;
        input.dispatchEvent(event)
    },

    doExport () {
        document.getElementById("export").click();
    },

    setConfig (config) {
        console.log(config);
    }
};
