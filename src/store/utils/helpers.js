export default {
    generateId: (function idFactory() {
        var id = 0;
        return () => id++
    })()
}
