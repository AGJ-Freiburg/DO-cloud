<template>
  <div class="ml-menu-profile">
    <v-select
      v-model="lang"
      class="ml-profile"
      menu-props="auto"
      label="Sprache / Language"
      hide-details
      prepend-icon="mdi-translate"
      single-line
      :items="$ml.list"
    >
    </v-select>
  </div>
</template>

<script>
export default {
  name: 'LanguagePickerProfile',

  data() {
    return {
      lang: undefined
    };
  },

  mounted() {
    // when mounted set the 'lang'-variable to the value of the current ml-language
    this.lang = this.$ml.current;
  },

  watch: {
    // if variable 'lang' changes also change current ml-language
    lang() {
      this.$ml.change(this.lang);
      this.$emit("checkLanguageSettings");
    }
  }
};
</script>

<style></style>
