<template>
  <v-form v-if="!loading" v-model="pw_change_form_valid" ref="form" lazy-validation>
    <!-- ml: Name -->
    <v-text-field
      :disabled="true"
      v-model="institution_member.id"
      :key="componentKey"
      :label="$ml.get('name_short')"
    >
    </v-text-field>
    <!-- ml: E-mail address -->
    <v-text-field
      :disabled="!edit"
      v-model="institution_member.email"
      :label="$ml.get('email_placeholder')"
    >
    </v-text-field>
    <!-- ml: Password -->
    <v-text-field
      :disabled="!edit"
      v-model="pwresetquery_new"
      type="password"
      required
      :rules="[rules.empty, rules.min]"
      :label="$ml.get('new_password')"
    >
    </v-text-field>
    <v-text-field
      :disabled="!edit"
      v-model="pwresetquery_repeat"
      type="password"
      required
      :rules="[rules.empty, rules.match]"
      :label="$ml.get('repeat_new_password')"
    >
    </v-text-field>
    <!-- ml: Edit account -->
    <v-btn
      v-if="!edit"
      v-html="$ml.get('edit_account')"
      @click="
        enableedit();
        pwresetquery_new = '';
        pwresetquery_repeat = '';
      "
    >
      &nbsp;
      <v-icon> mdi-pencil </v-icon>
    </v-btn>
    <v-btn
      v-if="edit"
      v-html="$ml.get('cancel')"
      @click="
        disableedit();
        pwresetquery_new = '*****************';
        pwresetquery_repeat = '*****************';
      "
    >
    </v-btn>
    &nbsp;&nbsp;
    <v-btn
      v-if="edit"
      :disabled="!pw_change_form_valid || pwresetquery_new === '*****************'"
      v-html="$ml.get('save')"
      style="color: #fff"
      color="#006AB3"
      @click="save(institution_member)"
    >
    </v-btn>
    <br /><br />
    <!-- @TODO codeleiche ml: Last login -->
    <!--
    <p v-html="$ml.get('last_login')">
      &nbsp;
      {{
        institution_member.lastLogin === 0
          ? $ml.get('never_logged_in')
          : institution_member.lastLogin
      }}
    </p>
    -->
    <br />
    <!-- ml: Storage: {0}% of {1} used -->
    <!-- 
    <p
      v-html="
        $ml
          .get('quota_used_social')
          .replace('{0}', institution_member.quota_percent)
          .replace('{1}', institution_member.quota_max_string)
      "
    ></p>
    -->
    <br />
    <!-- ml: Delete account -->
    <!--
    <v-btn @click="delete_member(institution_member, institution)"
      ><p v-html="$ml.get('delete_account')"></p></v-btn
    ><br /><br />
 -->
    <!-- ml: Resend the welcome e-mail -->
    <v-btn @click="resend_welcome(institution_member.id)">
      <p v-html="$ml.get('resend_welcome_email')"></p>
    </v-btn>
    <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>
  </v-form>
</template>

<script>
export default {
  name: 'MemberControl',

  props: {
    institution: String,
    institution_member: Object,
    loading: Boolean,
    shown: Boolean
  },

  data() {
    return {
      edit: false,
      componentKey: 0,
      pwresetquery_new: '*****************',
      pwresetquery_repeat: '*****************',
      // rules for password creation
      rules: {
        empty: v => !!v || this.$ml.get('pw_rules_empty'),
        min: v => (v && v.length >= 10) || this.$ml.get('pw_rules_min'),
        match: v => this.pwresetquery_new === v || this.$ml.get('pw_rules_match')
      },
      pw_change_form_valid: true,
      old_member_infos: undefined
    };
  },

  mounted() {
    // if mounted set the password to dummy password
    this.pwresetquery_new = '*****************';
    this.pwresetquery_repeat = '*****************';
    // deactivate the edit-option 
    this.edit = false;
    this.old_member_infos = structuredClone(this.institution_member);
  },

  watch: {
    shown(v) {
      if (v === false) {
        // if shown gets set false set the password to dummy password and deactivate the edit-option
        this.edit = false;
        this.pwresetquery_new= '*****************';
        this.pwresetquery_repeat= '*****************';
            } else if (v == true) {
        this.old_member_infos = structuredClone(this.institution_member);
      }
    },
    // when loading gets set false force rendering
    loading(v) {
      if (!v) {
        this.forceRerender();
      }
    }
  },

  methods: {
    /**
     * Emits a 'resend_welcome'-Event with the ID of the member
     *
     * @param {String} id The ID of the member which should reseve another welcome-mail
     */
    resend_welcome(id) {
      this.$emit('resend_welcome', id);
    },
    /**
     * Logs the informtion which should be saved and calls the 'update_member'-function. Afterwards disables the edit possibility
     *
     * @param {Object} institution_member The member with all its informations
     */
    save(institution_member) {
      this.update_member(
        institution_member.id,
        institution_member.email,
        institution_member.id,
        this.pwresetquery_repeat
      );
      this.disableedit();
    },
    /**
     * Enables the text fields
     */
    enableedit() {
      this.edit = true;
      this.forceRerender();
    },
    /**
     * Disables the text fields
     */
    disableedit() {
      this.edit = false;
      this.forceRerender();
    },
    /** @TODO dead code
     * Function to update the informations of a member
     *
     * @param {String} memberid The ID of the member which should be updated
     * @param {String} email The new email-value
     * @param {String} displayname The new displayname-value
     * @param {String} password The new password-value
     */
    update_member(memberid, email, displayname, password) {
      if (memberid !== undefined) {
        let updates = {};
        /**
        if (displayname !== undefined && this.old_member_infos.id !== displayname) {
          updates.id = displayname;
        } else {
          () => {};
        }
        */
        if (email !== undefined && this.old_member_infos.email !== email) {
          updates.email = email;
        } else {
          () => {};
        }
        if (password !== undefined) {
          updates.password = password;
        } else {
          () => {};
        }
        this.$emit('admin_update_member', memberid, updates, this.institution);
      }
    },
    /**
     * Forces Vue to rerender the object
     */
    forceRerender() {
      this.componentKey += 1;
    },
    /**
     * Emits a 'admin_delete'-Event with the member to delete and its institution
     *
     * @param {String} institution_member The member which should be deleted
     * @param {String} insitution The insitution of this member
     */
    delete_member(institution_member, insitution) {
      this.$emit('admin_delete', institution_member.id, insitution);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
