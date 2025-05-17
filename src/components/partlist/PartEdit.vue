,<template>
   <b-container fluid class="p-0 m-0">
    <!-- User Interface controls -->
    <b-row class="h-10 titles2 m-0">
        <b-col xl="10">
          <h5 class="m-2" style="color:white">部品編集</h5>
        </b-col>
        <b-col xl="2">
          <b-button class="closebutton float-right m-2" size="sm" @click="closewindow">閉じる</b-button>
        </b-col>
    </b-row>
    <b-row class="h-80 m-0">
      <b-col xl="5"  class="p-0">
        <b-row class="h-100 m-0 p-1">
          <b-col xl="12">
            <b-row>
                <b-col xl="3">
                    <label class="m-1" for="inline-form-custom-select-pref">部品ID</label>
                </b-col>
                <b-col xl="9">
                    <label class="m-1">{{ partinfo.info.modelid }}</label>
                </b-col>
            </b-row>
            <b-row>
                <b-col xl="3">
                    <label class="m-1" for="inline-form-custom-select-pref">管理ID</label>
                </b-col>
                <b-col xl="9">
                  <label class="m-1">{{ partinfo.ornerid }}</label>
                </b-col>
            </b-row>
            <b-row>
              <b-col xl="3">
                <label class="m-1" for="m-1">部品名</label>
              </b-col>
              <b-col xl="9">
                <label class="m-1">{{ partinfo.info.modelname }}</label>
              </b-col>
            </b-row>
            <b-row>
              <b-col xl="3">
                  <label class="m-1" for="inline-form-custom-select-pref">ロット</label>
              </b-col>
              <b-col xl="9">
                  <label class="m-1">{{ partinfo.info.lot }}</label>
              </b-col>
            </b-row>
            <b-row>
              <b-col xl="3">
                  <label class="m-1" for="inline-form-custom-select-pref">受入数</label>
              </b-col>
              <b-col xl="9">
                  <b-form-input type="number" id="input-comment" v-model="partinfo.stock" required placeholder="" class="m-1" @change="oneditpart"></b-form-input>
              </b-col>
            </b-row>
            <b-row>
              <b-col xl="9">
                <!--   <b-button type="button" variant="success" class="mt-3 ml-1 float-left" v-on:click="onnewpart" v-if="newpart">新規登録</b-button>
                   <b-button type="button" variant="primary" class="mt-3 ml-1 float-left" v-on:click="oneditpart" v-else>登録</b-button>
                   <b-button type="button" variant="danger" class="mt-3 ml-2 mr-2 float-left" v-on:click="onDelete">削除</b-button>-->
                   <b-button type="button" variant="info" class="mt-3 ml-2 mr-2 float-left" v-on:click="onPrint">ラベル印刷</b-button>
                   <b-button type="button" variant="danger" class="mt-3 ml-2 mr-2 float-left" v-on:click="onAddTask">作業追加</b-button>
              </b-col>
              <b-col xl="3">
                  <label class="m-1"><h6>{{ msg }}</h6></label>
              </b-col>
            </b-row>
          </b-col>  
        </b-row>
      </b-col>  
      <b-col xl="7">
        <div class="mt-3">
          <div style="height: 45vh; border: solid 1px #545454;">
              <c-grid
              :data="records"
              :frozen-col-count="0"
              :theme="userTheme"
              :defaultRowHeight="24"
              >
              <c-grid-menu-column
                field="mode"
                width="20%"
                min-width="0"
                sort="true"
                :options="modeoptions"
                @changed-value="onChangedMode($event)"
              >
              作業名
              </c-grid-menu-column>
              <c-grid-input-column
                field="update_time"
                width= "40%"
                :column-style='column'
                min-width="0"
                sort="true"
              >
                作業日
              </c-grid-input-column>
              <c-grid-input-column
                field="qty"
                width= "20%"
                :column-style='column_num'
                min-width="0"
                sort="true"
                @changed-value="onChangeValue"
              >
                数量
              </c-grid-input-column>
              <c-grid-input-column
                field="workername"
                width= "20%"
                :column-style='column'
                min-width="0"
                sort="true"
              >
                作業者
              </c-grid-input-column>
          </c-grid>
          </div>
          <div class="grid-sample"></div> 
        </div>  
      </b-col>
    </b-row>  
   </b-container>
</template>

<script>

import Vue from 'vue'
import axios from "axios";
import { mapState } from 'vuex'

import date_func from '../../api/date_func'
  const { 
    toDoubleDigits,
    formatDay,
    addnextmonth,
    make_id,
    isNumber,
    addnextstart,
    addnextlast,
    make_daylist,
    getDateTime
  } = date_func();

  export default {
    name: 'editpart',
    props: ["items","printer"],
    components: {
    },  
    data() {
      return {
        msg: "",
        partinfo: null,
        show: true,
        colors: ["","","","","","","",""],
        uselist: [],
        selected: null,
        stocklist: null,
        stockrows: [],
        newpart: false,
        records: [],
        userTheme: null,
        modeoptions: [],
        typelist: [
          { value: 0, text: "入出管理無し"},
          { value: 1, text: "入出管理あり"}
        ],
        markinglist: [
          { value: "", text: ""},
          { value: "A", text: "A"},
          { value: "B", text: "B"},
          { value: "C", text: "C"},
          { value: "D", text: "D"},
          { value: "E", text: "E"},
          { value: "F", text: "F"},
          { value: "G", text: "G"},
          { value: "H", text: "H"},
          { value: "I", text: "I"},
          { value: "J", text: "J"},
          { value: "K", text: "K"},
          { value: "L", text: "L"},
          { value: "M", text: "M"},
          { value: "N", text: "N"},
          { value: "O", text: "O"},
          { value: "P", text: "P"},
          { value: "Q", text: "Q"},
          { value: "R", text: "R"},
          { value: "S", text: "S"},
          { value: "T", text: "T"},
          { value: "U", text: "U"},
          { value: "V", text: "V"},
          { value: "W", text: "W"},
          { value: "X", text: "X"},
          { value: "Y", text: "Y"},
          { value: "Z", text: "Z"},
        ],
        option: {
        errorCorrectionLevel: "M",
        maskPattern: 0,
        margin: 10,
        scale: 2,
        width: 300,
        color: {
          dark: "#000000FF",
          light: "#FFFFFFFF"
        }
      }
      }
    },
    watch: {
      currentid: function(val) {
         this.msg = val + " で登録しました";
      }
    },
    created() {
      this.onTheme();
      this.modeoptions = this.modelist;
      this.partinfo = this.items.info;
      this.records = this.items.datalist;
    //  this.getdivision(1001); 
    },
    mounted() {
      console.log(this.modelist)
    //  this.getuseplan(this.partinfo);
    //  this.getstocklist(this.partinfo);    
    },
    computed: {
        //共通変数
        ...mapState({
            workerid: 'workerid',
            workername: 'workername',
            managementlevel: 'managementlevel',
            serverurl : 'serverurl',
            serverurl2 : 'serverurl2',
            customerid: 'customerid',
            customername: 'customername',
            loginflg: 'loginflg',
            fllowdata: "fllowdata",
            customer: 'customer',   
            partserver: 'partserver',
            division: 'division',
            modelist: 'modelist'
      }),
      partnamelist: function() {
         var ret = [];
         for (var i in this.partinfo.partname) {
           var row= { value: this.partinfo.partname[i]._id, text: this.partinfo.partname[i].partname};
           ret.push(row);
         }
         return ret;
      },
      targetText: function() {
        return "P:" + this.partinfo.partid;
      }
    },
    methods: {
      onChangedMode(e){
        var olddata = e.record;
        olddata.mode = e.oldvalue;
        var newLine = this.modelist.filter(function(item, index){
          if (item.value == e.value) return true;
        }); 
        e.record.modename = newLine[0].label;
        e.record.mode = newLine[0].value;        
        this.records.splice(this.records.indexOf(olddata), 1, e.record);
      },
      onAddTask() {
        var task = {
          _id : this.partinfo.ornerid + "-" + make_id() + "-99",
          daystr : formatDay(new Date()),
          ip : null,
          lot : this.partinfo.info.lot,
          mode : 0,

          modelid : this.partinfo.info.modelid,
          modelname : this.partinfo.info.modelname,
          modename : "",
          ornerid : this.partinfo.ornerid,
          qty : 0,
          update_time : getDateTime(new Date(),0),
          workerid : 0,
          workername : "PC"
        }
        this.records.push(task);
      },
      onPrint() {
        if(window.confirm('棚ラベルを印刷しますか？')){
          if (this.printer==null) {
            alert("プリンタが設定されていません");
            return
          }
          var info = this.partinfo;
          var self = this;
          if (this.records.length > 0) {
            info.qty = this.records[this.records.length-1].qty;
          } else {
            info.qty = 0;
          }
          var qty = window.prompt("数量を入力してください", info.qty);
          if(qty != "" && qty != null){
            info.qty = parseInt(qty);
          }
          var senddata = {
                modelname: this.partinfo.info.modelname,
                lot: this.partinfo.info.lot,
                qty: info.qty,
                _id: this.partinfo.ornerid,
                mode: 1,
                printer: this.printer,
                flg: 0
            }
            let promise = axios.post( this.partserver + "/printlabel", senddata)  
            return promise.then((result) => {
              if (result.data.flg==1) {
                alert("印刷しました");      
              } else {
                alert("印刷に失敗しました");    
              }
            }).catch(error => {
              console.log("error " + error) 

            }) 
        }
        else{
          window.alert('キャンセルされました'); // 警告ダイアログを表示
        }
      },
      onTheme() {
         var ret = {
           font: "normal normal normal 16px/1 FontAwesome",
          /* borderColor: "#35495e",*/
           checkbox: {
             checkBgColor: "#35495e",
             borderColor: "#35495e",
           },  
           color: "#000",
           frozenRowsColor: "#fff",
           frozenRowsBorderColor: "white",
           frozenRowsBgColor: "gray",
           button: {
             color: "#FDD",
             bgColor: "#20c997",
             fontSize: "9px"
           },
           borderColor({ col, row, grid }) {
             if (row < 1) {
                 return [null /*top*/, "white" /*right and left*/, null /*bottom*/];
             } else {
                 return [null /*top*/, "#616161" /*right and left*/,"#616161" /*bottom*/];
             }
           },
         }
         this.userTheme = ret;
      }, 
      getdivision: function(cid) {
        var senddata = {
          param: {
            params: {            
              customerid: cid,
            }
          },  
          commit: 'UPDATE_DIVISION',
          url: this.partserver + '/getdivision'
        }
        this.$store.dispatch('materiallist/http_request', senddata );
      },
      onSubmit(evt) {
        evt.preventDefault()
        alert(JSON.stringify(this.form))
      },
      closewindow: function() {
        this.$emit('close', "");
      },
      onReset() {
        // Reset our form values
        this.form.model = ''
        this.form.quantity = 1
        this.form.comment = ''
        this.form.group =this.customer.group
        // Trick to reset/clear native browser form validation state
        this.show = false
        this.$nextTick(() => {
          this.show = true
        })
      },
      oneditpart: function(){
      /*  var self = this;
        if(window.confirm('更新しますか？')){*/
          //  self.partinfo._id = "_" + self.partinfo.partid;
          this.$emit("update", this.partinfo);
      /*  }
        else{
          window.alert('キャンセルされました'); // 警告ダイアログを表示
        }*/
      },
      onnewpart: function(){
        var self = this;
        if(window.confirm('追加しますか？')){
          //  self.partinfo._id = "_" + self.partinfo.partid;
            var senddata = {
                param: {
                  params: self.partinfo,
                  customerid: self.customerid ,
                  month: self.partinfo.month
                },  
                commit: 'DOWNLOAD_PARTLIST',
                url: this.partserver + '/setnewpart'
              }
            this.$store.dispatch('materiallist/http_post', senddata );
        }
        else{
          window.alert('キャンセルされました'); // 警告ダイアログを表示
        }
      },
      onnewdivision: function(flg){
          // 入力ダイアログを表示 ＋ 入力内容を user に代入
          var txt = window.prompt("設定値を入力してください", "");

          // 入力内容が tama の場合は example_tama.html にジャンプ
          if(txt != '' && txt != null){
              var senddata = {
                  param: {
                    params: {
                      customerid: this.customerid,
                      division: flg,
                      title: this.title[flg],
                      divisionname: txt,
                    }
                  },  
                  commit: 'UPDATE_DIVISION',
                  url: this.partserver + '/setnewdivision'
                }
              this.$store.dispatch('materiallist/http_request', senddata );
          switch( flg ) {
              case 0:
                  this.division0 = txt;
                  break;
              case 1:
                  this.division1 = txt;
                  break;
              case 2:
                  this.division2 = txt;
                  break;  
              case 3:
                  this.division3 = txt;
                  break;
              case 4:
                  this.division4 = txt;
                  break; 
              case 5:
                  this.division5 = txt;
                  break;
              case 6:
                  this.division6 = txt;
                  break; 
              case 7:
                  this.division7 = txt;
                  break;
              case 8:
                  this.division8 = txt;
                  break;     
          }
          }
      },
      ondeldivision: function(txt,flg){
          // 入力ダイアログを表示 ＋ 入力内容を user に代入
         var self = this;
          // 入力内容が tama の場合は example_tama.html にジャンプ
         if(window.confirm('削除しますか？')){
              var senddata = {
                  param: {
                    params: {
                      customerid: self.customerid,
                      division: flg,
                      divisionname: txt,
                    }
                  },  
                  commit: 'UPDATE_DIVISION',
                  url: this.partserver + '/setdeldivision'
                }
              this.$store.dispatch('materiallist/http_request', senddata );
          }
      },
      oncolor_change: function(data) {
        var fontc = "#000000"
         if (data.color !="") {
           fontc = "#ffffff"
         }
        this.partinfo.division[data.id].bgcolor = data.color;
        this.partinfo.division[data.id].textcolor = fontc;
      },
      getuseplan: function(info){
         var self = this;
        let promise = axios.get(this.partserver + '/getuseplan?partid='+info.partid+"&month="+info.month)  
        return promise.then((result) => {
            self.uselist = result.data;
        }).catch(error => {
            console.log("error " + error) 
        }) 
      },
      getstocklist: function(info){
         var self = this;
        let promise = axios.get(this.partserver + '/getstocklist?partid='+info.partid+"&month="+info.month)  
        return promise.then((result) => {
            self.stocklist = result.data;
        }).catch(error => {
            console.log("error " + error) 
        })
      },
      onDelete: function(){
        this.$emit('delete', this.partinfo._id);
      },
      getnewid: function(info){
        var self = this;
        if(window.confirm('IDを取得しますか？')){
         var self = this;
        let promise = axios.get(this.partserver + '/getnewpartid?partid=')  
        return promise.then((result) => {

            self.partinfo = _.cloneDeep(self.items)

            self.partinfo.partid = result.data.partid;
            self.partinfo._id = self.partinfo.month + "-" + result.data.partid;
            self.partinfo.partname = [];
            self.partinfo.carryover = 0;
            self.partinfo.arrival = 0;
            self.partinfo.break = 0;
            self.partinfo.invent = 0;
            self.partinfo.useplan = 0;
            self.partinfo.usepart = 0;
            self.stocklist = [];
            self.uselist = [];
            self.newpart = true;
        }).catch(error => {
            console.log("error " + error) 
        })
        }
        else{
          window.alert('キャンセルされました'); // 警告ダイアログを表示
        }
      },
      ondeletelist() {
        var self = this;
        var ret = []; 
        for (var i in self.partinfo.partname) {
          if (self.partinfo.partname[i]._id != self.selected) {
            ret.push(self.partinfo.partname[i]);        
          }
         }
         self.partinfo.partname = ret;
      },
      onaddlist() {
        var self = this;
        var txt = window.prompt("追加する部品名を入力してください", "");

       // 入力内容が tama の場合は example_tama.html にジャンプ
        if(txt != '' && txt != null){
          var ret = []; 
          var row = {
            partid : self.partinfo.partid, 
            _id : self.partinfo.partid + "-" + make_id(), 
            partname : txt, 
           } 
           self.partinfo.partname.push(row);        
        }
      },
      column(rec) {
        var ret = { bgColor: "white", color: "#000", textAlign: "left"};
        return ret
        },
      column_num(rec) {
        var ret = { bgColor: "white", color: "#000", textAlign: "right"};
        return ret
      },
      onModeName(rec) {
        var ret = "";
        if (rec.mode==0){
          ret = "部品繰越";
        } else if (rec.mode==1){
          ret = "部品入庫";
        } else if (rec.mode==2){
          ret = "部品消費";
        } else if (rec.mode==5){
          ret = "部品棚卸";
        }
        return ret
      },
      onChangeValue: function(param){
        this.$emit("taskupdate", this.records);
      }
    }
  }
/*
{
    "_id" : "B10",
    "quantity" : 1,
    "modelname" : "R9U2AV715101",
    "customerid" : 24,
    "modelid" : 10,
    "__v" : 0,
    "group" : "実装"
}
*/  


</script>

<style scoped>
 .titles2 {
    background-color: mediumseagreen;
 }

 .closebutton {
    background-color: mediumseagreen;
    border: 1px solid #ffffff;
 }

 .title {
    background-color: chocolate;
 }
 .labels {
    width: 200px;
}
</style>