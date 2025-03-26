<template>

    <b-container fluid>
        <h4 class="pt-1"><span class="badge badge-success p-2 m-0" v-show="items.value==1" v-on:click='cellClick(2)'>変換中</span>
        <span class="badge badge-warning p-2" v-show="items.value==2" v-on:click='cellClick(3)'>ロボ待</span>
        <span class="badge badge-danger p-2 m-0" v-show="items.value==3" v-on:click='cellClick(4)'>製作中</span>
        <span class="badge badge-primary p-2 m-0" v-show="items.value==4" v-on:click='cellClick(0)'>完了</span>
        <span class="badge badge-light p-2 m-0" v-show="items.value==0" v-on:click='cellClick(1)'>未着手</span></h4>      
    </b-container>  
  </template>
  
  <script>
  
  /*
    progress: [
       { value: 0, text: "未着手"},//light
       { value: 1, text: "変換中"}, //success 
       { value: 2, text: "ロボ待"}, //warning   
       { value: 3, text: "製作中"}, //danger
       { value: 4, text: "完了"},   //primary
    ]
  */
  
  import Vue from "vue";
  import { mapState } from 'vuex'
  
  import Bootstrap from 'bootstrap';
  import BootstrapVue from 'bootstrap-vue'
  
  Vue.use(BootstrapVue);
  
  import 'bootstrap/dist/css/bootstrap.css'
  import 'bootstrap-vue/dist/bootstrap-vue.css'
  
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
       ...mapState({
          basicprocess: 'basicprocess',
          colorlist: 'colors',
          progress: 'progress'
        }),
        ...mapState("planview3",{
          planserver: "planviewServer",
          daylist: "daylist",
          plandetail: "plandetail",
          celldata: "celldata",
          ids: "ids"
        })
      },  
      watch: {
        params: function(val) {
           console.log("params:" + val);
           this.items = this.params;
        } 
      },
      mounted() {
           console.log("params:" + this.params);
           if (this.params != undefined) {
              this.items = this.params;
           }
  
      },
      methods:{
          /**
           * selectのchageイベントで選択値をグリッドに反映
           */
           getcolor: function(no) {  
             if (no != undefined) {
               return this.colorlist["work" + no];
             } else {
               return "silver";             
             }
           },
         /*  refresh(params) {
              if (params !== this.items) {
                this.items = params;
              }
              return true;
           },*/
          cellClick(e){
           //  this.items.value=e;
             this.params.action({ _id: this.params.data._id, flg: e });
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