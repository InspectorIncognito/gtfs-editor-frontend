<template>
  <div class="body">
    <div class="user-container">
      <div id="register" class="user-form-container">
        <div class="user-header">Create Account</div>
        <form class="user-form" @submit.prevent="registerUser">
          <div>
            <label for="username">Username:</label>
            <input type="text" id="username" v-model="registerData.username" required />
          </div>
          <div>
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="registerData.email" required />
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" id="password" v-model="registerData.password" required />
          </div>
          <div>
            <label for="name">Name:</label>
            <input type="text" id="name" v-model="registerData.name" required />
          </div>
          <div>
            <label for="last_name">Last Name:</label>
            <input type="text" id="last_name" v-model="registerData.last_name" required />
          </div>
          <div>
            <button class="btn" type="submit">Sign Up</button>
          </div>
        </form>
        <div class="user-link">
          <label>Already have an account?</label>
          <a href="/login">LOGIN</a>
        </div>
        <div v-if="errors">{{ errors }}</div>
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
      errors: ''
    };
  },
  methods: {
    async registerUser() {
      register.register(this.registerData).then(() => {
        //Cambiar esto
        console.log('registro exitoso');
      }).catch((error) => {
        //Cambiar esto
        this.errors = error.response.data;
      });
    },
  },
};
</script>
