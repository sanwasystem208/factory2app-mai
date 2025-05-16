<template>
    <b-container fluid  class="p-0 m-0">
      <b-row>
        <b-col class="col-xl-2 m-0 p-0">
            <select v-model="month" class="select pl-2 pr-2">
                 <option v-for="option in months" v-bind:value="option.value">
                    {{ option.text }}
                 </option>
            </select>
        </b-col>
        <b-col class="col-xl-1 m-0 p-0">
            <label class="mt-1">月</label>
        </b-col>
        <b-col class="col-xl-2 m-0 p-0">
            <select v-model="day" class="select pl-2 pr-2">
                 <option v-for="option in days" v-bind:value="option.value">
                    {{ option.text }}
                 </option>
            </select>
        </b-col>
        <b-col class="col-xl-1 m-0 p-0">
            <label class="mt-1">日</label>
        </b-col>
        <b-col class="col-xl-2 m-0 p-0">
            <select v-model="hour" class="select pl-2 pr-2">
                 <option v-for="option in hours" v-bind:value="option.value">
                    {{ option.text }}
                 </option>
            </select>
        </b-col>
        <b-col class="col-xl-1 m-0 p-0">
            <label class="mt-1">時</label>
        </b-col>
        <b-col class="col-xl-2 m-0 p-0">
            <select v-model="min" class="select pl-2 pr-2">
                 <option v-for="option in mins" v-bind:value="option.value">
                    {{ option.text }}
                 </option>
            </select>
        </b-col>
        <b-col class="col-xl-1 m-0 p-0">
            <label class="mt-1">分</label> 
        </b-col>
      </b-row>

    </b-container>
</template>

<script>
import Vue from "vue";
import axios from "axios";
import moment from "moment";

import { mapState } from 'vuex'

export default {
  props: ["items", "zone"],
  components: {
  },
  data: function() {
    return {
      years: [
        { value:21, text: "21"},
        { value:22, text: "22"},
        { value:23, text: "23"},
        { value:24, text: "24"}
      ],
      year: null,
      months: [
        { value:1, text: "01"},
        { value:2, text: "02"},
        { value:3, text: "03"},
        { value:4, text: "04"},
        { value:5, text: "05"},
        { value:6, text: "06"},
        { value:7, text: "07"},
        { value:8, text: "08"},
        { value:9, text: "09"},
        { value:10, text: "10"},
        { value:11, text: "11"},
        { value:12, text: "12"}
      ],
      month: null,
      days: [
        { value:1, text: "01"},
        { value:2, text: "02"},
        { value:3, text: "03"},
        { value:4, text: "04"},
        { value:5, text: "05"},
        { value:6, text: "06"},
        { value:7, text: "07"},
        { value:8, text: "08"},
        { value:9, text: "09"},
        { value:10, text: "10"},
        { value:11, text: "11"},
        { value:12, text: "12"},
        { value:13, text: "13"},
        { value:14, text: "14"},
        { value:15, text: "15"},
        { value:16, text: "16"},
        { value:17, text: "17"},
        { value:18, text: "18"},
        { value:19, text: "19"},
        { value:20, text: "20"},
        { value:21, text: "21"},
        { value:22, text: "22"},
        { value:23, text: "23"},
        { value:24, text: "24"},
        { value:25, text: "25"},
        { value:26, text: "26"},
        { value:27, text: "27"},
        { value:28, text: "28"},
        { value:29, text: "29"},
        { value:30, text: "30"},
        { value:31, text: "31"}
      ],
      day: null,
      hours: [
        { value:0, text: "00"},
        { value:1, text: "01"},
        { value:2, text: "02"},
        { value:3, text: "03"},
        { value:4, text: "04"},
        { value:5, text: "05"},
        { value:6, text: "06"},
        { value:7, text: "07"},
        { value:8, text: "08"},
        { value:9, text: "09"},
        { value:10, text: "10"},
        { value:11, text: "11"},
        { value:12, text: "12"},
        { value:13, text: "13"},
        { value:14, text: "14"},
        { value:15, text: "15"},
        { value:16, text: "16"},
        { value:17, text: "17"},
        { value:18, text: "18"},
        { value:19, text: "19"},
        { value:20, text: "20"},
        { value:21, text: "21"},
        { value:22, text: "22"},
        { value:23, text: "23"}
      ],
      hour: null,
      mins: [
        { value:0, text: "00"},
        { value:10, text: "10"},
        { value:20, text: "20"},
        { value:30, text: "30"},
        { value:40, text: "40"},
        { value:50, text: "50"},
      ],
      min: null,
    }
  },
  computed: {
    //共通変数
  },    
  watch: {
    items: function(val) { 
      this.time_update(val);
    },
    month: function(val) {
       this.onupdate();
    },
    day: function(val) {
       this.onupdate();
    },
    hour: function(val) {
       this.onupdate();
    },
    min: function(val) {
       this.onupdate();
    }
  },
  methods: {
    onupdate: function() {
      var str = "";
      str = toDoubleDigits(this.year) + "-" + toDoubleDigits(this.month) + "-" + toDoubleDigits(this.day) + " " + toDoubleDigits(this.hour) + ":" + toDoubleDigits(this.min);
    //  this.emit("update", str)
      if (this.zone=="start") {  
        this.$parent.plan.start = str;
      } else {
        this.$parent.plan.last= str;  
      }
    },
    time_update: function(temp) {
      if (temp != null) {
        this.year = parseInt(temp.substr(0,4));
        this.month = parseInt(temp.substr(5,2));
        this.day = parseInt(temp.substr(8,2)); 
        this.hour = parseInt(temp.substr(11,2));
        this.min = parseInt(temp.substr(14,2));   
      } else  {
        this.year = gedatetime(0);
        this.month = gedatetime(1);
        this.day = gedatetime(2);  
        if (this.zone=="start") { 
          this.hour = 8;
          this.min = 30;  
        } else {
          this.hour = 17;
          this.min = 30;  
        }        
    }
  },
  mounted() {
    //if (this.times != undefined) {

     }
  },
  beforeMount() {
  }   
};

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

function gedatetime(val) {
        var date1 = new Date();

        // Date型を（YYYY/MM/DD）形式へ成型して返却
        var year = date1.getFullYear(); // 年
        var month = parseInt(date1.getMonth() + 1); // 月
        var day = parseInt(date1.getDate()); // 日
        var hour = parseInt(date1.getHours()); // 時
        var min = parseInt(date1.getMinutes()); // 分

        switch ( val) {
          case 0:
            return year;
            break;
          case 1:
            return month;
            break;
          case 2:
            return day
            break;
          case 3:
            return hour;
            break;
          case 4:
            return min;
            break;
        } 

}

</script>

<style scoped>

.titles2 {
    background-color: mediumseagreen;
}

.timeinput {
  width: 100px;
}

.select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: 0;
  font-size: 1.3em;
}
</style>
