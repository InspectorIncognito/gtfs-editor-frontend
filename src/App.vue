<template>
  <div id="app" class="body">
    <header>
      <div class="container full grid">
        <div class="logo">
          <router-link :to="{name: 'myprojects'}">
            <img src="@/assets/img/logo.svg"/>
          </router-link>
        </div>
        <div class="top-menu">
          <locale-switcher/>
          <router-link v-if="isAuthenticated" :to="{name: 'myprojects'}" class="btn-top">
            <span>{{ $t('myProjects.myProjects') }}</span><i class="material-icons">layers</i>
          </router-link>
          <a target="_blank" href="https://www.transapp.cl" class="btn-top"><span>{{ $t('general.website') }}</span><i
              class="material-icons">public</i></a>
          <a target="_blank" href="https://transapp.cl/#contacto"
             class="btn-top"><span>{{ $t('general.contact') }}</span><i class="material-icons">mail</i></a>

          <router-link v-if="!isAuthenticated" :to="{ name: 'login' }" class="btn-top">
            <span>{{ $t('user.login') }}</span><i class="material-icons">login</i>
          </router-link>
          <a v-if="isAuthenticated" @click.prevent="logout" class="btn-top">
            <span>{{ $t('user.logout') }}</span><i class="material-icons">logout</i>
          </a>
        </div>
      </div>
    </header>
    <div class="supercontent">
      <div v-if="isAuthenticated" class="container">
        <Breadcrumbs></Breadcrumbs>
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped>
@import "./assets/css/base.css";
@import "./assets/css/style.css";
@import "./assets/css/temp.css";
@import "../node_modules/select2/dist/css/select2.min.css";
@import url("https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css");
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap");
</style>

<script>
import LocaleSwitcher from './components/LocaleSwitcher'
import 'floating-vue/dist/style.css'

require('material-icons');


export default {
  name: 'App',
  components: {
    LocaleSwitcher
  },
  computed: {
    isAuthenticated() {
      return this.$store.getters['auth/isAuthenticated'];
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('auth/logout').then(() => {
        this.$router.push({name: 'login'});
      });
    }
  },
  mounted() {
    this.$store.dispatch('auth/autologin');
    this.$store.dispatch('lang/loadLanguage', this.$i18n);
  }
}
</script>>
