<template>
  <b-container fluid class="h-100 darkheader">
    <b-row class="h-100 mt-1">
        <b-col class="col-12">
           <b-row>
             <b-col class="col-5"> 
               <b-form inline>
                 <label class="m-1 label">開始日:</label>
                 <date-picker :value="startday" @update-row="updatestartday" ref="datepicker" class="m-1"></date-picker>
                 <label class="m-1 label">終了日:</label>
                 <date-picker :value="lastday" @update-row="updatelastday" ref="datepicker" class="m-1"></date-picker>               
                  <b-button variant="success" size="sm" class="m-1" @click="checkeditopen">編集</b-button> 
                  <b-button variant="danger" size="sm" class="m-1" @click="ondellog">削除</b-button> 
                  <b-button variant="info" size="sm" class="m-1" @click="getlogCsv">CSV</b-button> 
               </b-form>     
             </b-col> 
             <b-col class="col-7"> 
             </b-col> 
           </b-row> 
           <b-row>
             <b-col class="col-12"> 
                <log-grid ref="checkgrid" :items="checklogs" @dbclick="checkeditopen" class="ml-2" ></log-grid>
                <modal name="checkedit" :width="1200" :height="600">
                   <edit-form :item="selectedRows[0]" @update="setlogs" @close="checkeditclose"></edit-form>
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

import LogGrid  from './reportview/LogGrid.vue'
import DatePicker  from './reportview/DatePicker.vue'
import EditForm  from './reportview/EditForm.vue'

import { mapState } from 'vuex'

import date_func from '../api/date_func'
const { 
  getOffsetDate
 } = date_func();

export default {
  components: {
    "log-grid": LogGrid,
    "edit-form": EditForm,  
    "date-picker": DatePicker
  },
  data() {
    return {
      bc: "",
      workday: getOffsetDate(new Date(),0),
      startday: getOffsetDate(new Date(),0),
      lastday: getOffsetDate(new Date(),0),      
      dispflg: false,
      selectedRows: [],
      selectval: 0,
      checklogs: [],
      qty: 0,
      msg: "",
      productionlist:[
        { value: 0, text: "中間" },
        { value: 1, text: "出検" },
      ],
      orderinfo: {
        model_name: null,
        qty: 0,
        order_no: null
      },
      check: {
        _id: "",
        nukitori: 0,
        daisu: 0,
        ngcode: [],
        ngmethod: [],
        fllowid: null,
        order: null,
        modelname: null,
        pice: 0,
        workday: new Date(),
        production: "通常",
        qty: 0,
        comment: "",
        workerid: "",
        workername: "",
        customerid: 0,
        customername: ""
      },
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
        homeserver: "homeserver"
      }),
      ...mapState("checkreport",{
        checkserver: "checkServer"
      })
  },
  watch: {

  },
  mounted() {
    /*  if (this.workerid == 0) {
       this.$router.push('/')
      } else {*/
        this.getlogs();
     // }
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
             start: self.startday,
             last: self.lastday,        
             retdata: "",
             checklogs: ""
         }
      } 
        let promise = axios.get( this.checkserver + "/getcheckreport", senddata)  
        return promise.then((result) => {
            self.checklogs = result.data.checklogs;
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

