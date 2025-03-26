<template>
    <b-container fluid>
      <b-row class="h-10 header">
          <b-col cols="3">
              <!--<month-select ref="monthselect" :month="null" class="float-left mt-2" @update="getmonth"></month-select>-->
              <b-form-group label-cols="12" label-cols-lg="2" label="稼働日" label-for="input-sm" class="mt-2 mb-0">
                <b-form-datepicker id="mcplan-datepicker" v-model="date" class="mb-2" v-bind:disabled="tabno > 1"></b-form-datepicker>
              </b-form-group>
            </b-col>
          <b-col cols="9">
              <mc-select ref="monthselect" class="float-left mt-2" :tabno="tabno" @update="getMcName" v-bind:disabled="tabno > 1"></mc-select>  
              <button type="button" class="btn float-left btn-info mr-1 mt-2" v-on:click="csvinportopen" v-bind:disabled="tabno > 1">CSV表示</button>                 
              <button type="button" class="btn float-left btn-primary mr-1 mt-2" v-on:click="onGetOrder" v-bind:disabled="tabno > 1">再表示</button> 
              <button type="button" class="btn float-left btn-danger mr-1 mt-2" v-on:click="onPlanDelete" v-bind:disabled="selectrows.length==0 || tabno > 1">削除</button>                 
              <button type="button" class="btn float-left btn-warning mr-1 mt-2" v-on:click="onPlanChange" v-bind:disabled="selectrows.length !=2 || tabno > 1">入替</button> 
              <button type="button" class="btn float-left btn-warning mr-1 mt-2" v-on:click="onTest">テスト</button>                      
              <!--<grid-filter ref="input-filter" class="float-left m-2" @change="onFilterChange"/>-->
              <label class="mt-3 ml-3">選択数：{{ selectrows.length }}</label>             
            <!--  <button type="button" class="btn float-left btn-info  btn-md m-2" v-on:click="getprinter()">プリンタ設定</button>
              <label class="ml-2 mr-2 mt-3"><h6>使用プリンタ: {{  printer }}</h6></label> -->
          </b-col>
      </b-row>
      <b-row class="h-90">
        <b-col class="col-xl-12">
          <b-alert
            :show="dismissCountDown"
            dismissible
            fade
            variant="danger"
          >
            サーバーと通信中・・・
          </b-alert>
          <div>
            <b-tabs content-class="mt-3 text-black">
              <b-tab title="注文取込一覧" active @click="onTabClick(1)">
                <mc-grid2 ref="mcgrid2" :planlist="planlist" :key="updatekey" :param="{ startday: startday, mc: mc, spm: spm, basehour: basehour, settingtime: settingtime, type: type, workrate: workrate }" :daylist="daylist"  @select="onDaySelect" @select2="onRowSelect" class="m-1"></mc-grid2>
              </b-tab>
              <b-tab title="機械予定表" @click="onTabClick(2)">
                <mc-grid ref="mcgrid" :key="updatekey2" :planlist="planlist" :param="{ startday: startday, mc: mc, spm: spm, basehour: basehour, settingtime: settingtime, type: type, workrate: workrate }" :daylist="daylist" @select="onSelect" @progress="onProgress" class="m-1"></mc-grid>
              </b-tab>
            </b-tabs>
            <modal name="csvinport" :width="1200" :height="720">
               <csv-inport :mcdata="mcdata" @select="onAddOrder" @close="csvinportclose"></csv-inport>
            </modal>
            <modal name="productform" :width="750" :height="350">
              <product-form :items="formdata" @update="onGetOrder" @close="onProductFormClose"></product-form>
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
  import McGrid2  from './mcscheduler/McGridag.vue'
  import McGrid  from './mcscheduler/McGrid.vue'
  //import MonthSelect  from './mcscheduler/MonthSelect.vue'
  import McSelect  from './mcscheduler/McSelect.vue'
  import CsvInport from './mcscheduler/CsvInport.vue'
  import ProductForm from './mcscheduler/ProductForm.vue'
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
      "mc-grid2": McGrid2,
      "mc-grid": McGrid,    
      //"month-select": MonthSelect,
      "csv-inport": CsvInport,
      "mc-select": McSelect,
      "product-form": ProductForm
    },
    data() {
      return {
        dismissCountDown: false,
        tabno: 1,
        date: null,
        selectrows: [],
        daylist: [],
        startday: formatDay(new Date()),
        currentday: null,
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
        sortno: 0,
        startid: null,
        formdata: null
      }
    },
    watch: {
      mc: function(val) {
       // this.onHoliDay();
        this.onGetOrder();
      },
      date: function(val){
        this.startday = formatDay(val);
        localStorage.setItem('startday',this.startday);
       // this.updatestartday(val);
        this.onHoliDay();
      },
      selectrows: function(val){
        console.log(val);
      }
    },  
    computed: {
      ...mapState({
        mcplanserver: 'mcplanserver',
      }),
    },
    mounted() {
      // this.onHoliDay();
      if (localStorage.getItem('startday')) {
         this.startday = formatDay(localStorage.getItem('startday')); 
         this.date = new Date(this.startday);
       }

       if (localStorage.getItem('startday')) {
         this.startday = formatDay(localStorage.getItem('startday')); 
         this.date = new Date(this.startday);
       }

       if (this.startday != null && this.mc != null) {
        // this.onGetOrder();
       }
       this.addserial = 0;
    },
    methods: {
      onGetPlanList: function() {
        if (this.mc != null && this.daylist.length > 0) {
            var self = this;
            this.onProgress(true);
            self.rowData = [];
            var senddata = {
                modeltype: self.mc,
                daylist: self.daylist,
                startday: self.startday,
                timelist: "",
                ids: null,
                planlist: null
            } 
            let promise = axios.post( self.mcplanserver + "/getmcplan", senddata)  
            return promise.then((result) => {
                self.planlist = result.data.planlist;
                this.onProgress(false); 
               // self.daylist = result.data.daylist;
               // self.selectrows = [];        
            }).catch(error => {
            console.log("error " + error) 
            })
        }   
    },
      onProgress: function(flg){
        this.dismissCountDown = flg;
      },
      onRowSelect: function(arr){
      this.selectrows = arr;
      },
      onTabClick(i) {
        this.tabno = i;
        if (i==1) {
          this.onGetPlanList();
          // this.updatekey += 1;
         // this.$refs.mcgrid2.onGetOrder();
        } else if (i==2){
          this.updatekey2 += 1;
         // this.$refs.mcgrid.onGetOrder();
        }
      },
      onDaySelect: function(e){
        var self = this;
        var senddata = {
             params: {
                ornerid: e._id,
                tasklist: null
             }
          } 
          let promise = axios.get( self.mcplanserver + "/gettasklist", senddata)  
          return promise.then((result) => {
            //  self.daylist = self.onMakeDaylist(result.data.daylist);  
              this.formdata = { id: result.data.ornerid, qty: e.qty, day: self.startday, task: result.data.tasklist, list: e.tasklist }; 
              this.$modal.show("productform")
          }).catch(error => {
            console.log("error " + error) 
          }) 
      },
      onTest: function(e){
        var self = this;

        var senddata = {
             data: {
                ornerid: "123"
             }
          } 
          let promise = axios.delete( self.mcplanserver + "/getdelete", { data: { ornerid: "123" } })  
          return promise.then((result) => {
            //  self.daylist = self.onMakeDaylist(result.data.daylist);  
            console.log(result)
          }).catch(error => {
            console.log("error " + error) 
          }) 
      },
      onProductFormClose: function() {
        this.$modal.hide("productform"); 
      },
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
        this.startid = val.minid;
        this.currentday = val.start;
      },
    /*  updatestartday: function(day){
        this.startday=formatDay(day);
        this.onHoliDay();
      },*/
      onHoliDay: function() {
        if (this.mc != null && this.startday != null){
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
              this.onGetPlanList();
          }).catch(error => {
            console.log("error " + error) 
          })  
        }  
      },
      onGetOrder: function() {
        if (this.tabno==1) {
          this.onGetPlanList();
        //  this.updatekey += 1;
        //  this.$refs.mcgrid2.onGetOrder();
        } else if (this.tabno==2){
         // this.updatekey += 1;
          this.$refs.mcgrid.onGetOrder();
        }
      /* if (this.mc != null) {
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
        }  */ 
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
          modelname:  data[0].modelname,          
          price:      data[0].price,
          pice:       data[0].pice,
          qty:        data[0].qty,
          startday:   formatDay(self.startday),
          daymaxcount:data[0].daymaxcount,
          addtime:    timestr,
          starttime:  null,
          endtime:    null,
          worktime:   0,
          settingtime:2.0,
          shipment:   formatDay(data[0].date),
          workrate:   self.workrate,
          sortno: 0,
          column:     []  
        }
        var senddata = {
         //  modelid:    data[0].modelid,
         //  pintype:    0,
           spm:        self.spm,//回転数
           basehour:   self.basehour,//ベース勤務時間
           settingtime: self.settingtime,//ベース切り替え時間
           workrate:   self.workrate,//稼働率
           modeltype:  self.mc, //機械
          // filter1:    self.filter1, 
           mcplan:     mcplan, //追加計画
           daylist:    self.daylist,//日付リスト
           ids: null,  //対象IDの入れ物
           planlist:   null,//GRID表示用リストの入れ物
           startday:   self.startday,//更新スタート日
           fixedtime:  0//追加日当に考慮する前作業時間
        } 
        let promise = axios.post( self.mcplanserver + "/setmcplan", senddata)  
        return promise.then((result) => {
          self.onGetPlanList();
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
            modeltype: self.mc,//機械
            daylist: self.daylist,//日付リスト
            startday: self.startday,//更新スタート日
            sortno: self.sortno,//親計画のソートNo
         //   startid: self.startid,
            lastsortno: 0,//削除計画の一つ前の計画ID入れ物
            spm: self.spm,//回転数
            settingtime: self.settingtime,//ベース切り替え時間
            workrate:   self.workrate,//稼働率
            basehour:   self.basehour,//ベース勤務時間
            planlist: null//GRID表示用リストの入れ物
          } 
          let promise = axios.post( self.mcplanserver + "/delmcplan", senddata)  
          return promise.then((result) => {
            self.selectrows = [];
            if (self.tabno==1) {
              self.onGetPlanList();
            }
            if (self.tabno==2) {
              self.$refs.mcgrid.onGetOrder();
            }  
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
            modeltype: self.mc,//機械
            daylist: self.daylist,//日付リスト
            startday: self.currentday,//更新スタート日
            sortno: self.sortno,//親計画のソートNo
            ids: null,//対象IDの入れ物
            spm: self.spm,//回転数
            basehour:   self.basehour,//ベース勤務時間
            settingtime: self.settingtime,//ベース切り替え時間
            workrate:   self.workrate,//稼働率
            lastsortno: 0,
            planlist: null//GRID表示用リストの入れ物
          } 
          let promise = axios.post( self.mcplanserver + "/remakemcplan", senddata)  
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
      onQtyUpdate: function(value) {
        var self = this;
        this.$dialog
        .confirm({
          title: '更新確認',
          body: '台数を変更しますか？'
        },{
          okText: 'はい',
          cancelText: 'キャンセル',
        })
        .then(function() {

          //更新した計画の着工日とソートNoを求める。
          const column = value.record.column.filter((row) => {
              if( row.plan > 0) {
                return true
              } else {
                return false         
              }
          })
 
          var senddata = {
            value: value,  //更新する内容
            modeltype: self.mc,//機械
            daylist: self.daylist,//日付リスト
            startday: column[0].daystr,//更新スタート日
            sortno: value.record.sortno,//親計画のソートNo
            ids: null,//対象IDの入れ物
            spm: self.spm,//回転数
            basehour:   self.basehour,//ベース勤務時間
            settingtime: self.settingtime,//ベース切り替え時間
            workrate:   self.workrate,//稼働率
            lastsortno: 0,
            planlist: null//GRID表示用リストの入れ物
          } 
          let promise = axios.post( self.mcplanserver + "/updatemcplan", senddata)  
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
          var changelist = [];
          for (var i in self.selectrows){
            changelist.push({ _id: self.selectrows[i]._id, sortno: self.selectrows[i].sortno})
          }
          var senddata = {
            changelist: changelist,//入れ替え計画のリスト
            modeltype: self.mc,//機械
            daylist: self.daylist,//日付リスト
            startday: self.startday,//更新スタート日
            sortno: self.sortno,//親計画のソートNo
            ids: null,//対象IDの入れ物
            spm: self.spm,//回転数
            basehour:   self.basehour,//ベース勤務時間
            settingtime: self.settingtime,//ベース切り替え時間
            workrate:   self.workrate,//稼働率
            lastsortno: 0,
            planlist: null//GRID表示用リストの入れ物
          } 
          let promise = axios.post( self.mcplanserver + "/changemcplan", senddata)  
          return promise.then((result) => {
            self.selectrows = [];
            if (self.tabno==1) {
              self.onGetPlanList();
            }
            if (self.tabno==2) {
              self.$refs.mcgrid.onGetOrder();
            } 
          }).catch(error => {
            console.log("error " + error) 
          })
        })
        .catch(function() {
          console.log('実行はキャンセルされました');
        });
      },
      onProductChange: function(val) {
        var self = this;
      /*  this.$dialog
        .confirm({
          title: '入替確認',
          body: self.selectrows.length + '予定を入替してもよろしいですか？'
        },{
          okText: 'はい',
          cancelText: 'キャンセル',
        })
        .then(function() {*/
          var senddata = {
            _id: val._id,  //対象タスクのID
            mcplan: val.orner,//親計画
            modeltype: self.mc,//機械
            daylist: self.daylist,//日付リスト
            ornerid: val.orner._id,//親計画ID
            startday: val.startday,//更新スタート日
            sortno: val.orner.sortno,//親計画のソートNo
            product: val.product,//実績
            retvalue: val.retvalue,//リターン実績値
            ids: null,//対象IDの入れ物
            spm: self.spm,//回転数
            basehour:   self.basehour,//ベース勤務時間
            settingtime: self.settingtime,//ベース切り替え時間
            workrate:   self.workrate,//稼働率
            lastsortno: 0,//
            planlist: null//GRID表示用リストの入れ物
          } 
          let promise = axios.post( self.mcplanserver + "/setproduct", senddata)  
          return promise.then((result) => {
            self.selectrows = [];
            self.planlist = result.data.planlist.sort(addtimesort);   
          }).catch(error => {
            console.log("error " + error) 
          })
      /*  })
        .catch(function() {
          console.log('実行はキャンセルされました');
        });*/
      },
      getMcName: function(data) {
        this.mc = data.text;
        this.spm = data.spm;
        this.type = data.type;
        this.filter1 = data.filter1;
        this.mcdata = data;
        this.onHoliDay();
       // this.onGetPlanList();
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