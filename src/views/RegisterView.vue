<template>
  <div class="body">
    <div class="user-container">
      <div v-if="!registered" id="register" class="user-form-container">
        <div class="user-header">{{ $t("user.createAccount") }}</div>
        <form class="user-form" @submit.prevent="validate">
          <div>
            <label for="email">{{ $t("user.email") }} ({{ $t("user.username") }}):</label>
            <input type="email" id="email" v-model="registerData.email" required/>
          </div>
          <div>
            <label for="name">{{ $t("user.name") }}:</label>
            <input type="text" id="name" v-model="registerData.name" required/>
          </div>
          <div>
            <label for="last_name">{{ $t("user.lastName") }}:</label>
            <input type="text" id="last_name" v-model="registerData.last_name" required/>
          </div>
          <div>
            <label for="password">{{ $t("user.password") }}:</label>
            <input type="password" id="password" v-model="registerData.password" required/>
          </div>
          <div>
            <label for="confirm-password">{{ $t("user.confirmPassword") }}:</label>
            <input type="password" id="confirm-password" v-model="confirmPassword" required>
          </div>
          <div>
            <button class="btn" type="submit">{{ $t("user.signup") }}</button>
          </div>
        </form>
        <div class="user-link">
          <label>{{ $t("user.haveAccountQuestion") }}</label>
          <a href="/login">{{ $t("user.login") }}</a>
        </div>
        <div v-if="errors">{{ errors }}</div>
      </div>
      <div v-if="registered" class="user-success-message">
        {{ $t("user.accountCreatedSuccessfully") }}
      </div>
    </div>
  </div>
</template>

<script>
import register from "../api/user/register";

export default {
  data() {
    return {
      registerData: {
        username: null,
        email: null,
        password: null,
        name: null,
        last_name: null,
      },
      confirmPassword: null,
      registered: false,
      errors: ''
    };
  },
  methods: {
    async registerUser() {
      this.registerData.username = this.registerData.email;
      register.register(this.registerData).then(() => {
        console.log('registro exitoso');
        this.registered = true;
      }).catch((error) => {
        this.errors = error.response.data;
      });
    },
    validate() {
      if (this.validatePassword() && this.validateMatch()) {
        this.registerUser();
      }
    },
    validateMatch() {
      if (this.registerData.password === this.confirmPassword) {
        return true;
      } else {
        this.errors = 'Passwords do not match.';
        return false;
      }
    },
    validatePassword() {
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
      const isValid = passwordRegex.test(this.registerData.password);
      if (!isValid) {
        this.errors = 'The password must be at least 8 characters long and ' +
            'contain at least one uppercase letter, one lowercase letter, and one number.';
      }
      return isValid;
    }
  },
};
</script>
