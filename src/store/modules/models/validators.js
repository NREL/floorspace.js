export default {
  name(object, store, value, type) {
    let objs = store.getters['models/all'];

    switch (type) {
      case 'stories':
        objs = store.state.models.stories;
        break;
      case 'spaces':
        objs = store.getters['models/allSpaces'];
        break;
      case 'shading':
        objs = store.getters['models/allShading'];
        break;
      case 'images':
        objs = store.getters['models/allImages'];
        break;
      default:
        objs = store.state.models.library[type];
        break;
    }
    let objSameName = objs.filter(s => s.name === value);

    console.log(objs, objSameName);
    if (objSameName && objSameName.id !== object.id) {
      debugger
      return {
        success: false,
        error: 'Names must be unique.',
      };
    } else if (value.length < 5) {
      return {
        success: false,
        error: 'Names must be at least 5 characters long.',
      };
    }
    return { success: true };
  },

  number(object, store, value, type) {
    if (isNaN(value)) {
      return {
        success: false,
        error: 'Value must be numeric'
      };
    }
    return {
      success: true
    };
  }
}
