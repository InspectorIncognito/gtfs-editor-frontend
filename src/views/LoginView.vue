<template>
  <div class="body">
    <div class="user-container">
      <div id="login" class="user-form-container">
        <div class="user-header">{{ $t('user.login') }}</div>
        <form class= "user-form" @submit.prevent="login">
          <div>
            <label for="username">{{ $t('user.username') }}:</label>
            <input type="text" id="username" v-model="username" required>
          </div>
          <div>
            <label for="password">{{ $t('user.password') }}:</label>
            <input type="password" id="password" v-model="password" required>
            <a href="/recover-password-request">{{ $t('user.forgotPasswordQuestion') }}</a>
          </div>
          <div>
            <button class="btn" type="submit">{{ $t('user.login') }}</button>
          </div>
        </form>
        <div class="user-link">
          <a href="/register">{{ $t('user.createAccount') }}</a>
        </div>
      </div>
      <div v-if="errors">{{ errors }}</div>
    </div>
  </div>
</template>

<script>
import auth from "../api/user/auth";
import httpClient from "../api/httpClient";

export default {
  data() {
    return {
      username: null,
      password: null,
      errors: ''
    };
  },
  methods: {
    async login() {
      auth.login(this.username, this.password).then(response => {
        const token = response.data;

        httpClient.defaults.headers.common['HTTP_USER_ID'] = this.username;
        httpClient.defaults.headers.common['HTTP_USER_TOKEN'] = token;

        this.error = '';
        this.$emit('userLoggedIn', true);
        this.$router.push({ name: 'myprojects' });
      }).catch((error) => {
        this.errors = error.response.data;
      });
    },
  },
};
</script>