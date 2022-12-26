import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import de from 'vuetify/lib/locale/de';
import VueAuthImage from 'vue-auth-image';



Vue.use(Vuetify);
Vue.use(VueAuthImage);


export default new Vuetify({
    lang: {
      locales: { de },
      current: 'de',
    },
    icons: {
      iconfont: 'mdi',
    },
});
