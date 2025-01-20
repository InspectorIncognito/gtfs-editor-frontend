<template>
  <div class="body">
    <div class="user-container">
      <div id="login" class="user-form-container">
        <div class="user-header">{{ $t('user.login') }}</div>
        <form class="user-form" @submit.prevent="login">
          <div>
            <label for="username">{{ $t('user.username') }}:</label>
            <input name="username" type="text" id="username" v-model="username" required>
          </div>
          <div>
            <label for="password">{{ $t('user.password') }}:</label>
            <input name="password" type="password" id="password" v-model="password" required>
            <a href="/recover-password-request">{{ $t('user.forgotPasswordQuestion') }}</a>
          </div>
          <div>
            <button id="login-button" class="btn" type="submit">{{ $t('user.login') }}</button>
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
      try {
        await this.$store.dispatch("auth/login", {
          username: this.username,
          password: this.password,
        }).then(() => {
          this.$router.push({name: 'myprojects'});
        }).catch((error) => {
          if (error.response && error.response.data) {
            this.errors = error.response.data;
          }
        })
      } catch {
        this.errors = "Ocurrió un problema inesperado. Intenta nuevamente."
      }
    },
  },
};
</script>