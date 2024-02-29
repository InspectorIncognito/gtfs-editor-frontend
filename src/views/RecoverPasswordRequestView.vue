<template>
  <div class="body">
    <div class="user-container">
      <div v-if="!mailSent" id= "recover-password-request" class="user-form-container">
        <div class="user-header">Forgot Password?</div>
        <div class="user-remark">
          Please enter your username.
        </div>
        <form class= "user-form" @submit.prevent="recoverPasswordRequest">
          <div>
            <label for="username">Username:</label>
            <input type="text" id="username" v-model="username" required>
          </div>
          <div>
            <button class="btn" type="submit">SEND EMAIL</button>
          </div>
        </form>
        <div class="user-link">
          <label>You will receive an <b>email</b> with instructions to <b>reset your password</b></label>
        </div>
      </div>
      <div v-if="mailSent" class="user-success-message">
        <p>Your <b>email has been successfully sent.</b>
          Please check your inbox for further instructions on how to <b>reset your password.</b>
          If you <b>don't receive an email</b>, please contact support for assistance.</p>
      </div>
      <div v-if="errors">{{ errors }}</div>
    </div>

  </div>
</template>

<script>
import recoverPassword from "../api/user/recoverPassword";

export default {
  data() {
    return {
      username: null,
      mailSent: false,
      errors: ''
    };
  },
  methods: {
    async recoverPasswordRequest() {
      recoverPassword.recoverPasswordRequest(this.username).then(() => {
        this.error = '';
        this.mailSent = true;
      }).catch((error) => {
        this.errors = error.response.data;
      });
    },
  },
};
</script>