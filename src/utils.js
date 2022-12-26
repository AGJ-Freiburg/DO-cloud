export const utils = {
  methods: {
    /**
     * Converts bytes into the highest full unit
     * 
     * @param {number} bytes The amount of bytes to convert
     */
    bytesToSize(bytes) {
      var sizes = this.$ml.get('filesizes');
      if (bytes===0) return '';
      var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    },
}}