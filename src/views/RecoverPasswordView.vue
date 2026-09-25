<template>
  <div class="body">
    <div class="user-container">
      <div id="recover-password" class="user-form-container">
        <div class="user-header">{{ $t('user.newPasswordTitle') }}</div>
        <div class="user-remark">
          {{ $t('user.newPasswordInstruction') }}
        </div>
        <form class= "user-form" @submit.prevent="validate">
          <div>
            <label for="password">{{ $t('user.newPassword') }}:</label>
            <input type="password" id="password" v-model="password" required>
          </div>
          <div>
            <label for="confirm-password">{{ $t('user.confirmPassword') }}:</label>
            <input type="password" id="confirm-password" v-model="confirmPassword" required>
          </div>
          <div>
            <button class="btn" type="submit">{{ $t('user.change') }}</button>
          </div>
        </form>
      </div>
      <div v-if="errors">{{ errors }}</div>
    </div>

  </div>
</template>

<script>
import recoverPassword from "../api/user/recoverPassword";

export default {
  props: ['recoveryToken'],
  data() {
    return {
      password: null,
      confirmPassword: null,
      errors: ''
    };
  },
  methods: {
    async change() {
      recoverPassword.recoverPassword(this.password, this.recoveryToken).then(() => {
        this.error = '';
        this.$router.push({name: 'login'})
      }).catch((error) => {
        this.errors = error.response.data;
      });
    },
    validate() {
      if (this.password === this.confirmPassword) {
        this.change();
      } else {
        this.errors = this.$t('user.passwordsDoNotMatch');
      }
    }
  },
};
</script>