var id = 1;
export default {
    setId (newVal) {
        id = newVal;
    },

    generate: (function () {
        return () => String(id++)
    })()
}
