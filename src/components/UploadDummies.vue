<template>
  <div class="dummies-wrapper">
    <div v-for="ufile in uploading_files" :key="ufile.name + ''">
      <v-card class="listelement-dummy">
        <v-icon class="iconinlist-file-dummy">mdi-file-outline</v-icon>
        <v-progress-circular
        class="progress-bar"
        indeterminate 
        color="#99b533"
        >
        </v-progress-circular>
        <p class="listelement-text-dummy">{{ ufile.name }} &nbsp;</p>
        <p class="listelement-text-mobile-dummy">{{ ufile.name }}</p>
      </v-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UploadDummies',

  props: {
    uploading_files: Array,
    status: Object
  },

  data() {
    return {};
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.iconinlist-file-dummy {
  margin-right: 20px;
  background: #006ab3;
  height: 60px;
  width: 60px;
  float: left;
  color: #fff !important;
}

.progress-bar {
  height: 60px;
  width: 60px;
  float: right;
  margin: 1rem;
}

.listelement-dummy {
  height: 60px !important;
  width: 100% !important;
  background-color: rgba(255, 255, 255, 0.5) !important;
  margin-top: 12px !important;
  /* margin-bottom: 12px !important; */
}

.listelement-dummy p {
  padding-top: 15px;
  width: 80%;
  text-align: left;
}

.listelement-text-dummy {
  width: 80% !important;
  overflow: hidden;
  line-height: 1.9;
  height: 45px;
  font-size: 18px;
  display: flex;
  text-align: left;
}

.listelement-text-mobile-dummy {
  display: none;
}

.dummies-wrapper {
  padding: 0 1% 1% 1%;
  width: 100%;
  flex-grow: 1;
  overflow-y: auto;
  scrollbar-width: thin;
}

.platzhalter-dummy {
  color: black;
}
</style>
