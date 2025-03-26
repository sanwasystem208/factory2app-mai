<template>
    <b-container fluid  class="p-0 m-0">
      <b-row class="h-8 titles2">
        <b-col class="col-xl-10">
        </b-col>
        <b-col class="col-xl-2">
          <b-button class="bg-dark float-right m-1" size="sm" @click="onclose">閉じる</b-button>
        </b-col>
      </b-row>
      <b-row class="m-1">
        <b-col class="col-xl-3">
            <h6 class="mt-2">機械No</h6>
        </b-col>
        <b-col class="col-xl-9">
           <b-form-input ref="machinename" id="machinename" type="text" v-model="task.machinename" class="m-0" autocomplete="off"></b-form-input>
        </b-col>
      </b-row>
      <b-row class="m-1">
        <b-col class="col-xl-3">
            <h6 class="mt-2">時間</h6>
        </b-col>
        <b-col class="col-xl-9">
           <b-form-input ref="timestr" id="timestr" type="text" v-model="task.timestr" class="m-0" autocomplete="off"></b-form-input> 
        </b-col>
      </b-row>
      <b-row class="m-1">
        <b-col class="col-xl-3">
            <h6 class="mt-2">ロットNo</h6>
        </b-col>
        <b-col class="col-xl-9">
           <b-form-input ref="lotno2" id="lotno2" type="number" v-model="task.lotno2" class="m-0" autocomplete="off"></b-form-input>
        </b-col>
      </b-row>  
      <b-row class="m-1">
        <b-col class="col-xl-3">
            <h6 class="mt-2">作業者</h6>
        </b-col>
        <b-col class="col-xl-9">
           <b-form-input ref="workername" id="workername" type="text" v-model="task.workername" class="m-0" autocomplete="off"></b-form-input>
        </b-col>
      </b-row>  
      <b-row class="m-1">
        <b-col class="col-xl-12">
             <b-button class="bg-danger float-left m-1" size="sm" @click="delete_task">削除</b-button>
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
      task: {},
    }
  },
  computed: {
    //共通変数
      ...mapState({
        machines: 'machines',
        times: 'times',
        ranklist: 'ranklist',
        reportserver: 'reportserver',
        shifttime: 'shifttime',
        importance: 'importance'
      })
  },    
  watch: {
  },
  methods: {
    onclose: function() {
      this.$emit('onclose', "");
    },
    delete_task: function(){
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
        self.$emit('onclose', "");
        self.$emit('ondelete', self.task);
      })
      .catch(function() {
        console.log('実行はキャンセルされました');
      });
    }
  },
  mounted() {
    this.task = this.items;
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
