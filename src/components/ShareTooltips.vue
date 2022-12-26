<template>
  <div class="shares-list-item-icons">
    <v-menu
      v-model="menu2"
      transition="scale-transition"
      offset-y
      min-width="auto"
      :close-on-content-click="false"
      :nudge-right="40"
    >
    </v-menu>
    <!-- BERECHTIGUNGS ICONS -->
    <div class="shares-list-item-permissions">
      <!-- start zeitfreigabe -->
      <!-- UHR ICON -->
      <v-tooltip class="modal-icon menu-icon shares-list-item-permissions-icon" bottom>
        <template v-slot:activator="{ on, attrs }">
          <date-modal
            v-bind="attrs"
            v-on="on"
            :share_date="share.expiration"
            @update_share="
              (key, value) => {
                update_share(key, value);
              }
            "
          >
          </date-modal>
        </template>
        <span v-html="$ml.get('shared_until').replace('{0}', share.expiration)"></span>
      </v-tooltip>
      <!-- ENDE -->
      <!-- SCHLÜSSEL ICON -->
      <!-- @ROBIN v-if="!share_to_institution" einbauen bitte-->
      <v-tooltip
        v-if="share.share_type != 1"
        class="modal-icon menu-icon shares-list-item-permissions-icon"
        bottom
      >
        <template v-slot:activator="{ on, attrs }">
          <password-modal
            v-bind="attrs"
            v-on="on"
            :password="share.password"
            @update_share="
              (key, value) => {
                update_share(key, value);
              }
            "
          >
          </password-modal>
        </template>
        <!-- ml: Document is password protected -->
        <span v-html="$ml.get('document_password_protected')"></span>
      </v-tooltip>
      <!-- STIFT ICON -->
      <v-tooltip class="modal-icon menu-icon shares-list-item-permissions-icon" bottom>
        <template v-slot:activator="{ on, attrs }">
          <permissions-modal
            v-bind="attrs"
            v-on="on"
            :editable="share.permissions > 1 && share.permissions < 17"
            :share="share"
            @update_share="
              (key, value) => {
                update_share(key, value);
              }
            "
          >
          </permissions-modal>
        </template>
        <!-- ml: Sharing is time limited until {0} -->
        <p v-html="$ml.get('shared_until_short').replace('{0}', share.expiration)"></p>
      </v-tooltip>
    </div>
    <!-- ENTFERNEN ICON -->
    <v-tooltip class="modal-icon menu-icon shares-list-item-icon-remove" left>
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          class="modal-icon menu-icon shares-list-item-icon-remove-icon"
          v-bind="attrs"
          v-on="on"
          size="30px"
          color="#d55e00"
          @click="delete_share()"
        >
          mdi-minus-circle
        </v-icon>
      </template>
      <span v-html="$ml.get('remove')"></span>
    </v-tooltip>
  </div>
</template>

<script>
import passwordModal from './sharing/password.vue';
import permissionsModal from './sharing/permissions.vue';
import dateModal from './sharing/date.vue';

export default {
  name: 'ShareTooltips',

  components: {
    passwordModal,
    permissionsModal,
    dateModal
  },

  props: {
    share: Object,
    componentKey: Number
  },

  data() {
    return {
      date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),
      modal: false,
      menu2: false
    };
  },

  methods: {
    /**
     * Emits a 'deleteShare'- Event with the share which should be deleted
     */
    delete_share() {
      this.$emit('delete_share', this.share);
    },
    /** 
     * Emits a 'updateShare'- Event with the needed id of the share, and the key which should be updated and the new value
     *
     * @param {String} key Name of the attribute which should be updated
     * @param {String} value The new value of the attribute
     */
    update_share(key, value) {
      if (key === 'permissions') {
        // need to shut of permission
        this.$emit('update_share', this.share.id, key, value + 1);
      } else if (key === 'expireDate' || key === 'password') {
        this.$emit('update_share', this.share.id, key, value);
      }
    }
  }
};
</script>

<style>
.shares-list-item-icons {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

.shares-list-item-permissions {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
  margin-right: 20px;
}

.shares-list-item-permissions-icon {
  margin-right: 5px;
}

@media only screen and (max-width: 700px) {
  .shares-list-item-permissions {
    display: flex;
    justify-content: flex-end;
    padding: 8px;
    margin-right: 8px;
  }

  .shares-list-item-permissions-icon {
    margin-right: 3px;
  }
}
</style>
