<template>
    <b-container fluid>
      <b-row class="h-10 header">
          <b-col cols="3">
              <!--<month-select ref="monthselect" :month="null" class="float-left mt-2" @update="getmonth"></month-select>-->
              <b-form-group label-cols="12" label-cols-lg="2" label="開始日" label-for="input-sm" class="mt-2 mb-0">
                <b-form-datepicker id="mcplan-datepicker" v-model="date" class="mb-2"></b-form-datepicker>
              </b-form-group>
            </b-col>
          <b-col cols="9">
              <mc-select ref="monthselect" class="float-left mt-2" @update="getMcName"></mc-select>  
              <button type="button" class="btn float-left btn-info mr-1 mt-2" v-on:click="csvinportopen">CSV表示</button>                 
              <button type="button" class="btn float-left btn-primary mr-1 mt-2" v-on:click="onGetOrder">再表示</button> 
              <button type="button" class="btn float-left btn-danger mr-1 mt-2" v-on:click="onPlanDelete" v-bind:disabled="selectrows.length==0">削除</button>                 
              <button type="button" class="btn float-left btn-success mr-1 mt-2" v-on:click="onPlanRefrash" v-bind:disabled="selectrows.length !=1">再構築</button> 
              <button type="button" class="btn float-left btn-warning mr-1 mt-2" v-on:click="onPlanChange" v-bind:disabled="selectrows.length !=2">入替</button>             
              <!--<grid-filter ref="input-filter" class="float-left m-2" @change="onFilterChange"/>-->
              <label class="mt-3 ml-3">選択数：{{ selectrows.length }}</label>             
            <!--  <button type="button" class="btn float-left btn-info  btn-md m-2" v-on:click="getprinter()">プリンタ設定</button>
              <label class="ml-2 mr-2 mt-3"><h6>使用プリンタ: {{  printer }}</h6></label> -->
          </b-col>
      </b-row>
      <b-row class="h-90">
        <b-col class="col-xl-12">
          <div>
            <mc-grid ref="mcgrid" :key="updatekey" :planlist="planlist" :param="{ spm: spm, basehour: basehour, settingtime: settingtime, type: type, workrate: workrate }" :daylist="daylist" @select="onSelect" class="m-1"></mc-grid>
            <modal name="csvinport" :width="1200" :height="720">
               <csv-inport :mcdata="mcdata" @select="onAddOrder" @close="csvinportclose"></csv-inport>
            </modal>
          </div> 
        </b-col> 
      </b-row>
    </b-container>
  </template>
  
  <script>
  
  //<button type="button" class="btn btn-danger btn-sm mr-1 mt-1" v-bind:disabled="!carryoverflg" v-on:click="oncarryover">繰越</button>  
  
  import Vue from 'vue'
  import axios from "axios";
  import McGrid  from './mcscheduler/McGrid.vue'
  //import MonthSelect  from './mcscheduler/MonthSelect.vue'
  import McSelect  from './mcscheduler/McSelect.vue'
  import CsvInport from './mcscheduler/CsvInport.vue'

  import moment from 'moment';

  import JsonCSV from 'vue-json-csv';
  Vue.component('downloadCsv', JsonCSV);

  import 'vue-simple-suggest/dist/styles.css';

  import { mapState } from 'vuex'

  import VModal from 'vue-js-modal'
  Vue.use(VModal)

  import date_func from '../api/date_func'
  const { 
    toDoubleDigits,
    formatDay,
    addnextmonth,
    make_id,
    isNumber,
    addnextstart,
    addnextlast,
    make_daylist,
    onCurrentMonth
  } = date_func();

  export default {
    components: {
      "mc-grid": McGrid,
      //"month-select": MonthSelect,
      "csv-inport": CsvInport,
      "mc-select": McSelect
    },
    data() {
      return {
        date: null,
        selectrows: [],
        daylist: [],
        startday: formatDay(new Date()),
        month: onCurrentMonth(),
        updatekey: 0,
        updatekey2: 0,        
        orderview: false,
        mc: null,
        planlist: [],
        type: "",
        filter1: "",
        mcdata: null,
        spm: 0,
        basehour: 0,
        settingtime: 0,
        workrate: 0.0,
        httpflg: true,
        addserial: 0,
        sortno: 0
      }
    },
    watch: {
      mc: function(val) {
        this.onHoliDay();
        this.onGetOrder();
      },
      date: function(val){
        this.startday = formatDay(val);
        localStorage.setItem('startday',this.startday);
        this.updatestartday(val);
      },
    },  
    computed: {
      ...mapState({
        mcplanserver: 'mcplanserver',
      }),
    },
    mounted() {
      // this.onHoliDay();
      if (localStorage.getItem('startday')) {
         this.startday = localStorage.getItem('startday'); 
         this.date = new Date(this.startday);
       }

       if (localStorage.getItem('startday')) {
         this.startday = localStorage.getItem('startday'); 
         this.date = new Date(this.startday);
       }

       if (this.startday != null && this.mc != null) {
         this.$refs.mcgriid.onGetOrder();
       }
       this.addserial = 0;
    },
    methods: {
      csvinportopen: function() {
        this.$modal.show("csvinport"); 
      },
      csvinportclose: function() {
        this.$modal.hide("csvinport"); 
      },
      onSelect: function(val){
      //  this.selectrowcount = val.list.length;
        this.selectrows = val.list;
        this.sortno = val.minno;
      },
      updatestartday: function(day){
        this.startday=day;
        this.onHoliDay();
      },
      onHoliDay: function() {
          var self = this;
          var senddata = {
              params: {
                //month: month,
                modeltype: self.mc,
                startday: self.startday,
                basehour: 0,
                settingtime: 0,
                workrate: 0,
                daylist: null
              }
          } 
          let promise = axios.get( self.mcplanserver + "/getholiday", senddata)  
          return promise.then((result) => {
            //  self.daylist = self.onMakeDaylist(result.data.daylist);  
              self.daylist = result.data.daylist; 
              self.basehour = result.data.basehour; 
              self.settingtime = result.data.settingtime; 
              self.workrate = result.data.workrate;                         
              self.updatekey += 1; 
              self.selectrows = [];
              this.onGetOrder(); 
          }).catch(error => {
            console.log("error " + error) 
          })  
      },
      onGetOrder: function() {
        if (this.mc != null) {
          var self = this;
          var senddata = {
                modeltype: self.mc,
                daylist: self.daylist,
                startday: self.startday,
                ids: null,
                planlist: null
          } 
          let promise = axios.post( self.mcplanserver + "/getmcplan", senddata)  
          return promise.then((result) => {
              self.planlist = result.data.planlist.sort(addtimesort); 
              self.daylist = result.data.daylist;
              self.selectrows = [];        
          }).catch(error => {
            console.log("error " + error) 
          })
        }   
      },
      onAddOrder: function(data) {
        var self = this;
        this.addserial += 1;
        var timestr = make_id() + "-" + toDoubleDigits(this.addserial);
        var mcplan = {
          _id:        timestr + "-" + self.mc + "-" + data[0]._id,
          modeltype:  self.mc,
          csvdataid:  data[0]._id,             
          update_time:null,
          comment:    "",
          modelid:    data[0].modelid,
          price:      data[0].price,
          pice:       data[0].pice,
          qty:        data[0].qty,
          startday:   self.startday,
          daymaxcount:data[0].daymaxcount,
          addtime:    timestr,
          starttime:  null,
          endtime:    null,
          worktime:   0,
          settingtime:2.0,
          workrate:   self.workrate,
          sortno: 0,
          column:     []  
        }
        var senddata = {
           modelid:    data[0].modelid,
           pintype:    0,
           spm:        self.spm,
           basehour:   self.basehour,
           settingtime: self.settingtime,
           workrate:   self.workrate,
           modeltype:  self.mc, 
           filter1:    self.filter1, 
           mcplan:     mcplan, 
           daylist:    self.daylist,
           ids: null,
           planlist:   null,
           startday:   self.startday,
           fixedtime:  0
        } 
        let promise = axios.post( self.mcplanserver + "/setmcplan", senddata)  
        return promise.then((result) => {
          self.planlist = result.data.planlist.sort(addtimesort); 
          self.selectrows = [];       
        }).catch(error => {
          console.log("error " + error) 
        }) 
      },
      onPlanDelete: function() {
        var self = this;
        this.$dialog
        .confirm({
          title: '削除確認',
          body: self.selectrows.length + ' 件削除してもよろしいですか？'
        },{
          okText: 'はい',
          cancelText: 'キャンセル',
        })
        .then(function() {
          var senddata = {
            dellist: idlist(self.selectrows),
            modeltype: self.mc,
            daylist: self.daylist,
            startday: self.startday,
            sortno: self.sortno,
            lastsortno: 0,
            spm: self.spm,
            settingtime: self.settingtime,
            workrate:   self.workrate,
            basehour:   self.basehour,
            planlist: null
          } 
          let promise = axios.post( self.mcplanserver + "/delmcplan", senddata)  
          return promise.then((result) => {
            self.planlist = result.data.planlist.sort(addtimesort);  
            self.selectrows = [];  
          }).catch(error => {
            console.log("error " + error) 
          })
        })
        .catch(function() {
          console.log('実行はキャンセルされました');
        });
      },
      onPlanRefrash: function() {
        var self = this;
        this.$dialog
        .confirm({
          title: '更新確認',
          body: self.selectrows.length + '予定を再作成してもよろしいですか？'
        },{
          okText: 'はい',
          cancelText: 'キャンセル',
        })
        .then(function() {
          var senddata = {
            modeltype: self.mc,
            daylist: self.daylist,
            startday: self.startday,
            sortno: self.sortno,
            ids: null,
            spm: self.spm,
            basehour:   self.basehour,
            settingtime: self.settingtime,
            workrate:   self.workrate,
            lastsortno: 0,
            planlist: null
          } 
          let promise = axios.post( self.mcplanserver + "/refrashmcplan", senddata)  
          return promise.then((result) => {
            self.planlist = result.data.planlist.sort(addtimesort);   
            self.selectrows = [];
          }).catch(error => {
            console.log("error " + error) 
          })
        })
        .catch(function() {
          console.log('実行はキャンセルされました');
        });
      },
      onPlanChange: function() {
        var self = this;
        this.$dialog
        .confirm({
          title: '入替確認',
          body: self.selectrows.length + '予定を入替してもよろしいですか？'
        },{
          okText: 'はい',
          cancelText: 'キャンセル',
        })
        .then(function() {
          var senddata = {
            changelist: self.selectrows,
            modeltype: self.mc,
            daylist: self.daylist,
            startday: self.startday,
            sortno: self.sortno,
            ids: null,
            spm: self.spm,
            basehour:   self.basehour,
            settingtime: self.settingtime,
            workrate:   self.workrate,
            lastsortno: 0,
            planlist: null
          } 
          let promise = axios.post( self.mcplanserver + "/changemcplan", senddata)  
          return promise.then((result) => {
            self.selectrows = [];
            self.planlist = result.data.planlist.sort(addtimesort);   
          }).catch(error => {
            console.log("error " + error) 
          })
        })
        .catch(function() {
          console.log('実行はキャンセルされました');
        });
      },
      getMcName: function(data) {
        this.mc = data.text;
        this.spm = data.spm;
        this.type = data.type;
        this.filter1 = data.filter1;
        this.mcdata = data;
      }
    }  
  }

  function idlist(array){
    var list = [];
    array.forEach((item, index) => {
        list.push(item._id)
    });
    return list;
  };

  function addtimesort( a, b ){
    var r = 0;
    if( a.sortno < b.sortno ){ r = -1; }
    else if( a.sortno > b.sortno ){ r = 1; }
    return r;
  }
  
  </script>
  
  <style scoped>
  .header { 
      max-height: 80px;
  }
  
  .filterinput {
     width: 200px;
  }

  .inclass {
    width: 120px;
    font-size: 14px;
    padding: 3px 0 3px 0;
    border: 1px solid #bebebe;	/* 境界線を実線で指定 */
    border-radius: 3px;
    text-align: center;
  }
  </style>