<template>
  <v-dialog v-model="dialog" width="600px">
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" v-on="on">
        <span v-html="$ml.get('upload')"></span>
        <v-icon> mdi-upload </v-icon>
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
          counter
          multiple
          prepend-icon="mdi-paperclip"
          outlined
          :show-size="1000"
          :label="$ml.get('choose_files')"
          :placeholder="$ml.get('upload_placeholder')"
          @change="files_updated"
        >
          <template v-slot:selection="{ index, text }">
            <v-chip v-if="index < 2" color="deep-purple accent-4" dark label @click.stop small>
              {{ text }}
              <v-icon @click="this.files = this.files.filter(item => item !== index)">
                close-circle-outline
              </v-icon>
            </v-chip>
            <span v-else-if="index === 2" class="text-overline grey--text text--darken-3 mx-2">
              +{{ files.length - 2 }}
              <p style="display: inline" v-html="$ml.get('files')"></p>
            </span>
          </template>
          <template v-slot:counter="{}">
            <p>
              {{ filestring }}
            </p>
          </template>
        </v-file-input>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="dialog = false">
          <p v-html="$ml.get('cancel')"></p>
        </v-btn>
        <v-btn color="#003F69" style="color: #fff; margin-left: 20px" @click="upload()">
          <p v-html="$ml.get('upload')"></p>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { utils } from './../utils.js';

export default {
  name: 'UploaderpageMobile',

  mixins: [utils],

  props: {
    path: String
  },

  data() {
    return {
      dialog: false,
      files: [],
      filestring: ''
    };
  },

  methods: {
    /**
     * Takes the array of the files which should be uploaded and calculates the size of it
     *
     * @param {Array} fileoverview Array of the files which should be uploaded
     */
    files_updated(fileoverview) {
      let summe = 0;
      // add up the size of each element in fileoverview
      if (fileoverview.length > 0) {
        fileoverview.forEach(filestack => {
          summe += filestack.size;
        });
      }
      // add all information into filestring
      this.filestring =
        fileoverview.length +
        this.$ml.get('upload_ov_files') +
        ' (' +
        this.bytesToSize(summe) +
        ')';
    },
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
}
</style>
