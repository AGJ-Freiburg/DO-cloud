<template>
  <div>
    <v-dialog v-model="dialog" width="600px">
      <template v-slot:activator="{ on, attrs }">
        <v-btn style="float: right; margin-top: 5px" v-bind="attrs" v-on="on" color="#006ab3">
          <v-icon color="#fff"> mdi-upload </v-icon>
          <span style="color: #fff" v-html="$ml.get('upload')"> &nbsp; </span>
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
            truncate-length="10"
            multiple
            prepend-icon="mdi-paperclip"
            outlined
            :placeholder="$ml.get('upload_placeholder')"
            :label="$ml.get('choose_files')"
            :show-size="1000"
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
              <p v-if="files.length === 1">
                {{ filestring_one }}
              </p>
              <p v-if="files.length > 1">
                {{ filestring_more }}
              </p>
            </template>
          </v-file-input>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false">
            <p v-html="$ml.get('cancel')"></p>
          </v-btn>
          <v-btn
            :disabled="files.length === 0"
            style="color: #fff; margin-left: 20px"
            color="#003F69"
            @click="upload()"
          >
            <p v-html="$ml.get('upload')"></p>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { utils } from './../utils.js';

export default {
  name: 'Uploaderpage',

  mixins: [utils],

  props: {
    path: String
  },

  data() {
    return {
      dialog: false,
      files: [],
      filestring_one: '',
      filestring_more: ''
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
      this.filestring_one =
        fileoverview.length + ' ' + this.$ml.get('file') + ' (' + this.bytesToSize(summe) + ')';
      // add all information into filestring
      this.filestring_more =
        fileoverview.length + ' ' + this.$ml.get('files') + ' (' + this.bytesToSize(summe) + ')';
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
