<template>
  <div class="footer">
    <cookie-law theme="dark-lime" :buttonText="$ml.get('dsgvo_cookie_button')">
      <div slot="message" v-html="$ml.get('dsgvo_cookie_text')"></div>
    </cookie-law>
    <table
      v-if="
        quota.used != '' &&
        quota.total != '' &&
        quota.free != '' &&
        quota.used_percent != '' &&
        status.files_loaded
      "
    >
      <tr>
        <td class="usage">
          <div v-if="!status.iswoloadmin">
            <!-- ml: You have used {0} of {1} data volume. ({2}%) -->
            <p
              v-html="
                $ml
                  .get('quota_used')
                  .replace('{0}', quota.used)
                  .replace('{1}', quota.total)
                  .replace('{2}', quota.used_percent)
              "
            ></p>
          </div>
        </td>
        <td class="imprint">
          <a href="https://agj-freiburg.de/datenschutz" target="_blank">
            <p style="display: inline" v-html="$ml.get('privacy_policy')"></p>
          </a>
          &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
          <a href="https://agj-freiburg.de/impressum" target="_blank">
            <p style="display: inline" v-html="$ml.get('imprint')"></p>
          </a>
        </td>
      </tr>
    </table>
    <p
      v-if="
        quota.used === '' &&
        quota.total === '' &&
        quota.free === '' &&
        quota.used_percent === '' &&
        !status.files_loaded
      "
    >
      <a href="https://agj-freiburg.de/datenschutz" v-html="$ml.get('privacy_policy')"></a>
      &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
      <a href="https://agj-freiburg.de/impressum" v-html="$ml.get('imprint')"></a>
    </p>
  </div>
</template>

<script>
import CookieLaw from 'vue-cookie-law';

export default {
  name: 'DoFooter',

  components: {
    CookieLaw
  },

  props: {
    quota: Object,
    status: Object
  },

  data() {
    return {};
  }
};
</script>

<style>
.footer {
  position: fixed;
  bottom: 0px;
  left: 0px;
  padding: 10px;
  padding-right: 2.5%;
  padding-left: 2.5%;
  background-color: #006ab3;
  color: #fff !important;
  width: 100%;
  height: 40px;
  text-align: right;
  text-decoration: none !important;
}

.footer a {
  text-decoration: none !important;
  color: #fff !important;
}
.footer td {
  width: 100%;
}

.usage {
  text-align: left !important;
}

.imprint {
  text-align: right !important;
  margin-left: 50%;
}

.imprint a {
  text-decoration: none !important;
  color: #fff !important;
  text-align: right !important;
}

@media only screen and (max-width: 700px) {
  .footer {
    display: none;
  }
}
</style>
