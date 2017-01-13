const generateId = (function idFactory() {
    var id = 0;
    return () => id++
})();

export default {
    generateId: generateId
}
