import factory from './factory.js'
import map from './libconfig.js'

const helpers = {
    /*
    * returns the displayName for a given key on an object type
    * custom user defined attributes will not included in the keymap - the unchanged keyname will be returned
    */
    displayNameForKey (type, key) {
        if (this.map[type].keymap[key]) {
            // return the displayName or null if the key is private
            return this.map[type].keymap[key].private ? null : this.map[type].keymap[key].displayName;
        } else {
            // custom user defined key
            return key;
        }
    },
    /*
    * returns the display value for a given key on an object type
    * if the keymap includes a get () method for the key, its return value will be used
    */
    displayValueForKey (object, state, type, key) {
        if (this.map[type].keymap[key] && this.map[type].keymap[key].get) {
            return this.map[type].keymap[key].get(object, state);
        } else {
            return object[key];
        }
    },

    /*
    * dispatches an action to set the value for a key on an object
    * if a validator is defined for the object type + key being changed, call the validator before dispatching the action
    * if validation fails, return { success: false, error: "validator error message" }
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
        } else {
            store.dispatch('models/updateObjectWithData', {
                object: object,
                [key]: value
            });
        }

        return result;
    },

    keyIsPrivate (type, key) {
        return this.map[type].keymap[key] ? this.map[type].keymap[key].private : false;
    },
    keyIsReadonly (type, key) {
        return this.map[type].keymap[key] ? this.map[type].keymap[key].readonly : false;
    },
    /*
    * each library object type has
    * displayName - for use in the type dropdown
    * init - method to initialize a new object of the parent type (story and space do not have init functions and will be omitted from the CreateO)
    * keymap - contains displayName and accessor for each property on objects of parent type
    */
    map: map,

    /*
    * searches local state's library, stories, and spaces for an object with a given id
    */
    libraryObjectWithId (state, id) {
        var result;
        // search the library
        for (var type in state.library) {
            if (state.library.hasOwnProperty(type) && !result) {
                const items = state.library[type];
                result = items.find(i => i.id === id);
            }
        }
        // search stories
        if (!result) {
            result = state.stories.find(s => s.id === id);
        }
        // search spaces
        if (!result) {
            for (var i = 0; i < state.stories.length; i++) {
                const story = state.stories[i];
                result = result || story.spaces.find(s => s.id === id);
            }
        }
        return result;
    }
};
export default helpers;
