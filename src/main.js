import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import VueCookies from 'vue-cookies'
import './ml'
import '@mdi/font/css/materialdesignicons.css'

Vue.config.productionTip = false

// used for nc session cookies
Vue.use(VueCookies);
Vue.use(vuetify);
new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
