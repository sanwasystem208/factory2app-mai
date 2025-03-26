import Vue from 'vue'
import App from './App.vue'

/*
import VueRouter from 'vue-router'
Vue.use(VueRouter);
*/
import router from './router.js'
import store from './store'

import Bootstrap from 'bootstrap';
import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue);

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import VuejsDialog from 'vuejs-dialog';
Vue.use(VuejsDialog);

import 'vuejs-dialog/dist/vuejs-dialog.min.css';

import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';
Vue.component('vue-ctk-date-time-picker', VueCtkDateTimePicker);

import vueCheetahGrid from "vue-cheetah-grid";
Vue.use(vueCheetahGrid);

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
