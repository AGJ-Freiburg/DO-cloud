<template>
  <div class="auto-logout">
    <v-dialog
      v-model="dialog_warning_autologout"
      class="logout-dialog"
      max-width="500"
      @click:outside="$emit('resetCountDown')"
    >
      <v-card max-width="500">
        <!-- MLME -->
        <v-card-title class="text-wrap">
          <h3 v-html="$ml.get('soon_logout').replace('{0}', countDownCounter)"></h3>
        </v-card-title>
        <v-card-actions class="vcard-actions">
          <v-btn class="auto-logout-btn" @click="$emit('resetCountDown')">
            <p v-html="$ml.get('pls_reset_time')"></p>
          </v-btn>
          <v-btn class="auto-logout-btn" @click="$emit('logout')">
            <p v-html="$ml.get('logout_button')"></p>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'AutoLogout',

  props: {
    countDownCounter: Number
  },

  data() {
    return {
      dialog_warning_autologout: true
    };
  },

  watch: {
    // if modal gets closed, emit 'resetCountDown'-Event
    dialog_warning_autologout(v) {
      if (v === false) {
        this.$emit('resetCountDown');
      }
    }
  }
};
</script>

<style scoped>
.logout-dialog {
  /* overflow: hidden !important; */
  justify-content: center !important;
}

.vcard-actions {
  justify-content: center !important;
}

.auto-logout-btn {
  background: #003f69 !important;
  color: #fff !important;
  /* font-size: 14px; */
  margin: 10px;
}

.v-card__title {
  word-break: normal !important;
  white-space: normal !important;
  word-wrap: break-word !important;
  color: #003f69;
  display: inline-block !important;
}
</style>
