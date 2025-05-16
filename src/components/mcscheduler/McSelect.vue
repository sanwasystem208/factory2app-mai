<template>
    <b-form inline>
      <label class="mr-sm-2" for="inline-form-custom-select-pref">機械：</label>
      <b-form-select
        class="mb-2 mr-sm-2 mb-sm-0"
        v-model="mc"
        :options="mclist"
         v-bind:disabled="tabno > 1"
        id="inline-form-custom-select-pref"
      >
      </b-form-select>
    </b-form>
  </template>
  
  <script>
  import axios from "axios";
  import { mapState } from 'vuex'
  
  export default {
    props: ["tabno"],
    data () {
      return {
        selected: 0,
        btnDisable: true,
        mc: null,
        mclist: []
      }
    },
    computed: {
      ...mapState({
        mcplanserver: 'mcplanserver',
      })
    },
    watch: {
      mc: function(val) {
        var newLine = this.mclist.filter(function(item, index){
            if (item.value==val) return true;
        });
        localStorage.setItem('modeltype',val);
        this.$emit("update", newLine[0]);            
      },
    },
    mounted() {
      this.onMcSpec();
    },  
    methods: {
      onMcSpec: function() {
          var self = this;
          var senddata = {
              params: {
                mcspec: null
              }
          } 
          let promise = axios.get( self.mcplanserver + "/getmcspec", senddata)  
          return promise.then((result) => {
              self.mclist = result.data.mcspec;  
              if (localStorage.getItem('modeltype')){
                 self.mc = localStorage.getItem('modeltype');
              }
          }).catch(error => {
            console.log("error " + error) 
          })  
      },
    }
  }
  
  </script>