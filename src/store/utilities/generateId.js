var id = 1;
export default {
    setId (newVal) {
        id = newVal;
    },

    generate: (function () {
        return () => String(id++)
    })()
}

const nameCounts = {};
export function genName(prefix) {
  const nextSuffix = (nameCounts[prefix] || 0) + 1;
  nameCounts[prefix] = nextSuffix;
  return `${prefix} - ${nextSuffix}`;
}
