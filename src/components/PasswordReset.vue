<!-- TODO RENAME THIS maYBE... its more then pw reset... Neuer Name: UserProfile-->
<template>
  <div class="pw-reset">
    <v-dialog v-model="dialog_pwreset" width="600px">
      <template v-slot:activator="{ on, attrs }">
        <div class="logout-desktop" v-bind="attrs" v-on="on">
          <v-icon> mdi-account </v-icon>
          <p>
            {{ truncate(status.username, 21) }}
          </p>
        </div>
      </template>
      <v-card>
        <v-card-title>
          <!-- ml: Your Institution: {0} -->
          <v-icon> mdi-home </v-icon>
          <h4 v-html="$ml.get('your_institution').replace('{0}', group)"></h4>
        </v-card-title>
        <p v-html="$ml.get('your_email')"></p>
        <p>
          {{ status.email }}
        </p>
        <v-card-text>
          <v-divider></v-divider>
          <br />
          <span class="text-h5" v-html="$ml.get('change_password')"></span>
          <v-form v-model="pw_change_form_valid" lazy-validation ref="form">
            <br />
            <v-text-field
              v-model="pwresetquery_current"
              class="pw_text-field"
              filled
              required
              name="input-10-1"
              :label="$ml.get('current_password')"
              :append-icon="show_current_pw ? 'mdi-eye' : 'mdi-eye-off'"
              :type="show_current_pw ? 'text' : 'password'"
              :rules="[rules.empty]"
              @click:append="show_current_pw = !show_current_pw"
              @keyup.enter="
                $emit('change_pw', pwresetquery_current, pwresetquery_new);
                dialog_pwreset = false;
                pwresetquery_current = '';
                pwresetquery_new = '';
                pwresetquery_repeat = '';
                pw_change_form_valid = true;
              "
            >
            </v-text-field>
            <br />
            <v-text-field
              v-model="pwresetquery_new"
              class="pw_text-field"
              filled
              required
              name="input-10-1"
              :label="$ml.get('new_password')"
              :append-icon="show_new_pw ? 'mdi-eye' : 'mdi-eye-off'"
              :type="show_new_pw ? 'text' : 'password'"
              :rules="[rules.empty, rules.min]"
              @click:append="show_new_pw = !show_new_pw"
              @keyup.enter="
                $emit('change_pw', pwresetquery_current, pwresetquery_new);
                dialog_pwreset = false;
                pwresetquery_current = '';
                pwresetquery_new = '';
                pwresetquery_repeat = '';
                pw_change_form_valid = true;
              "
            >
            </v-text-field>
            <br />
            <v-text-field
              v-model="pwresetquery_repeat"
              class="pw_text-field"
              filled
              required
              name="input-10-1"
              :label="$ml.get('repeat_new_password')"
              :append-icon="show_repeat_pw ? 'mdi-eye' : 'mdi-eye-off'"
              :type="show_repeat_pw ? 'text' : 'password'"
              :rules="[rules.empty, rules.match]"
              @click:append="show_repeat_pw = !show_repeat_pw"
              @keyup.enter="
                $emit('change_pw', pwresetquery_current, pwresetquery_new);
                dialog_pwreset = false;
                pwresetquery_current = '';
                pwresetquery_new = '';
                pwresetquery_repeat = '';
                pw_change_form_valid = true;
              "
            >
            </v-text-field>
          </v-form>
          <language-picker-profile 
          style="padding-bottom: 20px"
          @checkLanguageSettings="checkLanguageSettings"
          ></language-picker-profile>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="
              dialog_pwreset = false;
              pwresetquery_current = '';
              pwresetquery_new = '';
              pwresetquery_repeat = '';
            "
            v-html="$ml.get('close')"
          >
          </v-btn>
          <v-btn
            :disabled="!pw_change_form_valid"
            style="color: #fff; margin-left: 20px"
            v-html="$ml.get('change_password')"
            color="#003F69"
            @click="
              $emit('change_pw', pwresetquery_current, pwresetquery_new);
              dialog_pwreset = false;
              pwresetquery_current = '';
              pwresetquery_new = '';
              pwresetquery_repeat = '';
            "
            @keyup.enter="
              $emit('change_pw', pwresetquery_current, pwresetquery_new);
              dialog_pwreset = false;
              pwresetquery_current = '';
              pwresetquery_new = '';
              pwresetquery_repeat = '';
              pw_change_form_valid = true;
            "
          >
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import LanguagePickerProfile from './LanguagePickerProfile.vue';

export default {
  name: 'PasswordReset',

  components: {
    LanguagePickerProfile
  },

  props: {
    status: Object,
    group: String
  },

  data() {
    return {
      dialog_pwreset: false,
      show_current_pw: false,
      show_new_pw: false,
      show_repeat_pw: false,
      pwresetquery_current: '',
      pwresetquery_new: '',
      pwresetquery_repeat: '',
      // rules for password creation
      rules: {
        empty: v => !!v || this.$ml.get('pw_rules_empty'),
        min: v => (v && v.length >= 10) || this.$ml.get('pw_rules_min'),
        match: v => this.pwresetquery_new === v || this.$ml.get('pw_rules_match')
      },
      pw_change_form_valid: true
    };
  },

  methods: {
    /**
     * @TODO there are two truncate functions in the project - externalize them into a util
     * Truncates a string if it is longer than 'n'
     *
     * @param {String} str string which should be truncated
     * @param {Number} n maximum length the string should be
     */
    truncate(str, n) {
      return str.length > n ? str.slice(0, n - 1) + '...' : str;
    },
    /**
     * Chain emit for 'checkLanguageSettings'
     */
    checkLanguageSettings() {
      this.$emit("checkLanguageSettings");
    }
  }
};
</script>

<style scoped>
.pw_text-field.error--text,
.pw_text-field .error--text {
  color: red !important;
  background: rgba(255, 17, 17, 0.26) !important;
}
</style>
