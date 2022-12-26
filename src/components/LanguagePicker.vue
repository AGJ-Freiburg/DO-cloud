<template>
  <div class="ml-menu">
    <v-select
      v-model="lang"
      class="ml"
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
  name: 'LanguagePicker',

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
    }
  }
};
</script>

<style>
.ml {
  padding-top: 0px;
  margin-left: auto;
  margin-bottom: 20px;
  width: 100%;
  color: white !important;
  position: relative;
  left: 0px;
  top: 0px;
}

.ml-menu {
  position: fixed;
  background: #fff;
  bottom: 50px;
  right: 50px;
  border-radius: 50px;
  width: 10%;
  height: 50px;
  padding: 5px 15px;
  z-index: 10;
}

.ml.v-text-field {
  padding-top: 0px !important;
}

@media only screen and (max-width: 700px) {
  .ml-menu {
    width: 50%;
    bottom: 60px;
    right: 5%;
  }
}
</style>
