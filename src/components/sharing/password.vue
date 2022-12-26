<template>
  <div>
    <v-dialog v-model="dialog" width="600px">
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          style="margin-right: 7px"
          v-bind="attrs"
          v-on="on"
          :color="password != undefined && password != '' ? '#99b533' : ''"
        >
          mdi-key
        </v-icon>
      </template>
      <v-card>
        <v-card-title>
          <h4 v-html="$ml.get('sharing_protect_pw_cb')"></h4>
        </v-card-title>
        <br />
        <v-divider></v-divider>
        <v-card-text>
          <v-form ref="form" v-model="sharing_pw_form_valid" lazy-validation>
            <v-text-field
              v-model="pw"
              background-color="#f1f3f4"
              height="50"
              required
              :label="$ml.get('password_placeholder')"
              :rules="[rules.min]"
              :type="show_sharing_pw ? 'text' : 'password'"
              @click:append="show_sharing_pw = !show_sharing_pw"
            >
            </v-text-field>
            <v-btn
              :disabled="!sharing_pw_form_valid"
              @click="
                () => {
                  update();
                  dialog = false;
                }
              "
              @keyup.enter="
                () => {
                  update();
                  dialog = false;
                }
              "
            >
              <p v-html="$ml.get('save')"></p>
            </v-btn>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-btn
          :disabled="!sharing_pw_form_valid"
          @click="
            () => {
              this.pw = '';
              update();
              dialog = false;
            }
          "
        >
          <p v-html="$ml.get('remove_password')"></p>
        </v-btn>
        <v-card-actions>
          <v-btn v-html="$ml.get('close')" text @click="dialog = false"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'passwordModal',

  props: {
    password: String
  },

  data() {
    return {
      dialog: false,
      pw: '',
      rules: {
        // The field must not be empty
        empty: v => !!v || this.$ml.get('pw_rules_empty'),
        // Password must have at least 10 characters
        min: v => (v && v.length >= 10) || this.$ml.get('pw_rules_min'),
        // The passwords must match
        match: v => this.pwresetquery_new === v || this.$ml.get('pw_rules_match'),
        dirmaxlength: v => (v && v.length <= 30) || this.$ml.get('dir_rules_maxlength')
      },
      show_sharing_pw: false,
      sharing_pw_form_valid: false
    };
  },

  mounted() {
    // when mounted set 'pw' to a dummy value
    this.pw = '*************';
  },

  watch: {
    // if 'password'-value changes to beeing undefinded or empty change 'pw' also to an empty value
    password(v) {
      if (v === undefined || v === '') {
        this.pw = '';
      // else show a dummy password
      } else {
        this.pw = '*************';
      }
    }
  },

  methods: {
    /**
     * Emits a 'updateShare'-Event, with the Key = 'password' and the password, afterwards reset
     */
    update() {
      this.$emit('update_share', 'password', this.pw);
      this.pw = '';
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style></style>
