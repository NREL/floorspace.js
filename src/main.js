/* eslint-disable no-new */
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import store from './store/index.js'
import App from './App'

// mount the root vue instance
new Vue({
    el: '#app',
    template: '<App/>',
    components: { App }
})
