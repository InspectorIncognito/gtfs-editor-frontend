<template>
  <div class="body">
    <div class="user-container">
      <div id="login" class="user-form-container">
        <div class="user-header">User Log In</div>
        <form class= "user-form" @submit.prevent="login">
          <div>
            <label for="username">Username:</label>
            <input type="text" id="username" v-model="username" required>
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" id="password" v-model="password" required>
            <a href="/ruta-recuperar-contraseña">Forgot Password?</a>
          </div>
          <div>
            <button class="btn" type="submit">Login</button>
          </div>
        </form>
        <div class="user-link">
          <label>Don't have an account?</label>
          <a href="/register">SIGN UP NOW</a>
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
      }).catch((error) => {
        //Cambiar esto
        this.errors = error.response.data;
      });
    },
  },
};
</script>