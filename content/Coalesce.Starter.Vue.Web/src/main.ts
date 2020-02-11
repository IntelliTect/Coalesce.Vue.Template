

import Vue from 'vue';
import App from './App.vue';
import router from './router';


// Import global CSS and Fonts:
import '@fortawesome/fontawesome-free/css/all.css'
import 'vuetify/dist/vuetify.min.css'
import 'coalesce-vue-vuetify/dist/coalesce-vue-vuetify.css'


// SETUP: vuetify
import Vuetify from 'vuetify'
Vue.use(Vuetify);
const vuetify = new Vuetify({
  icons: {
    iconfont: 'fa', // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4'
  },
  customProperties: true,
  theme: {
    options: {
      customProperties: true,
    },
    themes: {
      light: {
        // primary: "#9ccc6f",
        // secondary: "#4d97bc",
        // accent: "#e98f07",
        error: '#df323b', // This is the default error color with darken-1
      }
    }
  }
})


// SETUP: coalesce-vue
import { AxiosClient as CoalesceAxiosClient } from 'coalesce-vue'
CoalesceAxiosClient.defaults.baseURL = '/api'
CoalesceAxiosClient.defaults.withCredentials = true

// SETUP: coalesce-vue-vuetify
import $metadata from '@/metadata.g';
// viewmodels.g has sideeffects - it populates the global lookup on ViewModel and ListViewModel.
import '@/viewmodels.g';
import CoalesceVuetify from 'coalesce-vue-vuetify';
Vue.use(CoalesceVuetify, {
  metadata: $metadata
});


Vue.config.productionTip = false;

new Vue({
  router,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
