<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the 'OpenStudio' trademark, 'OS', 'os', or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<section id='library'>
    <header>
        <div class="input-text">
            <label>Search</label>
            <input v-model="search">
        </div>
        <div class='input-select'>
            <label>Type</label>
            <select v-model='type'>
                <option v-for='(objects, type) in extendedLibrary' :value="type">{{ displayTypeForType(type) }}</option>
            </select>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 14' height='10px'>
                <path d='M.5 0v14l11-7-11-7z' transform='translate(13) rotate(90)'></path>
            </svg>
        </div>
        <button @click="createObject">New</button>
    </header>

    <table class="table">
        <thead>
            <tr>
                <th v-for="column in columns" @click="sortBy(column)">
                    <span>
                        <span>{{ displayNameForKey(column) }}</span>
                        <svg v-show="column === sortKey && sortDescending" viewBox="0 0 10 3" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 .5l5 5 5-5H0z"/>
                        </svg>
                        <svg v-show="column === sortKey && !sortDescending" viewBox="0 0 10 3" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 5.5l5-5 5 5H0z"/>
                        </svg>
                    </span>
                </th>
                <th class="destroy"></th>
            </tr>
        </thead>

        <tbody>
            <tr v-for='object in displayObjects' :key="object.id" @click="selectedObject = object" :style="{ 'background-color': (selectedObject && selectedObject.id === object.id) ? '#008500' : '' }">
                <td v-for="column in columns">
                    <input v-if="!inputTypeForKey(column)" :value="valueForKey(object, column)" @change="setValueForKey(object, column, $event.target.value)" readonly>
                    <input v-if="inputTypeForKey(column) === 'text'" :value="valueForKey(object, column)" @change="setValueForKey(object, column, $event.target.value)">

                    <div v-if="inputTypeForKey(column) === 'color'" class='input-color'>
                        <input v-if="inputTypeForKey(column) === 'color'" :object-id="object.id" :value="valueForKey(object, column)" @change="setValueForKey(object, column, $event.target.value)">
                    </div>

                    <div v-if="inputTypeForKey(column) === 'select'" class='input-select'>
                        <select @change="setValueForKey(object, column, $event.target.value)" >
                            <option :selected="!valueForKey(object, column)" value="null">None</option>
                            <option v-for='(id, name) in selectOptionsForObjectAndKey(object, column)' :value="id" :selected="valueForKey(object, column)===name">{{ name }}</option>
                        </select>
                        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 13 14' height='10px'>
                            <path d='M.5 0v14l11-7-11-7z' transform='translate(13) rotate(90)'></path>
                        </svg>
                    </div>
                </td>
                <td class="destroy">
                    <svg @click.stop="destroyObject(object)" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                        <path d="M137.05 128l75.476-75.475c2.5-2.5 2.5-6.55 0-9.05s-6.55-2.5-9.05 0L128 118.948 52.525 43.474c-2.5-2.5-6.55-2.5-9.05 0s-2.5 6.55 0 9.05L118.948 128l-75.476 75.475c-2.5 2.5-2.5 6.55 0 9.05 1.25 1.25 2.888 1.876 4.525 1.876s3.274-.624 4.524-1.874L128 137.05l75.475 75.476c1.25 1.25 2.888 1.875 4.525 1.875s3.275-.624 4.525-1.874c2.5-2.5 2.5-6.55 0-9.05L137.05 128z"/>
                    </svg>
                </td>
            </tr>
        </tbody>
    </table>

</section>
</template>

<script>
import { mapState } from 'vuex';
import helpers from './../store/modules/models/helpers';

const Huebee = require('huebee');

export default {
  name: 'library',
  data() {
    return {
      search: '',
      sortKey: 'id',
      sortDescending: true,
      type: null, // object type being viewed
      huebs: {},
    };
  },
  mounted() {
    // initialize the library to view objects of the same type being viewed in the navigation
    this.type = this.mode;
    this.configurePickers();
  },
  computed: {
    ...mapState({
      mode: state => state.application.currentSelections.mode,
      stories: state => state.models.stories,
    }),
    // current selection getters and setters - these dispatch actions to update the data store when a new item is selected
    currentStory: {
      get() { return this.$store.state.application.currentSelections.story; },
      set(item) { this.$store.dispatch('application/setCurrentStory', { story: item }); },
    },
    currentSpace: {
      get() { return this.$store.state.application.currentSelections.space; },
      set(item) { this.$store.dispatch('application/setCurrentSpace', { space: item }); },
    },
    currentShading: {
      get() { return this.$store.state.application.currentSelections.shading; },
      set(item) { this.$store.dispatch('application/setCurrentShading', { shading: item }); },
    },
    currentImage: {
      get() { return this.$store.state.application.currentSelections.image; },
      set(item) { this.$store.dispatch('application/setCurrentImage', { image: item }); },
    },
    currentThermalZone: {
      get() { return this.$store.state.application.currentSelections.thermal_zone; },
      set(item) { this.$store.dispatch('application/setCurrentThermalZone', { thermal_zone: item }); },
    },
    currentBuildingUnit: {
      get() { return this.$store.state.application.currentSelections.building_unit; },
      set(item) { this.$store.dispatch('application/setCurrentBuildingUnit', { building_unit: item }); },
    },
    currentSpaceType: {
      get() { return this.$store.state.application.currentSelections.space_type; },
      set(item) { this.$store.dispatch('application/setCurrentSpaceType', { space_type: item }); },
    },
    /*
    * returns the currently selected object in the library
    * when set, dispatches an action to update the application's currentSelections in the store
    */
    selectedObject: {
      get() {
        if (this.type === 'story') {
          return this.currentStory;
        }
        return this.currentImage ||
          this.currentSpace ||
          this.currentShading ||
          this.currentBuildingUnit ||
          this.currentThermalZone ||
          this.currentSpaceType;
      },
      set(item) {
        switch (this.type) {
          case 'stories':
            this.currentStory = item;
            break;
          case 'building_units':
            this.currentBuildingUnit = item;
            break;
          case 'thermal_zones':
            this.currentThermalZone = item;
            break;
          case 'space_types':
            this.currentSpaceType = item;
            break;
          case 'spaces':
            this.currentStory = this.stories.find(s => s.spaces.find(sp => sp.id === item.id));
            this.currentSpace = item;
            break;
          case 'shading':
            this.currentStory = this.stories.find(s => s.spaces.find(sp => sp.id === item.id));
            this.currentShading = item;
            break;
          case 'images':
            this.currentStory = this.stories.find(s => s.images.find(img => img.id === img.id));
            this.currentImage = item;
            break;
          default:
            break;
        }
      },
    },

    /*
    * state.models.library extended to include stories, spaces, shading and images
    * objects are deep copies to avoid mutating the store
    */
    extendedLibrary() {
      let spaces = [];
      let shading = [];
      let images = [];

      for (let i = 0; i < this.$store.state.models.stories.length; i++) {
        spaces = spaces.concat(this.$store.state.models.stories[i].spaces);
        shading = shading.concat(this.$store.state.models.stories[i].shading);
        images = images.concat(this.$store.state.models.stories[i].images);
      }

      return JSON.parse(JSON.stringify({
        ...this.$store.state.models.library,
        stories: this.$store.state.models.stories,
        spaces,
        shading,
        images,
      }));
    },

    /*
    * return all objects in the extended library for a given type to be displayed at one time
    * filters by the search term
    * objects are deep copies to avoid mutating the store
    */
    displayObjects() {
      return (this.extendedLibrary[this.type] || [])
        .filter(object =>
          // check if the value for any key on the object contains the search term
          Object.keys(object).some((key) => {
            // coerce key values to strings, use lowercase version of search term and key value
            const value = String(this.valueForKey(object, key)).toLowerCase();
            return value.includes(this.search.toLowerCase());
          }))
        .sort((a, b) => {
          if (a[this.sortKey] === b[this.sortKey]) { return 0; }
          if (this.sortDescending) {
            return a[this.sortKey] > b[this.sortKey] ? -1 : 1;
          }
          return a[this.sortKey] < b[this.sortKey] ? -1 : 1;
        });
    },

    /*
    * return all unique non private keys for the set of displayObjects
    */
    columns() {
      const columns = [];
      this.displayObjects.forEach((o) => {
        Object.keys(o).forEach((k) => {
          if ((columns.indexOf(k) === -1) && !this.keyIsPrivate(this.type, k)) { columns.push(k); }
        });
      });
      // look up additional keys (computed properties)
      const additionalKeys = helpers.defaultKeysForType(this.type);
      additionalKeys.forEach((k) => {
        if ((columns.indexOf(k) === -1) && !this.keyIsPrivate(this.type, k)) { columns.push(k); }
      });
      return columns;
    },
  },
  methods: {

    configurePickers() {
      const inputs = document.querySelectorAll('.input-color > input');
      for (let i = 0; i < inputs.length; i++) {
        const objectId = inputs[i].getAttribute('object-id');

        this.huebs[objectId] = new Huebee(inputs[i], { saturations: 1 });
        this.huebs[objectId].handler = (color) => {
          const object = helpers.libraryObjectWithId(this.$store.state.models, objectId);
          this.setValueForKey(object, 'color', color);
        };
        this.huebs[objectId].on('change', this.huebs[objectId].handler);
      }
    },


    /*
    * FORMATTERS
    */
    // used in the Type dropdown to get the display name for each object type
    displayTypeForType(type) { return helpers.map[type].displayName; },

    // used in column headers to get the display name for each object property
    // private properties will return null
    displayNameForKey(key) { return helpers.displayNameForKey(this.type, key); },

    /*
    * ACCESSORS
    */
    // determine whether an object property is readonly or private
    keyIsReadonly(object, key) { return helpers.keyIsReadonly(this.type, key); },
    keyIsPrivate(object, key) { return helpers.keyIsPrivate(this.type, key); },

    // call the property getter if it exists, otherwise return the string value at obj[key]
    valueForKey(object, key) {
      // return this.errorForObjectAndKey(object, key) ? this.errorForObjectAndKey(object, key).value : helpers.valueForKey(object, this.$store.state, this.type, key);
      return helpers.valueForKey(object, this.$store.state, this.type, key);
    },

    // update a property on an object in the datastore
    // TODO: validation
    setValueForKey(object, key, value) {
      const result = helpers.setValueForKey(object, this.$store, this.type, key, value);
      if (!result.success) {
        window.eventBus.$emit('error');
      }
    },

    // initialize an empty object
    createObject() {
      switch (this.type) {
        case 'stories':
          this.$store.dispatch('models/initStory');
          return;
        case 'spaces':
          this.$store.dispatch('models/initSpace', { story: this.currentStory });
          break;
        case 'shading':
          this.$store.dispatch('models/initShading', { story: this.currentStory });
          break;
        case 'images':
          window.eventBus.$emit('uploadImage');
          break;
        default:
          this.$store.dispatch('models/createObjectWithType', { type: this.type });
          break;
      }
      // select the newly created object
      let newObject =  this.displayObjects[this.displayObjects.length - 1];
      if (newObject) { this.selectedObject = newObject; }
    },

    destroyObject(object) {
      switch (this.type) {
        case 'stories':
          this.$store.dispatch('models/destroyStory', { story: object });
          return;
        case 'spaces':
          this.$store.dispatch('models/destroySpace', {
            space: object,
            story: this.$store.state.models.stories.find(story => story[this.type].find(o => o.id === object.id)),
          });
          break;
        case 'shading':
          this.$store.dispatch('models/destroyShading', {
            shading: object,
            story: this.$store.state.models.stories.find(story => story[this.type].find(o => o.id === object.id)),
          });
          break;
        case 'images':
          this.$store.dispatch('models/destroyImage', {
            image: object,
            story: this.$store.state.models.stories.find(story => story[this.type].find(o => o.id === object.id)),
          });
          break;
        default:
          this.$store.dispatch('models/destroyObject', { object });
          break;
      }
    },

    sortBy(key) {
      this.sortDescending = this.sortKey === key ? !this.sortDescending : true;
      this.sortKey = key;
    },

    inputTypeForKey(key) {
      return helpers.inputTypeForKey(this.type, key);
    },

    selectOptionsForObjectAndKey(object, key) {
      return helpers.selectOptionsForKey(object, this.$store.state, this.type, key);
    },

    /*
    * destroy a library object
    * dispatches destroyStory, destroySpace, destroyShading, or destroyObject depending on the object's type
    */
        // classForObjectRow (object) {
        //     var classList = "";
        //     if (this.errorForObjectAndKey(object, null)) {
        //         classList += " error"
        //     }
        //     if (this.selectedObject && this.selectedObject.id === object.id) {
        //         classList += " current"
        //     }
        //     return classList;
        // },
  },
  watch: {
    displayObjects() { this.$nextTick(this.configurePickers); },
    type() {
      this.search = '';
      this.sortKey = 'id';
      this.sortDescending = true;
    },
  },
};
</script>

<style lang='scss' scoped>
@import './../scss/config';
@import './../../node_modules/huebee/dist/huebee.min.css';

#library {
    background-color: $gray-darkest;
    overflow: auto;

    header {
        display: flex;
        padding: 1rem 1.5rem;

        .input-select {
            margin-right: 3rem;
            width: 10rem;
        }
        .input-text {
            margin-right: auto;
            width: 10rem;
        }
    }

    table {
        border-spacing: 0;
        width: 100%;

        thead tr th, tbody tr td {
            text-align: left;
            padding: 0 1rem;
            position: relative;

            &:first-child {
                padding-left: 2.5rem;
            }
            &:last-child {
                flex-grow: 2;
            }
        }


        thead {
            th {
                border-bottom: 2px solid $gray-medium-light;
            }
            tr {
                height: 3rem;
                svg {
                    height: 1rem;
                    width: 1rem;
                    fill: $gray-medium-light;
                }
            }
        }

        tbody tr {
            height: 2rem;

            &:nth-of-type(odd) {
                background-color: $gray-medium-dark;
            }

            &.current {
                background: red;//$gray-medium-light;
            }

            .input-select {
                margin: .5rem 0;
            }

            input {
                background-color: rgba(0,0,0,0);
                border: none;
                color: $gray-lightest;
                font-size: 1rem;
            }

            // last column - destroy item
            td.destroy {
                width: 2rem;
                svg {
                    cursor: pointer;
                    height: 1.25rem;
                    fill: $gray-lightest;
                    &:hover {
                        fill: $secondary;
                    }
                }
            }

            // error styles
            &.error {
                background: rgba($secondary, .5);
                position: relative;
            }

            .tooltip-error {
                bottom: 3rem;
                background-color: $gray-darkest;
                border: 1px solid $secondary;
                color: $gray-lightest;
                left: 3rem;
                border-radius: .25rem;
                padding: .5rem 1rem;
                position: absolute;
                svg {
                    bottom: -0.7rem;
                    height: .75rem;
                    left: 0.5rem;
                    position: absolute;
                    transform: rotate(90deg);
                    path {
                        fill: $secondary;
                    }
                }
            }
        }
    }
}

</style>
