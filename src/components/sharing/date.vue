<template>
  <div>
    <v-dialog v-model="dialog" width="600px">
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          style="margin-right: 7px"
          v-bind="attrs"
          v-on="on"
          :color="date != undefined && date != '' ? '#009e73' : ''"
        >
          mdi-clock
        </v-icon>
      </template>
      <v-card>
        <v-card-title>
          <span v-html="$ml.get('sharing_protect_limited_date_text')"></span>
        </v-card-title>
        <v-divider></v-divider>
        <br />
        <p
          v-if="this.date !== ''"
          v-html="$ml.get('sharing_protect_limited_date_info').replace('{0}', this.date)"
        ></p>
        <p v-else v-html="$ml.get('sharing_protect_limited_date_info_undef')"></p>
        <br />
        <v-card-text>
          <v-date-picker
            v-model="date"
            class="mt-4"
            dark
            full-width
            :min="get_date_tomorrow().toISOString().substr(0, 10)"
            @change="update()"
          >
          </v-date-picker>
          <v-btn
            @click="
              date = '';
              update();
            "
          >
            <p v-html="$ml.get('sharing_protect_limited_date_remove')"></p>
          </v-btn>
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
  name: 'dateModal',

  props: {
    share_date: String
  },

  data() {
    return {
      dialog: false,
      date: ''
    };
  },

  mounted() {
    // when mounted set 'date' to 'share_date'
    this.date = this.share_date;
  },

  methods: {
    /**
     * Returns tomorrow's date
     */
    get_date_tomorrow() {
      // get todays date
      const today = new Date();
      // set tomorrow on todays date
      const tomorrow = new Date(today);
      // to actually get tomorrows date add a day
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    },
    /**
     * Emits a 'updateShare'-Event with the Key = 'expireDate' and the actual date to expire
     */
    update() {
      this.$emit('update_share', 'expireDate', this.date);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style></style>
