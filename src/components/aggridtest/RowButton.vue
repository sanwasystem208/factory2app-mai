<template>
   <b-button variant="info" size="sm" class="m-0 pt-0 pb-0" @click="cellClick">{{ items.value }}</b-button> 
</template>

<script>

  import Vue from "vue";

  export default Vue.extend({
      props: [],
      data(){
          return {
             items: {
               value: 0
             }
          }
      },
      computed: {
      },  
      watch: {
        params: function(val) {
           console.log("params:" + val);
           this.items = this.params;
        } 
      },
      mounted() {
         if (this.params != undefined) {
            this.items = this.params;
         }
      },
      methods:{
          cellClick(e){
             this.params.action(this.params.value);
          }
      },
      beforeMount(){
      }
  })
  </script>
  
  <style scoped>
    .body {
       height: 100%; 
    }
  
    .nowork {
       background-color: silver
    }
  
    .work1001 {
       background-color: dimgray;
       color: #ffffff;
       width: 10px;
    }
  
    .work1002 {
       background-color: deepskyblue;
       color: #ffffff;
       width: 10px;
    }
  
    .work1003 {
       background-color: green;
       color: #ffffff;
       width: 10px;
    }
  
    .work1004 {
       background-color: orange;
       color: #ffffff;
       width: 10px;
    }
  
    .work1005 {
       background-color: brown;
       color: #ffffff;
       width: 40px;
    }
  
    .work1006 {
       background-color: magenta;
       color: #ffffff;
       width: 10px;
    }
  
    .work1000 {
       background-color:#ffffff;
       color: #ff0000;
       width: 10px; 
    }
  
    .row {
       vertical-align: top;
    }
  
    .cells {
       height: 16px;
       text-align: right;
       width: 25%;
    }
  
    .cellsr {
       height: 16px;
       text-align: right;
       width: 25%;
       color: #ff0000;
    }
  
    .cells2 {
       width: 100px;
    }
  
    .waku {
      border: 2px solid #000000;
      width: 300px;
      height: 100px;
  }
  </style>