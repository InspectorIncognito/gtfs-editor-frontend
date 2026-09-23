<template>
  <div class="body">
    <div class="user-container">
      <div v-if="!mailSent" id= "recover-password-request" class="user-form-container">
        <div class="user-header">{{ $t('user.forgotPasswordTitle') }}</div>
        <div class="user-remark">
          {{ $t('user.recoverPasswordInstruction') }}
        </div>
        <form class= "user-form" @submit.prevent="recoverPasswordRequest">
          <div>
            <label for="username">{{ $t('user.email') }} ({{ $t('user.username') }}):</label>
            <input type="text" id="username" v-model="username" required>
          </div>
          <div>
            <button class="btn" type="submit">{{ $t('user.sendEmail') }}</button>
          </div>
        </form>
        <div class="user-link">
          <label>{{ $t('user.recoverPasswordEmailNote') }}</label>
        </div>
      </div>
      <div v-if="mailSent" class="user-success-message">
        <p>{{ $t('user.recoverPasswordSentMessage') }}</p>
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