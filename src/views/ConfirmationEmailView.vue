<template>
  <div class="body">
    <div class="user-container">
      <div v-if="verify" class="user-success-message">
        Your email has been successfully verified.
      </div>
      <div v-if="errors">{{ errors }}</div>
    </div>
  </div>

</template>

<script>
import confirmationEmail from "../api/user/confirmationEmail";

export default {
  props: ['verificationToken'],
  data(){
    return {
      errors: '',
      verify: false
    };
  },
  beforeRouteEnter(to, from, next){
    const verificationToken = to.params.verificationToken;
    next(vm => {
      vm.verifyEmail(verificationToken);
    });
  },
  methods: {
    verifyEmail(token) {
      confirmationEmail.confirmationEmail(token).then(() => {
        this.verify = true;
      }).catch((error) => {
        this.errors = error.response.data;
      });
    }
  }
};
</script>
