<template>
  <div>
    <img id="header-logo" alt="Cloud fuer wohnungslose Menschen" src="./../assets/cloud-logo.png" />
    <div class="login">
      <v-icon class="fancy-icon" x-large> mdi-lock </v-icon>
      <!-- ml: ACCESS TO THE CLOUD FOR HOMELESS PEOPLE -->
      <h2 class="header-title" v-html="$ml.get('header_title')"></h2>
      <!-- ml: Login name -->
      <!-- ml: firstname.lastname.birthyear | example: John.Doe.1990 -->
      <v-text-field
        :disabled="this.status.loading"
        v-model="username_login"
        filled
        :label="$ml.get('username_placeholder')"
        :hint="$ml.get('username_hint')"
        @input="update_username"
      >
      </v-text-field>
      <!-- ml: Password -->
      <!-- ml: Remember to never tell your password to anyone - even we will never ask you for it! -->
      <v-text-field
        :disabled="this.status.loading"
        v-model="password_login"
        filled
        name="input-10-1"
        :append-icon="showpassword ? 'mdi-eye' : 'mdi-eye-off'"
        :type="showpassword ? 'text' : 'password'"
        :label="$ml.get('password_placeholder')"
        :hint="$ml.get('password_hint')"
        @click:append="showpassword = !showpassword"
        @keyup.enter="login()"
        @input="update_password"
      >
      </v-text-field>
      <!-- Anmelden -->
      <v-btn
        :disabled="this.status.loading"
        class="login-button"
        style="color: #fff"
        v-html="$ml.get('login_button')"
        rounded
        x-large
        color="#009e73"
        @click="login()"
        @keyup.enter="login()"
      >
      </v-btn>
    </div>
    <!--loading overlay -->
    <v-overlay :absolute="false" :value="status.loading">
      <div v-if="this.status.loading || (!this.status.logged_in && this.status.loading)">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
    </v-overlay>
  </div>
</template>

<script>
export default {
  name: 'Login',

  props: {
    loggedIn: Boolean,
    status: Object
  },

  data() {
    return {
      dialog: false,
      showpassword: false,
      password_login: '',
      username_login: ''
    };
  },

  methods: {
    /**
     * Emits a 'login'-event and resets the password and name
     */
    login() {
      this.$emit('login');
      // no use for clear text pw storage, rest will be handled via tokens
      this.password_login = '';
      this.username_login = '';
    },
    /**
     * Emits a 'update_password'-Event with the password typed in
     */
    update_password() {
      this.$emit('update_password', this.password_login);
    },
    /**
     * Emits a 'update_username'-Event with the username typed in
     */
    update_username() {
      this.$emit('update_username', this.username_login);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.login {
  background: #fff;
  width: 30%;
  margin-left: 35%;
  height: 65vh;
  padding: 3%;
  border-radius: 50px;
}

.fancy-icon {
  font-size: 50px !important;
  color: #009e73 !important;
  padding-bottom: 2% !important;
}

#header-logo {
  padding: 3% 5% 3% 5%;
  width: 40%;
}

.header-title {
  color: #009e73;
  margin-bottom: 10%;
  font-size: 1.3em;
}
.login-button {
  margin-top: 10%;
  font-size: 20px;
}

.pw-vergessen {
  margin-top: 2%;
  width: 100%;
}

@media only screen and (max-width: 700px) {
  #header-logo {
    padding: 0;
    width: 50%;
    margin: 15% 25% 5% 25%;
  }

  .login {
    background: #fff;
    width: 90%;
    margin-left: 5%;
    height: 450px;
    padding: 5%;
    border-radius: 50px;
  }
  .header-title {
    color: #009e73;
    margin-bottom: 10%;
    font-size: 1.3em;
  }
}
</style>
