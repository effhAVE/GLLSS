import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import axios from "axios";
import VueJWT from 'vuejs-jwt';
import DatetimePicker from 'vuetify-datetime-picker'
 
Vue.use(DatetimePicker);
Vue.use(VueJWT, { keyName: "token" });
Vue.config.productionTip = false
Vue.prototype.$http = axios;

const token = localStorage.getItem("token");
if (token) {
  Vue.prototype.$http.defaults.headers.common["x-auth-token"] = token;
}

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
