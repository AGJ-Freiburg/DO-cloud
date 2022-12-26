<template>
  <div>
    <v-form v-if="!loading" v-model="valid" ref="form">
      <br />
      <p v-html="$ml.get('create_member_help')"></p>
      <br />
      <v-divider></v-divider>
      <br />
      <!-- ml: First and last name -->
      <v-text-field v-model="newinstitution_member.name" required :label="$ml.get('name')">
      </v-text-field>
      <!-- ml: E-mail address -->
      <v-text-field
        v-model="newinstitution_member.email"
        required
        :label="$ml.get('email_placeholder')"
        :rules="emailRules"
      >
      </v-text-field>
      <!-- ml: Set password now -->
      <v-checkbox v-model="newinstitution_member.passwort_empty" :label="$ml.get('pw_create')">
      </v-checkbox>
      <!-- ml: Password -->
      <div v-if="newinstitution_member.passwort_empty">
        <v-text-field
          v-model="newinstitution_member.newpassword"
          :label="$ml.get('password_placeholder')"
          :rules="pwRules"
        >
        </v-text-field>
        <!-- ml: Repeat password -->
        <v-text-field
          v-model="newinstitution_member.newpassword_repeat"
          :label="$ml.get('repeat_password')"
          :rules="pw2Rules"
        >
        </v-text-field>
      </div>
      <!-- ml: Create acccount -->
      <v-btn
        :disabled="!valid"
        style="color: #fff"
        v-html="$ml.get('create_account')"
        color="#006AB3"
        @click="admin_create_new_user_in_group"
      >
      </v-btn>
    </v-form>
    <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>
  </div>
</template>

<script>
export default {
  name: 'CreateMember',

  props: {
    institution: String,
    loading: Boolean,
    shown: Boolean
  },

  data() {
    return {
      newinstitution_member: {
        name: '',
        email: '',
        newpassword: '',
        newpassword_repeat: '',
        passwort_empty: false,
        email_valid: false
      },
      edits: [],
      componentKey: 0,
      emailRules: [
        v =>
          !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || this.$ml.get('email_rule')
      ],
      valid: false,
      pwRules: [
        // ml: The filed must not be empty
        value => !!value || this.$ml.get('pw_rules_empty'),
        // ml: The password has to be at least 10 characters long
        value => (value && value.length >= 10) || this.$ml.get('pw_rules_min'),
        value => (value && value.length >= 10) || this.$ml.get('pw_rules_min')
      ],
      pw2Rules: [
        // ml: The filed must not be empty
        value => !!value || this.$ml.get('pw_rules_empty'),
        value =>
          // The passwords must match
          value === this.newinstitution_member.newpassword || this.$ml.get('pw_rules_match')
      ]
    };
  },

  watch: {
    // if shown changes to false reset the following data
    shown(v) {
      if (v === false) {
        this.newsozi = {
          name: '',
          email: '',
          newpassword: '',
          newpassword_repeat: ''
        };
        this.newinstitution_member = {
          name: '',
          email: '',
          newpassword: '',
          newpassword_repeat: '',
          passwort_empty: false
        };
      }
    }
  },

  methods: {
    /**
     * Emits a 'admin_create_new_user_in_group'-Event and resets the values needed afterwards
     */
    admin_create_new_user_in_group() {
      this.$emit(
        'admin_create_new_user_in_group',
        this.newinstitution_member.name,
        this.newinstitution_member.newpassword,
        this.newinstitution_member.email,
        this.institution
      );
      this.newsozi = {
        name: '',
        email: '',
        newpassword: '',
        newpassword_repeat: ''
      };
      this.newinstitution_member = {
        name: '',
        email: '',
        newpassword: '',
        newpassword_repeat: '',
        passwort_empty: false
      };
      (this.newpassword = ''), (this.newpassword_repeat = '');
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
