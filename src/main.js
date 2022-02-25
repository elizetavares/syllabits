import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import Buefy from 'buefy'

import { apolloProvider } from './apollo'
import { Constants, AssetService, TranslationService, ReminderService } from './services'

import './styles/syllabits.scss'

// Install Vue plugins!
// Buefy bundle size is actually small
Vue.use(Buefy);
Vue.use(Constants);
Vue.use(AssetService);
Vue.use(TranslationService);
Vue.use(ReminderService);

Vue.config.productionTip = false;

new Vue({
  router,
  apolloProvider,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
