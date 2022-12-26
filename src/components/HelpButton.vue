<template>
  <div style="cursor: pointer" class="help-menu" @click="help_dialog=true">
    <v-hover
      class="help"
      hide-details
      single-line
    >
      <!-- <v-icon dark @click="help_dialog=true">mdi-help</v-icon> -->
      <p style="font-size: 0.975rem !important; vertical-align: middle; text-align: middle" v-html="$ml.get('help')"><b></b></p>
    </v-hover>
    <v-dialog
    class="dialog-desktop"
    v-model="help_dialog"
    v-if="!mobile"
    >
    <v-card class="card">
      <iframe 
        width="100%"
        style="height:calc(100vh - 161px); border: none"
        src="https://dev.daten-oase.org/hilfe"
        allow="fullscreen"
        scrolling="no"
        >
        </iframe>
        <v-card-actions class="card-actions">
          <v-btn v-html="$ml.get('close')" text @click="help_dialog = false"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-if="mobile" v-model="help_dialog" class="dialog-mobile" fullscreen>
      <v-card class="card">
        <iframe
          width="100%"
          style="height: calc(100vh - 54px); border: none"
          src="https://dev.daten-oase.org/hilfe"
          allow="fullscreen"
          scrolling="no"
        >
        </iframe>
        <v-card-actions class="card-actions">
          <v-btn v-html="$ml.get('close')" text @click="help_dialog = false"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'HelpButton',

  props: {
    mobile: Boolean
  },

  data() {
    return {
      help_dialog: false
    };
  }
};
</script>

<style>
.dialog-mobile {
  display: none;
}

.card-actions {
  max-height: 50px;
}

iframe {
  padding: 0;
  margin: 0;
}

.help {
  padding-top: 7px;
  margin-left: auto;
  margin-bottom: 20px;
  width: 100%;
  color: white !important;
  position: relative;
  left: 0px;
  top: 0px;
  align-content: middle !important;
  vertical-align: middle !important;
}

.help-menu {
  position: fixed;
  background: rgb(216, 13, 13);
  bottom: 50px;
  left: 50px;
  border-radius: 60px;
  width: 60px;
  height: 60px;
  padding: 12px 1px 15px 0px;
  z-index: 10;
}

.help.v-text-field {
  padding-top: 0px !important;
}

@media only screen and (max-width: 700px) {
  .help {
    padding-top: 4px;
  }

  .help-menu {
    width: 50px;
    height: 50px;
    bottom: 60px;
    left: 5%;
  }

  .dialog-desktop {
    display: none;
  }
}
</style>
