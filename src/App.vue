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
          <router-link :to="{name: 'myprojects'}" class="btn-top"><span>{{ $t('myProjects.myProjects') }}</span><i
              class="material-icons">layers</i></router-link>
          <a target="_blank" href="https://www.transapp.cl" class="btn-top"><span>{{ $t('general.website') }}</span><i
              class="material-icons">public</i></a>
          <a target="_blank" href="https://www.transapp.cl/servicios-transapp/#contacto"
             class="btn-top"><span>{{ $t('general.contact') }}</span><i class="material-icons">mail</i></a>
        </div>
      </div>
    </header>
    <div class="supercontent">
      <div class="container">
        <Breadcrumbs></Breadcrumbs>
        <div class="user-bar">
          <router-link v-if="!isUserLoggedIn" :to="{ name: 'login' }" class="login-button">Log In</router-link>
          <router-link v-if="!isUserLoggedIn" :to="{ name: 'register' }" class="signin-button">Sign Up</router-link>
          <router-link v-if="isUserLoggedIn" @click="logout" :to="{ name: 'login' }" class="logout-button" >Log Out</router-link>
        </div>
      </div>
      <router-view @userLoggedIn="onUserLoggedIn"></router-view>
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
import {LANGUAGE_KEY} from '@/utils/consts.js';
import LocaleSwitcher from './components/LocaleSwitcher'
import 'v-tooltip/dist/v-tooltip.css';
import auth from "./api/user/auth";

require('material-icons');


export default {
  name: 'App',
  components: {
    LocaleSwitcher
  },
  data: function () {
    return {
      isUserLoggedIn: false
    }
  },
  methods: {
    onUserLoggedIn(isLoggedIn) {
      this.isUserLoggedIn = isLoggedIn;
    },
    logout() {
      auth.logout().then(() => {
        this.isUserLoggedIn = false;
      }).catch((error) => {
        console.error('Error logging out:', error);
      });
    }
  },
  mounted() {
    let locale = window.localStorage.getItem(LANGUAGE_KEY);
    if (locale) {
      this.$i18n.locale = locale;
    }
  }
}
</script>>
