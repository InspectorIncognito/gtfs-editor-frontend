<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit">Login</button>
    </form>
    <div v-if="errors">{{ errors }}</div>
  </div>
</template>

<script>
import auth from '@/api/user/auth'
import httpClient from "../api/httpClient";

export default {
  data() {
    return {
      username: null,
      password: null,
      errors: {}
    };
  },
  methods: {
    async login() {
      auth.login(this.username, this.password).then(response => {
        const token = response.data;

        httpClient.defaults.headers.common['HTTP_USER_ID'] = this.username;
        httpClient.defaults.headers.common['HTTP_USER_TOKEN'] = token;

        this.error = {};
      }).catch((error) => {
        this.errors = error.response.data;
      });
    },
  },
};
</script>