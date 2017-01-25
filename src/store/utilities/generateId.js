export default (function idFactory () {
    var id = 0;
    return () => id++
})();
