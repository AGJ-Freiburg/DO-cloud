<template>
  <div
    id="app"
    @dragover.prevent="dragging"
    @dragend.prevent="dragleave"
    @drop.prevent
    @drop="drop($event)"
  >
    <Interface :dragged="dragged" :dragged_items="dragged_items"></Interface>
  </div>
</template>

<script>
import Interface from './components/Interface.vue';

export default {
  name: 'App',

  components: {
    Interface
  },

  data() {
    return {
      updated: undefined,
      dragged: false,
      dragged_items: undefined
    };
  },

  mounted() {
    this.watchdog();
  },

  methods: {
    /**
     * Starts dragging pop-up, when somebody drags something into the cloud window
     */
    dragging() {
      this.dragged = true;
      this.updated = Date.now();
    },
    /**
     * @TODO  maybe better var name
     * Creates a array of the dropped files
     *
     * @param {Object} e the files which should be uploaded
     */
    drop(e) {
      this.dragged = false;
      var files = [];
      //pushes all dropped files into the array 'files'
      files.push(...e.dataTransfer.files);
      this.dragged_items = files;
    },
    /**
     * Function serves as a timeout when dragging of a file takes to long
     */
    watchdog() {
      setTimeout(() => {
        // pause function for recursive watchdog
        if (this.updated !== undefined) {
          // after 100 ms no mouse interaction -> close modal
          if (Date.now() - this.updated > 100) {
            this.updated = undefined;
            this.dragged = false;
          }
        }
        this.watchdog();
      }, 1000);
    }
  }
};
</script>

<style>
html {
  overflow: hidden !important;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

@font-face {
  font-family: 'Roboto';
  src: url('fonts/Roboto/Roboto-X.woff2') format('woff2');
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #434343;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  font-family: Roboto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #434343;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.v-select:not(.v-text-field--single-line):not(.v-text-field--outlined) .v-select__slot > input {
  padding-left: 15px !important;
}
</style>
