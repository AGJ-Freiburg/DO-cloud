<template>
  <v-dialog v-model="dialog" width="600px" id="app" :eager="true">
    <template v-slot:activator="{ on, attrs }">
      <v-btn class="large-bottom-nav" v-bind="attrs" v-on="on">
        <!-- ml: Scan -->
        <span style="color: #fff" v-html="$ml.get('mobile_scan')"></span>
        <v-icon color="#fff"> mdi-camera </v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <!-- ml: Upload document(s) -->
        <span class="text-h5" v-html="$ml.get('documents_upload')"></span>
      </v-card-title>
      <v-card-text>
        <!-- ml: Select document(s) -->
        <!-- ml: Select your document(s) -->
        <v-file-input
          v-model="files"
          color="deep-purple accent-4"
          counterW
          multiple
          prepend-icon="mdi-paperclip"
          outlined
          ref="scanner"
          id="uploader"
          :show-size="1000"
          :label="$ml.get('choose_files')"
          :loading="true"
          :placeholder="$ml.get('upload_placeholder')"
        >
          <template v-slot:selection="{ index, text }">
            <v-chip v-if="index < 3" color="deep-purple accent-4" dark label @click.stop small>
              {{ text }}
              <v-icon @click="this.files = this.files.filter(item => item !== index)">
                close-circle-outline
              </v-icon>
            </v-chip>
            <span v-else-if="index === 2" class="text-overline grey--text text--darken-3 mx-2">
              +{{ files.length - 2 }} File(s)
            </span>
          </template>
        </v-file-input>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="dialog = false">
          <p v-html="$ml.get('cancel')"></p>
        </v-btn>
        <v-btn style="color: #fff; margin-left: 20px" color="#003F69" @click="upload()">
          <p v-html="$ml.get('upload')"></p>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'UploaderpageMobileScan',

  props: {
    path: String
  },

  data() {
    return {
      dialog: false,
      files: undefined
    };
  },

  watch: {
    // if the value of dialog is true, set element to the picture made by the scanner
    dialog(v) {
      if (v === true) {
        let element = this.$refs.scanner;
        element.$refs.input.click();
      }
    }
  },

  methods: {
    /**
     * Emits a 'upload'-Event with the files to be uploaded, afterwards resets the 'files'-array
     */
    upload() {
      this.$emit('upload', this.files);
      this.dialog = false;
      this.files = [];
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.upload-btn {
  padding: 15px 30px 15px 30px;
  float: right;
  height: 70px;
  font-weight: 500;
  background: #006ab3;
  color: #fff;
}

.upload-btn:hover {
  background: #003f69;
}

@media only screen and (max-width: 730px) {
  .upload-btn {
    float: right;
    padding: 15px;
    height: 50px;
  }
  .upload-btn p {
    display: none;
  }
  .large-bottom-nav {
    background: #006ab3 !important;
    width: 80px !important;
    height: 80px !important;
    margin: 20px !important;
    border-radius: 200px !important;
    margin-top: -25px !important;
    color: #fff !important;
    -webkit-box-shadow: 0px 0px 10px -3px #000000 !important;
    box-shadow: 0px 0px 10px -3px #000000 !important;
  }

  @media only screen and (max-width: 730px) {
    .upload-btn {
      float: right;
      padding: 15px;
      height: 50px;
    }
    .upload-btn p {
      display: none;
    }
  }
}
</style>
