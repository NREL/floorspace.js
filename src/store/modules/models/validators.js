export default {
    name (object, store, value) {
        let objs = store.getters['models/all'],
            objSameName = objs.find(s => s.name === value);

        if (objSameName && objSameName.id !== object.id) {
            return {
                success: false,
                error: 'Names must be unique.'
            };
        } else  if (value.length < 5) {
            return {
                success: false,
                error: 'Names must be at least 5 characters long.'
            };
        } else {
            return {
                success: true
            };
        }
    },

    number (object, store, value) {
        if (isNaN(value)) {
            return {
                success: false,
                error: 'Value must be numeric'
            };
        }
        return { success: true };
    }
}
