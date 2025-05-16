<template>
    <b-container fluid>
      <b-row>
        <b-col cols="12" class="p-2">
          <ag-grid :items="records"/>
        </b-col> 
      </b-row>
    </b-container>
  </template>
  
  <script>

  import AgGrid from './aggridtest/AgGrid.vue'

  //import './pdfjs/build/pdf.min.js';

  export default {
    components: {
      "ag-grid": AgGrid,
    },
    data() {
      return {
        records: [
            { value: 1, text: "A"},
            { value: 2, text: "B"},  
            { value: 3, text: "C"},     
        ],
        selectedRows: null
      }
    },
    watch: {
        selectedRows: function(val) {
            console.log(val);
        }
    },
    mounted() {
    },
    methods: {
    }  
  }
  
  </script>
  
  <style scoped>
 
  </style>