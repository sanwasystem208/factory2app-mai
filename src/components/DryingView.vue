<template>
  <b-container fluid class="h-100 darkheader">
    <b-row class="h-100 mt-1">
        <b-col class="col-12">
           <b-row>
             <b-col class="col-5"> 
               <b-form inline>
                 <label class="m-1 label">作業日:</label>
                 <date-picker :value="startday" @update-row="updatestartday" ref="datepicker" class="m-1"></date-picker>
                 <b-button variant="info" size="sm" class="m-1" @click="getlogs">更新</b-button>             
               </b-form>     
             </b-col> 
             <b-col class="col-7"> 
             </b-col> 
           </b-row> 
           <b-row>
             <b-col class="col-12"> 
                <drying-grid ref="dryinggrid" :items="drylogs" class="ml-2" ></drying-grid>
                <modal name="checkedit" :width="1200" :height="600">
                 <!--  <edit-form :item="selectedRows[0]" @update="setlogs" @close="checkeditclose"></edit-form>-->
                </modal>
             </b-col> 
           </b-row> 
        </b-col>
    </b-row>
  </b-container>
</template>

<script>
//<ag-grid :items="modeldata" ></ag-grid>
import Vue from 'vue'
import axios from "axios";
import Bootstrap from 'bootstrap';
import BootstrapVue from 'bootstrap-vue'

import moment from 'moment';

Vue.use(BootstrapVue);

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
/*
import AgGridModel  from './modellist/AgGrid.vue'
import TableView  from './modellist/TableView.vue'
import AgGridDetail from './modellist/AgGriddetail.vue';
import AgGridDetail2 from './modellist/AgGriddetail2.vue';
import AgGridDetail3 from './modellist/AgGriddetail3.vue';
import ProgressBar from './modellist/ProgressBar.vue';
import moment from 'moment';
*/
import DryingGrid  from './dryingview/DryingGrid.vue'
import DatePicker  from './dryingview/DatePicker.vue'
//import EditForm  from './reportview/EditForm.vue'

import { mapState } from 'vuex'

//import VuejsDialog from 'vuejs-dialog';
// カスタムコンポーネントが必要な場合読みこむ
//import 'vuejs-dialog/dist/vuejs-dialog.min.css';

//Vue.use(VuejsDialog);
//import Gantt from 'vue-gantt';

//Vue.component('vue-ctk-date-time-picker', VueCtkDateTimePicker);

 // import VueTouchKeyboard from "vue-touch-keyboard";
 // import "vue-touch-keyboard/dist/vue-touch-keyboard.css"; // load default style

export default {
  components: {
    "drying-grid": DryingGrid,
    "date-picker": DatePicker
  },
  data() {
    return {
      bc: "",
      workday: getDay3(new Date(),0),
      startday: getDay3(new Date(),0),
      lastday: getDay3(new Date(),0),      
      dispflg: false,
      selectedRows: [],
      selectval: 0,
      drylogs: [],
      qty: 0,
      msg: "",
      visible: false,
      layout: "normal",
      input: null,
      options: {
        useKbEvents: true,
        preventClickEvent: false
      }
    }
  },
  computed: {
      ...mapState({
        customerid: 'customerid',
        loginflg: 'loginflg',
        workerid: 'workerid',
        workername: 'workername',
        homeserver: "homeserver",
        dryingserver: "dryingserver"
      }),
      ...mapState("checkreport",{
        checkserver: "checkServer"
      })
  },
  watch: {

  },
  mounted() {
      if (this.workerid == 0) {
       this.$router.push('/')
      } else {
        this.getlogs();
      }
  } ,
  methods: {
    updateday: function() {
      this.getlogs()
    },
    updatestartday: function(day){
      if (this.lastday<day) {
        alert("入力エラー");
      } else {
        this.startday=day;
        this.getlogs();
      }
    },
    updatelastday: function(day){
      if (this.startday>day) {
        alert("入力エラー");
      } else {
        this.lastday=day;
        this.getlogs();
      }
    },
    enterevent: function(event) {
    //  if (event.keyCode !== 13) return
       this.getorder(this.bc);   
       this.bc = null;   
    },
    bcchange: function() {
       this.getorder(this.bc);   
       this.bc = null;
    },
    getlogs(){
      var self = this;
      var senddata = {
         params: { 
             start: getDayStr(self.startday,0),      
         }
      }
      self.drylogs = []; 
      let promise = axios.get( this.dryingserver + "/getdryinglist", senddata)  
      return promise.then((result) => {
         self.drylogs = result.data.retdata;
      }).catch(error => {
         console.log("error " + error) 
      }) 
    },
    setlogs(data){
      var self = this;
      var senddata = {
           start: self.startday,
           last: self.lastday,  
           retdata: data,
           checklogs: ""
      } 
        let promise = axios.post( self.checkserver + "/setcheckreport_all", senddata)  
        return promise.then((result) => {
            self.checklogs = result.data.checklogs;
        }).catch(error => {
           console.log("error " + error) 
        }) 
    },
    ondellog() {
      var self = this;
      this.$dialog
      .confirm({
        title: '削除確認',
        body: self.selectedRows.length + ' 件削除してもよろしいですか？'
      },{
        okText: 'はい',
        cancelText: 'キャンセル',
      })
      .then(function() {
        console.log('削除しました');
        var logs = self.selectedRows; 

        var senddata = { 
              logs: logs,
              start: self.startday,
              last: self.lastday,  
              checklogs: ""
        } 
          let promise = axios.post( self.checkserver + "/delcheckreport", senddata)  
          return promise.then((result) => {
              self.checklogs = result.data.checklogs;
          }).catch(error => {
            console.log("error " + error) 
          }) 

      })
      .catch(function() {
        console.log('実行はキャンセルされました');
      });
    },
    onclick(val) {
       var dat = "";
       if (this.selectval==0) {
         dat = this.check.daisu + "" ;
       }
       if (this.selectval==1) {
         dat = this.check.nukitori + "";
       }
       switch(val) {
         case "0" :
           if (dat!="0") {
             dat += "0";    
           }
           break;
         case  "BS" :
           if (dat.length > 1) {
              dat = dat.substr(0,dat.length-1); 
           } else {
              dat = "0"; 
           }
           break; 
         case  "CR" :
           if (parseInt(dat) > 0) {
           // this.insert_logs();   
              console.log(this.check); 
           }
           break;  
         default: 
           if (dat=="0") {
             if (parseInt(val)!=0) {
               dat = val; 
             }
           } else {
             dat += val;
           }
           break;   
       } 
       if (this.selectval==0) {
          this.check.daisu = dat ;
       }
       if (this.selectval==1) {
         this.check.nukitori = dat;
       }
       this.$refs["bcinput"].focus();    
    },
    datainit: function() {
      this.bc="";
      this.qty = 0;
      this.check._id = null;
      this.check.order = null;  
      this.check.fllowid = null;  
      this.check.modelname = null;
   //   this.check.production = null;
      this.check.qty = 0;
      this.check.comment = "";
      this.check.customerid = 0;
      this.check.customername = "";
      this.$store.dispatch('checkreport/init_smtlogs', [] );
      this.$refs["bcinput"].focus(); 
      },
      accept(text) {
        alert("Input text: " + text);
        this.hide();
      },
      show(e) {
        this.input = e.target;
        this.layout = e.target.dataset.layout;

        if (!this.visible)
          this.visible = true
      },

      hide() {
        this.visible = false;
      },
      getlogCsv() {
        this.$refs.checkgrid.onSaveCsv();
      },
      checkeditopen: function(val) {
        this.$modal.show("checkedit"); 
      },
      checkeditclose: function() {
        this.$modal.hide("checkedit"); 
      },
    }
}
/********************************************* 
                  共通関数
******************************************** */

//月日０埋め
var toDoubleDigits = function(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
 return num;     
};

function getDay3(str,i) {
     var date1 = new Date(str);
     date1.setDate(date1.getDate() + i);  
   //   var off = weekday_offset(date1)  
   //   date1.setDays(date1.getDays() + off); 
      // Date型を（YYYY/MM/DD）形式へ成型して返却
     var year = date1.getFullYear(); // 年
     var month = toDoubleDigits(date1.getMonth() + 1); // 月
     var day = toDoubleDigits(date1.getDate()); // 日 
     return  year + "-" + month + "-" + day; 
}

function getDayStr(str,i) {
     var date1 = new Date(str);
     date1.setDate(date1.getDate() + i);  
   //   var off = weekday_offset(date1)  
   //   date1.setDays(date1.getDays() + off); 
      // Date型を（YYYY/MM/DD）形式へ成型して返却
     var year = date1.getFullYear(); // 年
     var month = toDoubleDigits(date1.getMonth() + 1); // 月
     var day = toDoubleDigits(date1.getDate()); // 日 
     return  year + month + day; 
}

</script>

<style scoped>
  html, body {
    width: 100%;
    height: 100%;
  }

  .inputwidth {
    width: 120px;
  }

  .bigfont { 
    font-size: 32px;
    color: brown;
  }

  .bigfont2 { 
    font-size: 24px;
  }

  .bigfont3 { 
    font-size: 40px;
  }

  .bigfont4 {
    font-size: 20px;
  }

  .redfont {
    color: red;
    font-size: 30px;
  }

  #keyboard {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;

    z-index: 1000;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;

    padding: 1em;

    background-color: #EEE;
    box-shadow: 0px -3px 10px rgba(black, 0.3);

    border-radius: 10px;
  }

</style>

