<template>
  <div>
    <v-dialog v-model="dialog" width="600px">
      <template v-slot:activator="{ on, attrs }">
        <v-icon v-bind="attrs" v-on="on" :color="switchi === true ? '#009e73' : ''">
          mdi-lead-pencil
        </v-icon>
      </template>
      <v-card>
        <v-card-title>
          <span v-html="$ml.get('permissions_change')"></span>
        </v-card-title>
        <v-divider></v-divider>
        <br />
        <v-card-text>
          <p
            style="text-align: left"
            v-html="
              share.item_type === 'folder'
                ? $ml.get('permissions_folder_text')
                : $ml.get('permissions_file_text')
            "
          ></p>
          <v-checkbox
            v-model="switchi"
            :label="
              share.item_type === 'folder'
                ? $ml.get('sharing_folder_permissions')
                : $ml.get('sharing_file_permissions')
            "
            @change="update()"
          >
          </v-checkbox>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn v-html="$ml.get('close')" text @click="dialog = false"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'permissionsModal',

  props: {
    editable: Boolean,
    share: Object
  },

  data() {
    return {
      dialog: false,
      switchi: false
    };
  },

  mounted() {
    // when mounted set switchi to the value of editable
    this.switchi = this.editable;
  },

  methods: {
    /**
     * Emits a 'updateShare'-Event with the Key = 'permissions' and either 6 or 0
     */
    update() {
      // if switchi is true the Sozi has the permission
      if (this.switchi) {
        this.$emit('update_share', 'permissions', 6);
      // if switchi is false the Sozi has not the permission
      } else {
        this.$emit('update_share', 'permissions', 0);
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style></style>
