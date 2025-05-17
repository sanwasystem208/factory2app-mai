<template>
    <b-container fluid>
      <b-row class="h-10 header">
          <b-col cols="12">
              <b-row>
                <b-col class="col-xl-4">
                   <month-select ref="monthselect" :month="null" class="float-left mt-2" @update="getmonth"></month-select>
                   <button type="button" class="btn float-left btn-danger btn-sm mr-1 mt-2" v-on:click="oncarryover2">理論在庫で棚卸</button>                 
                   <!--<grid-filter ref="input-filter" class="float-left m-2" @change="onFilterChange"/>-->
                   <download-csv :data="download_csv" :name="csvname">
                       <button type="button" class="btn btn-warning btn-sm m-2">CSV</button>
                   </download-csv>
                 <!--  <button type="button" class="btn float-left btn-info  btn-md m-2" v-on:click="getprinter()">プリンタ設定</button>
                   <label class="ml-2 mr-2 mt-3"><h6>使用プリallcountンタ: {{  printer }}</h6></label> -->
                </b-col>
                <b-col class="col-xl-4">
                  <vue-simple-suggest
                      v-model="filterstr"
                      class="filterinput p-0 mt-2 float-left mr-1"
                      :list="list"
                      :filter-by-query="true">
                      <input type="text" name="tag" id="tag" autocomplete="off" class="p-1">    
                   </vue-simple-suggest>
                   <button type="button" class="btn float-left btn-success  btn-sm mt-2 mr-1" v-on:click="getpartlist2(0)">一部一致</button> 
                   <button type="button" class="btn float-left btn-primary  btn-sm mt-2 mr-1" v-on:click="getpartlist2(1)">完全一致</button> 
                   <button type="button" class="btn float-left btn-danger  btn-sm mt-2 mr-1" v-on:click="getpartlist()">抽出解除</button> 
                  </b-col>
                  <b-col class="col-xl-3">
                    <button type="button" class="btn float-left btn-info  btn-sm m-2" v-on:click="getprinter()">プリンタ設定</button>
                    <label class="ml-2 mr-2 mt-3"><h6>使用プリンタ: {{  printer }}</h6></label> 
                  </b-col>
                  <b-col class="col-xl-1">
                    <label class="mt-3">在庫:{{ allcount.toLocaleString() }}</label>
                  </b-col>
              </b-row>
          </b-col>
      </b-row>
      <b-row class="h-90">
        <b-col class="col-xl-12">
          <div>
            <b-tabs content-class="mt-3">
              <b-tab title="ロット別" active @click="onTabClick(1)">
                <part-grid ref="partgrid" :key = "updatekey" :items="partlist" :daylist="daylist" class="m-0" @dblclick="onPartEditOpen"></part-grid>
              </b-tab>
              <b-tab title="部品別" @click="onTabClick(2)">
                <part-grid2 ref="partgrid2" :key = "updatekey2" :items="partlist2" :daylist="daylist" class="m-0" @dblclick="onPartEditOpen"></part-grid2>
              </b-tab>
            </b-tabs>
          </div> 
            <modal name="part-edit"       
            :width="1000"
            :height="500"
            :draggable="true">
            <part-edit ref="editpart" class="m-0" :items="editpart" :printer="printer" @update="setpartdata" @delete="onDelete" @taskupdate="onTaskUpdate" @close="edithide"></part-edit> 
            </modal>
            <modal name="progress-view"       
            :width="350"
            :height="100"
            >
            <progress-view ref="progressview"></progress-view>
            </modal>
        </b-col> 
      </b-row>
    </b-container>
</template>
  
  <script>
  
  //<button type="button" class="btn btn-danger btn-sm mr-1 mt-1" v-bind:disabled="!carryoverflg" v-on:click="oncarryover">繰越</button>  
  
  import Vue from 'vue'
  import axios from "axios";

  import PartGrid  from './partlist/PartGrid.vue'
  import PartGrid2  from './partlist/PartGrid2.vue' 
  import PartEdit  from './partlist/PartEdit.vue'
  import MonthSelect  from './partlist/MonthSelect.vue'
  import GridFilter  from './partlist/GridFilter.vue'
  import ProgressView  from './ProgressView.vue'

  import JsonCSV from 'vue-json-csv';
  Vue.component('downloadCsv', JsonCSV);

  import VueSimpleSuggest from "vue-simple-suggest";
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
    make_daylist2,
  } = date_func();

  export default {
    components: {
      "part-grid": PartGrid,
      "part-grid2": PartGrid2,
      "part-edit": PartEdit,
      "month-select": MonthSelect,
      "grid-filter": GridFilter,
      "progress-view": ProgressView,
      VueSimpleSuggest
    },
    data() {
      return {
        selectrows: [],
        currentid: null,
        currentmonth: null,
        carryoverflg: false,
        editmsg: null,
        partlist: [],
        partlist2: [],
        daylist: [],
        editpart: null,
        startday: null,
        lastday: null,
        month: null,
        updatekey: 0,
        updatekey2: 0,        
        filterstr: null,
        printer: null,
        download_csv: [],
        filterflg: 0,
        list: [],
        csvname: "stock_" + formatDay(new Date()) + ".csv"
      }
    },
    watch: {
        partlist: function(val) {
            if (val.length == 0) {
              alert("0件です");
            } else {
                var json = [];
                val.forEach((item, index) => {
                  var row = {};
                  row["id"] = item._id.substring(0,7);
                  row["modelname"] = item.modelname;
                  row["lot"] = "'" + item.lot;
                  row["modelid"] = "'" + item.info.modelid;
                  item.daylist.forEach((item1, index1) => {
                    row[item1.daystr] = item1.total || 0;
                  });
                  json.push(row);
                }); 
                this.download_csv = json;
            }
        //  console.log("partlist--" + JSON.stringify(val)) 
        },
        filterstr: function(val) {
          this.onSuggestList();
        }
    },
    computed: {
      ...mapState({
        partserver: 'partserver',
      }),
      allcount: function() {
        var qty = 0;
       // if (this.filterflg==1) {
          for (var i in this.partlist) {
            qty += this.partlist[i].daylist[this.partlist[i].daylist.length-3].total;
          }
//}
        return qty;
      },
    },
    mounted() {
       if(localStorage.printer) {
          this.printer = localStorage.printer;
       }
    },
    methods: {
      onTabClick(i) {
        if (i==1) {
          this.updatekey += 1;
        } else if (i==2){
          this.updatekey2 += 1;
        }
      },
      getprinter() {
          // 入力ダイアログを表示 ＋ 入力内容を user に代入
          var ip = window.prompt("プリンタのIPアドレスを入れてください", "");
          if(ip != "" && ip != null){
            this.printer = ip;
            localStorage.printer = ip;
          }
          else{
            window.alert('キャンセルされました');
          }
      },
      onFilterChange: function(e) {
        this.filterstr = e;
        if (e != null) {
          this.getpartlist();      
        }
      },
      getmonth: function(val){
         this.startday = val.startday;
         this.lastday = val.lastday;
         this.month = val.month;
        // this.getpartlist();
      },
      onPartEditClose: function() {
        this.$modal.hide("part-edit");
      },
      onSuggestList: function() {
          var url = "/getsuggest";
          var senddata = {
              params: {
                str: this.filterstr,
                month: this.startday,
                retdata: null
              } 
          }    
        let promise = axios.get( this.partserver  + url, senddata)  
         return promise.then((result) => {
             this.list = result.data.retdata;
        }).catch(error => {
            console.log("error " + error) 
        }) 
      },
      onPartEditOpen: function(e) {
        var self = this;
        var senddata = {
           _id: e[0]._id,
           info: "",
           datalist: []
        }
        let promise = axios.post(self.partserver + '/getpartinfo',senddata)  
        return promise.then((result) => {
           self.editpart = result.data;
           this.$modal.show("part-edit");
        }).catch(error => {
            console.log("error " + error) 
        }) 
      },
      getpartlist: function() {
        var self = this;
        this.$modal.show("progress-view");
        this.filterflg = 0;
        this.filterstr = "";
        var senddata = {
          startday: self.startday,
          lastday: self.lastday, 
          month:  self.month,
          filterstr: null,
          filterflg: 0,
          daylist: make_daylist2(self.startday, self.lastday),    
          retdata: []
        }
        let promise = axios.post(self.partserver + '/getpartlist2',senddata)  
        return promise.then((result) => {
            self.daylist = senddata.daylist;
            self.partlist = result.data.retdata;
            self.$modal.hide("progress-view");
            self.updatekey += 1;
            self.onAllCount();
        }).catch(error => {
            console.log("error " + error)
        }) 
      },
      getpartlist2: function(flg) {
        var self = this;
        self.$modal.show("progress-view");
        self.filterflg = flg;
        var senddata = {
          startday: self.startday,
          lastday: self.lastday, 
          month:  self.month,
          filterstr: self.filterstr,
          filterflg: flg,
          daylist: make_daylist2(self.startday, self.lastday),    
          retdata: [],
          retdata2: []
        }
        let promise = axios.post(self.partserver + '/getpartlist2',senddata)  
        return promise.then((result) => {
            self.daylist = senddata.daylist;
            self.partlist = result.data.retdata;
            self.partlist2 = result.data.retdata2;        
            self.$modal.hide("progress-view");
            self.updatekey += 1;
            self.updatekey2 += 1;  
            self.onAllCount();        
        }).catch(error => {
            console.log("error " + error) 
        }) 
      },
      onDelete: function(_id){
        var self = this;
        if(window.confirm(_id + ' を削除しますか？')){
            var self = this;
            var senddata = {
              _id: _id,
              startday: self.startday,
              lastday: self.lastday, 
              month:  self.month,
              filterstr: self.filterstr,
              filterflg: 0,
              daylist: make_daylist2(self.startday, self.lastday),    
              retdata: []
            }
            let promise = axios.post(self.partserver + '/dellotlabel',senddata)  
            return promise.then((result) => {
                self.daylist = senddata.daylist;
                self.partlist = result.data.retdata;
                self.updatekey += 1;
                self.onAllCount();
            }).catch(error => {
                console.log("error " + error) 
            }) 
        }
        else{
          window.alert('キャンセルされました'); // 警告ダイアログを表示
        }
      },
      setpartdata: function(e) {
        var self = this;
        var senddata = {
           startday: self.startday,
           lastday: self.lastday, 
           month:  self.month,
           filterstr: self.filterstr,
           filterflg: self.filterflg,
           daylist: make_daylist2(self.startday, self.lastday),   
           params: e, 
           retdata: []
        }
        let promise = axios.post(self.partserver + '/setpartdata',senddata)  
        return promise.then((result) => {
            self.daylist = senddata.daylist;
            self.partlist = result.data.retdata;
            self.updatekey += 1;
            self.onAllCount();
        }).catch(error => {
            console.log("error " + error) 
        }) 
      },
      onTaskUpdate: function(e) {
        var self = this;
        var senddata = {
           startday: self.startday,
           lastday: self.lastday, 
           month:  self.month,
           filterstr: self.filterstr,
           filterflg: self.filterflg,  
           daylist: make_daylist2(self.startday, self.lastday),   
           params: e, 
           retdata: []  
        }
        let promise = axios.post(self.partserver + '/settasklist',senddata)  
        return promise.then((result) => {
            self.daylist = senddata.daylist;
            self.partlist = result.data.retdata;
            self.updatekey += 1;
            self.onAllCount();
        }).catch(error => {
            console.log("error " + error) 
        }) 
      },
      showcalender: function() {
        var self = this;
        var val = {};
        this.$refs.calender.showModal(val);
      },
      editshow: function() {
        //this.$modal.show("editpart-dialog");
      },
      edithide: function () {
        this.$modal.hide("part-edit");
      }, 
      customfilter(data) {
          this.$refs.fllowgrid.calendar_filter(data);
      },
      allshow() {
          var dat = {
          filtertype: "all",
          delivery: null,
          modelname: null
          }
          this.$refs.fllowgrid.calendar_filter(dat);
      },
      inportshow: function() {
        this.$modal.show("csv-form");
      },
      inporthide: function () {
        this.$modal.hide("csv-form");
      },
      onSaveCsv() {
        this.$refs.partgrid2.onSaveCsv();
      },
      onstock(flg) {
          var self = this;
  
          var qty = window.prompt(this.stockcomment[flg] + " を入力してください", "");
          if(isNumber(qty)){
  
          var temp = this.selectrows[0];
  
          if (flg == 1) {
            qty *= -1;
          }
  
          var senddata = {
                  _id:         temp.partid + "-" + this.currentmonth + "-" + make_id() + "-1",
                  partid:      temp.partid,
                  month:       parseInt(this.currentmonth),
                  flg:         flg,
                  qty:         qty,
                  orderid:     "",  
                  workday:     new Date(),
                  daystr:      formatDay(new Date()),
                  retdata: ""
              }
  
            let promise = axios.post( this.partserver + "/setstock", senddata)  
            return promise.then((result) => {
              console.log("result " + result) 
               self.$refs.partgrid2.onupdaterow(result.data.retdata);
            }).catch(error => {
               console.log("error " + error) 
  
            }) 
  
          }
          else{
            window.alert('キャンセルされました');
          }
      },
      ongetstock() {
          var self = this;
          var temp = this.selectrows[0];
          var senddata = {
                  partid:      temp.partid,
                  month:       parseInt(this.currentmonth),
                  retdata: ""
              }
  
            let promise = axios.post( this.partserver + "/getstock", senddata)  
            return promise.then((result) => {
              console.log("result " + result) 
               self.$refs.partgrid2.onupdaterow(result.data.retdata);
            }).catch(error => {
               console.log("error " + error) 
  
            }) 
      },
      oncarryover: function() {
       var self = this;
     //   if (self.rowData.length > 0 ) {
  
        var nextmonth = addnextmonth(self.month);  
        var nextstart = addnextstart(self.month);
        var nextlast = addnextlast(self.month);
        var dia = confirm(nextmonth + " に繰り越しますか？");
         if (dia == true){
   
            var senddata = {
                nextmonth: nextmonth,
                month: self.month,
                startday: self.startday,
                lastday: self.lastday,
                filterstr: null,
                daylist: make_daylist2(self.startday, self.lastday), 
                retdata: []   
              }
              let promise = axios.post(self.partserver + '/setcarryover',senddata)  
              return promise.then((result) => {
                  self.daylist = senddata.daylist;
                  self.partlist = result.data.retdata;
                  self.updatekey += 1;
                  alert("完了しました");
              }).catch(error => {
                  console.log("error " + error) 
              }) 
  
         // this.$nprogress.start();
          } else {
            alert("キャンセルしました");
          } 
  
     /*   } else {
          alert("更新できませんでした")
        }*/
      },
      oncarryover2: function() {
        var dia = confirm("理論在庫を棚卸に反映しますか？");
         if (dia == true){
            var list = [];
            var self = this;
            var count = this.partlist[0].daylist.length - 2;
            for (var i in this.partlist) {
              var last = this.partlist[i].daylist[count];
              last._id = this.partlist[i]._id;
              list.push(last);
            }
  
            console.log("length:" + list.length)
  
            var senddata = {
              startday: self.startday,
              lastday: self.lastday, 
              month:  self.month,
              filterstr: self.filterstr,
              daylist: make_daylist2(self.startday, self.lastday),    
              retdata: [],
              inventlist: list
            }
            let promise = axios.post(self.partserver + '/settempinvent',senddata)  
            return promise.then((result) => {
                self.daylist = senddata.daylist;
                self.partlist = result.data.retdata;
                self.updatekey += 1;
                alert("完了しました");
            }).catch(error => {
                console.log("error " + error) 
            }) 
          } else {
            alert("キャンセルしました");
          }    
      },
    }  
  }

  </script>
  
  <style scoped>
  .header { 
      max-height: 80px;
  }
  
  .filterinput {
     width: 200px;
  }
  
  </style>