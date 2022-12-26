<template>
  <v-snackbar v-model="dialog_intern" class="snackbar" :timeout="timeout" :color="color">
    <p>
      {{ this.message }}
    </p>
    <template v-slot:action="{ attrs }">
      <v-btn v-bind="attrs" text @click="dialog_intern = false">
        <p v-html="$ml.get('close')"></p>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  name: 'Toast',
  
  props: {
    dialog: Boolean,
    timeout: Number,
    message: String,
    color: String
  },

  data() {
    return {
      dialog_intern: undefined
    };
  },
  
  watch: {
    // if dialog changes, set dialog_intern to its value
    dialog(v) {
      this.dialog_intern = v;
    },
    // if message changes, set dialog_intern to dialogs value
    message() {
      this.dialog_intern = this.dialog;
    }
  }
};
</script>

<style>
.snackbar {
  margin-bottom: 50px;
}
</style>
