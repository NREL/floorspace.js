export default (function idFactory () {
    var id = 1;
    return () => id++
})();
