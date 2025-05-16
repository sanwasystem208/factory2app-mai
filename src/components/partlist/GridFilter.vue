<template>
    <b-form inline onsubmit="return false;">
      <label class="mr-sm-2" for="inline-form-custom-select-pref">抽出：</label>
      <b-form-input 
          class="mb-2 mr-sm-2 mb-sm-0" 
          type="text" 
          :state="null"
          ref="input-filter" 
          v-model="filterstr" 
          placeholder=""
          v-on:change="onChange"
          ></b-form-input>
    </b-form>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    props: [
    ],
    data () {
      return {
        filterstr: ""
      }
    },
    watch: {
    },
    mounted() {
      // this.$refs.input-filter.focus();
    },  
    methods: {
      onChange(s) {
        this.$emit("change", s);
      } 
    }
  }
  
  var toDoubleDigits = function(num) {
    num += "";
    if (num.length === 1) {
      num = "0" + num;
    }
   return num;     
  };
  
  </script>