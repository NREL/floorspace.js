export default {
    name (object, store, value) {
        if (value.length < 5) {
            return {
                success: false,
                error: 'Names must be at least 5 characters long.'
            };
        }
        return { success: true };
    }
}
