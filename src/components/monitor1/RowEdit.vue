<template>
    <b-container fluid>
      <!-- User Interface controls -->
      <b-row class="h-8 titles">
        <b-col class="col-11 p-0">
          <h5 class="m-2" style="color:white">計画追加</h5>
        </b-col>
        <b-col class="col-1 p-0">
          <b-button class="bg-danger float-right m-1" size="sm" @click="onclose">閉じる</b-button>
        </b-col>
      </b-row>
      <b-row class="h-20">
          <b-col class="col-3 mt-1 ml-2 p-0">
                <label>号機:</label>
          </b-col>  
          <b-col class="col-8 mt-1 ml-1 p-0">
                <b-form-input id="gouki" type="text" v-model="ret._id" placeholder="" class="m-1"></b-form-input>
          </b-col>  
      </b-row>
      <b-row class="h-20">
          <b-col class="col-3 mt-1 ml-2 p-0">
                <label>製品:</label>
          </b-col>  
          <b-col class="col-8 mt-1 ml-1 p-0">
                <b-form-input id="model" type="text" v-model="ret.modelname" placeholder="" class="m-1"></b-form-input>
          </b-col>  
      </b-row>
      <b-row class="h-20">
        <b-col class="col-3 m-1 p-0">
            <label class="m-1">作業日:</label>
        </b-col>
        <b-col class="col-8 m-1 p-0">
            <b-form-select v-model="ret.status" :options="status" class="m-1"></b-form-select>
        </b-col>
      </b-row>
      <b-row class="h-80">
        <b-col class="col-3 m-1 p-0">
            <label class="m-1">レベル:</label>
        </b-col>
        <b-col class="col-8 m-1 p-0">
              <b-form-radio-group
                id="radio-group-1"
                v-model="ret.importance"
                :options="importance"
                name="radio-options"
                class="m-0"
              ></b-form-radio-group>
        </b-col>
      </b-row>
      <b-row class="h-12">
        <b-col class=" col-12 my-1 mt-5">  
          <b-button class="m-1 bg-primary" size="sm" variant="primary" @click="onReturn">決定</b-button>
        </b-col>  
      </b-row>
</b-container>
</template>

<script>

import Vue from "vue";
import Bootstrap from 'bootstrap';
import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue);

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham-dark.css";

import Datepicker from 'vuejs-datepicker';
import { mapState } from 'vuex';
import moment from 'moment';

export default {
  name: 'Modal2',
  props: ["items"],
  data() {
    return {
        selected: null,
        processno: 0,
        ret: null
    }
  },
  watch: {
    ret: function(val) {
      console.log("watch:" +JSON.stringify(val));
    }
  },
  methods: {
    onReturn: function() {
       // var dia = confirm("更新しますか？");
       // if (dia == true){
          this.$emit("onUpdate", this.ret);
       // }
    },
    pickerClosed() {
      if(this.ret.workday){
        this.ret.workday = moment(this.ret.workday).format('YYYY-MM-DD');
      }
    },
    customFormatter(date) {
        return moment(date).format('YYYY-MM-DD');
    },
    onclose() {
      this.$emit('close');
    }

  },
  computed: {
     ...mapState({
        status: 'status',
        types: 'types',
        importance: 'importance'

     })
  },
  components: {
        Datepicker
  },
  created() {
    this.ret = this.items;
  },
  mounted() {
    this.ret = this.items;
  },

};

var toDoubleDigits = function(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
 return num;     
};

function getDay2(str,i) {
  var date1 = new Date(str);
  date1.setDate(date1.getDate() + i);  
//   var off = weekday_offset(date1)  
//   date1.setDays(date1.getDays() + off); 
  // Date型を（YYYY/MM/DD）形式へ成型して返却
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  var hour = toDoubleDigits(date1.getHours()); // 時
  var min = toDoubleDigits(date1.getMinutes()); // 分
  var sec = toDoubleDigits(date1.getSeconds()); // 秒   
  return  year + "-" + month + "-" + day; 
}

function getDay3(str) {
  var date1 = new Date(str); 
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  var hour = toDoubleDigits(date1.getHours()); // 時
  var min = toDoubleDigits(date1.getMinutes()); // 分
  var sec = toDoubleDigits(date1.getSeconds()); // 秒   
  return  year + month + day + hour + min + sec; 
}

function isUndefined(val,d) {
  if ( val == undefined ) {
    return d
  } else {
    return val
  }
}

</script>

<style scoped>
.grid-cell {
  font-size: 16px;
}

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 600px;
  margin: 0px auto;
  padding: 3px 3px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 5px 0;
}

.modal-default-button {
  float: right;
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

.inputwidth {

}
</style>

<style module> 

  .inclass {
    width: 120px;
    font-size: 14px;
    padding: 3px 0 3px 0;
    border: 1px solid #bebebe;	/* 境界線を実線で指定 */
    border-radius: 3px;
    text-align: center;
  }

</style>
