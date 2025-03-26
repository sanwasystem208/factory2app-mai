<template class="px-0 py-0 my-0">
    <b-button class="bg-success float-left m-0 pt-0 pb-0" size="sm" @click="cellClick">実績</b-button>
</template>
<script>
  import Vue from "vue";
  export default Vue.extend({
      props: [],
      data(){
        return {
          id: null
        }
      },
      computed: {
  
      },  
      watch: {
      },
      mounted() {
        this.id = this.params;
      },
      methods:{
          cellClick(e){
           //  this.items.value=e;
             this.params.action(this.id);
          }
      },
      /**
       * 選択値の取得とリストの作成
       */
      beforeMount(){
       //   this.title = this.params.title;
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