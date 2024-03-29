import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueBreadcrumbs from 'vue-2-breadcrumbs'
import i18n from './i18n'
import VTooltip from 'v-tooltip'
import VueInputAutowidth from 'vue-input-autowidth'
import Enums from "@/utils/enums";
import VueToast from 'vue-toast-notification';

require('@/assets/css/base.css')
require('@/assets/css/style.css')

import 'vue-toast-notification/dist/theme-default.css';

Vue.use(VueToast)
Vue.use(VueInputAutowidth)
Vue.use(VTooltip, {
  themes: {
    'error-tooltip': {
      $extend: 'tooltip',
      triggers: [],
      placement: 'bottom'
    }
  }
})
Vue.use(VueBreadcrumbs, {
  template:
    `<nav v-if="$breadcrumbs.length" aria-label="breadcrumb" class="breadcrumbs">
      <router-link :to="{name: 'myprojects'}"><span class="step first"><span class="material-icons">home</span></span></router-link>
      <span v-for="(crumb, key) in $breadcrumbs" v-if="crumb.meta.breadcrumb" :key="key" class="step" aria-current="page">
          <router-link :to="{ path: getPath(crumb) }">{{ getBreadcrumb(crumb.meta.breadcrumb) }}</router-link>
      </span>
    </nav>`
});

// enable Enums in all components
Vue.mixin({
  data: function () {
    return {
      get Enums() {
        return Enums
      }
    }
  }
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
