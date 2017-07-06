import factory from './factory.js'
import map from './libconfig.js'

const helpers = {
    /*
    * returns the displayName for a given key on an object type
    * return null if the key is private
    * return the unchanged keyname for custom user defined keys
    */
    displayNameForKey (type, key) {
        if (this.map[type].keymap[key]) {
            return this.map[type].keymap[key].private ? null : this.map[type].keymap[key].displayName;
        } else {
            return key;
        }
    },

    /*
    * returns the value for a given key on an object type
    * if the keymap includes a get() method for the key, its return value will be used
    */
    valueForKey (object, state, type, key) {
        if (this.map[type].keymap[key] && this.map[type].keymap[key].get) {
            return this.map[type].keymap[key].get(object, state);
        } else {
            return object[key];
        }
    },

    /*
    * dispatches an action to set the value for a key on an object
    * if a validator is defined for the object type + key being changed, call the validator before dispatching the action
    * if validation fails, return { success: false, error: 'validator error message' }
    * if validation passes or no validator exists (custom user defined keys), return { success: true }
    */
    setValueForKey (object, store, type, key, value) {
        const result = {
            success: true
        };

        // if a validator is defined for the key, run it and store the result
        if (this.map[type].keymap[key] && this.map[type].keymap[key].validator) {
            const validationResult = this.map[type].keymap[key].validator(object, store, value);
            result.success = validationResult.success;
            if (!validationResult.success) {
                result.error = validationResult.error;
                return result;
            }
        }

        // dispatch the correct action to update the specified type
        if (type === 'stories') {
            store.dispatch('models/updateStoryWithData', {
                story: object,
                [key]: value
            });
        } else if (type === 'spaces') {
            store.dispatch('models/updateSpaceWithData', {
                space: object,
                [key]: value
            });
        } else if (type === 'shading') {
            store.dispatch('models/updateShadingWithData', {
                shading: object,
                [key]: value
            });
        } else if (type === 'images') {
            store.dispatch('models/updateImageWithData', {
                image: object,
                [key]: value
            });
        } else {
            store.dispatch('models/updateObjectWithData', {
                object: object,
                [key]: value
            });
        }

        return result;
    },
    /*
    * return all keys in the keymap for a type
    * this is needed so that computed keys are still displayed despite not being stored directly on objects of the type
    * for example, story is not a property directly on objects of type space, so we load that key here to display it
    */
    defaultKeysForType (type) {
        if (this.map[type]) {
            return Object.keys(this.map[type].keymap);
        } else {
            return [];
        }
    },

    keyIsPrivate (type, key) {
        return this.map[type].keymap[key] ? this.map[type].keymap[key].private : false;
    },
    keyIsReadonly (type, key) {
        return this.map[type].keymap[key] ? this.map[type].keymap[key].readonly : false;
    },

    inputTypeForKey (type, key) {
        return this.map[type].keymap[key] && !this.map[type].keymap[key].readonly ? this.map[type].keymap[key].input_type : null;
    },

    selectOptionsForKey (object, state, type, key) {
        return this.map[type].keymap[key] && !this.map[type].keymap[key].readonly && this.map[type].keymap[key].input_type === 'select' ? this.map[type].keymap[key].select_data(object, state) : [];
    },

    /*
    * each library object type has
    * displayName - for use in the type dropdown
    * init - method to initialize a new object of the parent type (story and space do not have init functions and will be omitted from the CreateO)
    * keymap - contains displayName and accessor for each property on objects of parent type
    */
    map: map,

    /*
    * searches local state's library, stories, spaces, and shading for an object with a given id
    */
    libraryObjectWithId (state, id) {
        var result;
        // search the library
        for (var type in state.library) {
            if (state.library.hasOwnProperty(type) && !result && state.library[type].find(i => i.id === id)) {
                result = state.library[type].find(i => i.id === id);
                result.type = type;
            }
        }
        // search stories
        if (!result && state.stories.find(s => s.id === id)) {
            result = state.stories.find(s => s.id === id);
            result.type = 'story';
        }
        // search spaces, shading, and images
        if (!result) {
            for (var i = 0; i < state.stories.length; i++) {
                const story = state.stories[i];
                if (!result && story.spaces.find(s => s.id === id)) {
                    result = story.spaces.find(s => s.id === id);
                    result.type = 'space';
                }
                if (!result && story.shading.find(s => s.id === id)) {
                    result = story.shading.find(s => s.id === id);
                    result.type = 'shading';
                }
                if (!result && story.images.find(i => i.id === id)) {
                    result = story.images.find(i => i.id === id);
                    result.type = 'image';
                }
            }
        }
        return result;
    },

    /*
    * searches local state's stories, shading, and spaces for an object with a given face id
    */
    modelForFace (state, face_id) {
        for (var i = 0; i < state.stories.length; i++) {
            const story = state.stories[i],
                shading = story.shading.find(s => s.face_id === face_id),
                space = story.spaces.find(s => s.face_id === face_id);
            if (shading) {
                shading.type = 'shading';
                return shading;
            } else if (space) {
                space.type = 'space';
                return space;
            }
        }
    },

    /*
    * Generate new unique name
    */
    generateName (state, type, story){
        const objs = libraryObjectsWithType(state, type),
            prefix = map[type].displayName + (story ? " " + story.storyId + " - " : " ");

        // Make sure name is unique
        for (let name = null, count = 1; name === null; count++) {
            name = prefix + count;

            if (objs.find(o => o.name === name)) {
                // try again
                name = null;
            } else {
                return [name,count];
            }
        }

        function libraryObjectsWithType(state, type) {
            switch (type) {
                case 'stories':
                    return state.stories;
                case 'building_units':
                case 'thermal_zones':
                case 'space_types':
                case 'construction_sets':
                case 'windows':
                case 'daylighting_controls':
                    return state.library[type];
                default:
                    const out = {
                        spaces: [],
                        shading: [],
                        images: []
                    };

                    for (let i = 0; i < state.stories.length; i++) {
                        let story = state.stories[i],
                            spaces = story.spaces || [],
                            shading = story.shading || [],
                            images = story.images || [];

                        out.spaces.push(...spaces);
                        out.shading.push(...shading);
                        out.images.push(...images);
                    }

                    return out[type];
            }
        };
    }
};
export default helpers;
