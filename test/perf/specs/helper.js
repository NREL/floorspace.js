import 'Src/api';
import _ from 'lodash';

window._ = _;
window.api.setConfig({});

import Vue from 'vue';
import store from 'Src/store/index';

import timetravel from 'Src/store/timetravel';
import App from 'Src/App.vue';
import PrettySelect from 'Src/components/PrettySelect.vue';
import GenericInput from 'Src/components/GenericInput.vue';

Vue.component('pretty-select', PrettySelect);
Vue.component('generic-input', GenericInput);

window.eventBus = new Vue();

export function create() {
  const d = document.createElement('div');
  d.id = 'app';
  d.className = 'tool_rectangle';
  document.body.appendChild(d);

  // mount the root vue instance
  window.application = new Vue({
    store,
    el: '#app',
    template: '<App/>',
    components: { App },
  });

  timetravel.init(store);

}

export async function loadFloorPlan(data, type = 'floorplan') {
  const blob = new Blob([JSON.stringify(data)], { type: 'text/plain' });

  const eventObj = {
    target: {
      files: [
        blob
      ],
    },
  };

  const oldEdges = application.$store.state.geometry[0].edges;
  document.getElementById('toolbar').__vue__.importDataAsFile(eventObj, type);

  let appearsLoaded = false;
  while (!appearsLoaded) {
    appearsLoaded = application.$store.state.geometry[0].edges.length > 0 && application.$store.state.geometry[0].edges !== oldEdges;
    await sleep(100);
  }

  await application.$nextTick();
}

export function tearDown() {
  document.getElementById('app').remove();
}

export function sleep(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
