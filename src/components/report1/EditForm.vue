<template>
    <b-container fluid  class="p-0 m-0">
      <b-row class="h-8 titles2">
        <b-col class="col-xl-10">
          <h5 class="m-1" style="color:white">作業日:  {{ plan.daystr }} </h5>
        </b-col>
        <b-col class="col-xl-2">
          <b-button class="bg-dark float-right m-1" size="sm" @click="onclose">閉じる</b-button>
        </b-col>
      </b-row>
      <b-row class="h-9 m-1">
        <b-col class="col-xl-2">
            <h6 class="mt-2">号機名</h6>
        </b-col>
        <b-col class="col-xl-10">
            <b-form-select
              class="m-0"
              v-model="machine"
              :options="mclist"
              id="inline-form-custom-select-pref"
              @change="onModelGet"
            >
            </b-form-select>
        </b-col>
      </b-row>  
      <b-row class="h-10 m-1">
        <b-col class="col-xl-2">
            <h6 class="mt-2">生産No</h6>
        </b-col>
        <b-col class="col-xl-10">
           <b-form-input ref="productno" id="productno" type="text" v-model="plan.productno" class="m-0" autocomplete="off"></b-form-input>
        </b-col>
      </b-row>
      <b-row class="h-9 m-1">
        <b-col class="col-xl-2">
            <h6 class="mt-2">製品No</h6>
        </b-col>
        <b-col class="col-xl-10">
           <b-form-input ref="modelno" id="modelno" type="number" v-model="plan.modelno" class="m-0" autocomplete="off"></b-form-input>
        </b-col>
      </b-row>  
      <b-row class="h-9 m-1">
        <b-col class="col-xl-2">
            <h6 class="mt-2">機種名</h6>
        </b-col>
        <b-col class="col-xl-10">
            <b-form-select
              class="m-0"
              v-model="model"
              :options="models"
              id="inline-form-custom-select-pref"
            >
            </b-form-select>
        </b-col>
      </b-row>    
      <b-row class="h-9 m-1">
        <b-col class="col-xl-3">
            <h6 class="mt-2">開始時刻</h6>
        </b-col>
        <b-col class="col-xl-3">
               <vue-timepicker :minute-interval="5" format="HH:mm" v-model="starttime" auto-scroll></vue-timepicker>
        </b-col>
        <b-col class="col-xl-3">
            <h6 class="mt-2">終了時刻</h6>
        </b-col>
        <b-col class="col-xl-3">
               <vue-timepicker :minute-interval="5" format="HH:mm" v-model="lasttime" auto-scroll></vue-timepicker>
        </b-col>
      </b-row> 
      <b-row class="h-9 m-1">
        <b-col class="col-xl-">
            <h6 class="mt-2">ロット数量</h6>
        </b-col>
        <b-col class="col-xl-10">
            <b-form-input ref="plancount" id="plancount" type="number" v-model="plan.plancount" class="m-0" autocomplete="off"></b-form-input>
        </b-col>
      </b-row> 
      <b-row class="h-9 m-1">
        <b-col class="col-xl-2">
            <h6 class="mt-2">実績数量</h6>
        </b-col>
        <b-col class="col-xl-10">
            <b-form-input ref="productcount" id="productcount" type="number" v-model="plan.productcount" class="m-0" autocomplete="off"></b-form-input>
        </b-col>
      </b-row>
      <b-row class="h-9 m-0">
        <b-col class="col-xl-2">
            <h6 class="mt-2">優先順位</h6>
        </b-col>
        <b-col class="col-xl-9">
            <b-form-radio-group
                id="rank-group-1"
                class="m-1"
                v-model="plan.rank"
                :options="importance"
                name="rank-options"
              ></b-form-radio-group>
        </b-col>
      </b-row> 
      <b-row class="h-9 m-1">
        <b-col class="col-xl-2">
            <h6 class="mt-2">備考</h6>
        </b-col>
        <b-col class="col-xl-10">
          <b-form-textarea
            id="textarea"
            v-model="plan.comment"
            placeholder=""
            rows="3"
            max-rows="6"
          ></b-form-textarea>
        </b-col>
      </b-row> 
      <b-row class="h-10 m-1">
        <b-col class="col-xl-12">
             <b-button class="bg-success float-left m-1" size="sm" @click="read_qrcode">ＱＲ</b-button>
             <b-button class="bg-primary float-left m-1" size="sm" @click="update_plan" v-bind:disabled="plan.start >= plan.last || model == 0 || machine== null">保存</b-button>
             <b-button class="bg-danger float-left m-1" size="sm" @click="delete_plan">削除</b-button>
        </b-col>
      </b-row> 
    </b-container>
</template>

<script>
/*            <b-form-select
              class="m-0"
              v-model="model"
              :options="models"
              id="inline-form-custom-select-pref"
            >
            </b-form-select>*/
/*<date-time class="mt-2 ml-0 mr-2" :items="start" zone="start"></date-time>*/
import Vue from "vue";
import axios from "axios";
import moment from "moment";

import { mapState } from 'vuex';

import DateTime from './DateTime.vue';

import VueTimepicker from 'vue2-timepicker';
import 'vue2-timepicker/dist/VueTimepicker.css';

export default {
  props: ["items"],
  components: {
     'date-time': DateTime,
     'vue-timepicker': VueTimepicker
  },
  data: function() {
    return {
    //  filename: this.info.model_name,
      plan: {},
      model: 0,
      models: [],
      machine: "",
      start: null,
      last: null,
      daystr: "2021-09-11",
      starttime: "08:30",
      lasttime: "17:30",
      machines: [],
    }
  },
  computed: {
    //共通変数
      ...mapState({
        times: 'times',
        ranklist: 'ranklist',
        reportserver: 'reportserver',
        shifttime: 'shifttime',
        importance: 'importance'
      }),
      mclist: function() {
        var list = [];
        for (var i in this.machines) {
          list.push({value: this.machines[i].mcname, text: this.machines[i].mcname})
        }
        return list;
      }
  },    
  watch: {
    machine: function(val) {
      this.plan.machine = val;
      this.onModelGet(val)
    },
    starttime: function(val) {
      if (val >="00:00" && val < this.shifttime[0].start) {
        this.plan.start = getDay(this.plan.daystr,1) + " " + val;
      } else {
        this.plan.start = this.plan.daystr + " " + val;    
      }
      console.log(this.plan.start);
    },
    lasttime: function(val) {
      if (val >="00:00" && val < this.shifttime[0].start) {
        this.plan.last = getDay(this.plan.daystr,1) + " " + val;
      } else {
        this.plan.last = this.plan.daystr + " " + val;    
      }
      console.log(this.plan.last);
    }
  },
  methods: {
    read_qrcode: function() {
        var user = window.prompt("生産NO付きQRコードを入力してください", "");
        if(user != "" && user != null){
          var productno = user.substr(0,8);
          var lotno = user.substr(8,4);
          var modelno = user.substr(12,8);
          var qty = user.substr(21,7);
          this.plan.productno = productno;
          this.plan.lotno = lotno;
          this.plan.modelno = modelno;
          this.plan.plancount = qty;
          this.onModelGet2(this.plan.modelno);
        }
        else{
          window.alert('キャンセルされました');
        } 
    },
    onclose: function() {
      this.$emit('onclose', "");
    },
    onMclGet: function(val) {
        var self = this;
        this.machines = [];
          var url = "/getmclist2";
          var senddata = {
              params: {
                retdata: null
              } 
          }    
          let promise = axios.get( this.reportserver + url, senddata)  
          return promise.then(this.getmclist)
            .catch(error => {
                console.log("error " + error) 
          }) 
    },
    getmclist: function(data) {
       this.machines = data.data.retdata;
    },
    onModelGet: function(val) {
        var self = this;
        this.models = [];
     //   this.plan.machine = val;
     /*   var newLines = self.machines.filter(function(item, index){
          if (item.value == val) return true;
        });*/
     //   if (newLines.length > 0) {
       //   this.plan.machine = newLines[0];
          var mc = val.substr(0,2);
          var url = "/getmodellist";
          var senddata = {
              params: {
                mc: mc,  
                retdata: null
              } 
          }    
          let promise = axios.get( this.reportserver + url, senddata)  
          return promise.then(this.getmodellist)
            .catch(error => {
                console.log("error " + error) 
          }) 
     //   }
    },
    onModelGet2: function(val) {
        var self = this;
        var url = "/getmodelname";
        var senddata = {
            params: {
              modelno: val,  
              retdata: null
            } 
        }    
        let promise = axios.get( this.reportserver + url, senddata)  
        return promise.then(this.getmodelname)
          .catch(error => {
              console.log("error " + error) 
        }) 
    },
    getmodellist: function(data) {
       this.models = data.data.retdata;
    },
    getmodelname: function(data) {
       this.plan.modelname = data.data.retdata;
    },
    update_plan: function() {
      var self = this;
      this.$dialog
      .confirm({
        title: '登録確認',
        body: '登録してもよろしいですか？'
      },{
        okText: 'はい',
        cancelText: 'キャンセル',
      })
      .then(function() {
        var newLines = self.models.filter(function(item, index){
          if (item.value == self.model) return true;
        });
        self.plan.model = newLines[0];
        self.$emit("onupdate",self.plan);
      })
      .catch(function() {
        console.log('実行はキャンセルされました');
      });

    },
    delete_plan: function() {
      var self = this;
      this.$dialog
      .confirm({
        title: '削除確認',
        body: '削除してもよろしいですか？'
      },{
        okText: 'はい',
        cancelText: 'キャンセル',
      })
      .then(function() {
      /*  var newLines = self.models.filter(function(item, index){
          if (item.value == self.model) return true;
        });
        self.plan.model = newLines[0];*/
        self.$emit("ondelete",self.plan);
      })
      .catch(function() {
        console.log('実行はキャンセルされました');
      });

    }
  },
  mounted() {
    this.plan = this.items;
    this.machine = this.plan.machine;
    this.model = this.plan.model.value;
    this.starttime = gettime(this.plan.start);
    this.lasttime = gettime(this.plan.last);
    this.onMclGet();
    this.onModelGet(this.machine)
  },
  beforeMount() {
  }   
};

function gettime(val) {
   var tmp = val.split(" "); 
   return tmp[1]; 

}

var toDoubleDigits = function(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
  return num;     
};

function addDaystr() {
        var date1 = new Date();

        // Date型を（YYYY/MM/DD）形式へ成型して返却
        var year = date1.getFullYear(); // 年
        var month = toDoubleDigits(date1.getMonth() + 1); // 月
        var day = toDoubleDigits(date1.getDate()); // 日
        var hour = toDoubleDigits(date1.getHours()); // 時
        var min = toDoubleDigits(date1.getMinutes()); // 分
        var sec = toDoubleDigits(date1.getSeconds()); // 秒 

        return  year + month + day + hour + min + sec; 

}

function getDay(str,i) {
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
</script>

<style scoped>

.titles2 {
    background-color: mediumseagreen;
}

.timeinput {
  width: 100px;
}

</style>
