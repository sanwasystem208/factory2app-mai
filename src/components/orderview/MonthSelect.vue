<template>
  <b-form inline>
    <label class="mr-sm-2" for="inline-form-custom-select-pref">月度：</label>
    <b-form-select
      class="mb-1 mr-sm-2 mb-sm-0"
      v-model="outdata.month"
      :options="options"
      @change="handleSelectChanged"
      id="inline-form-custom-select-pref"
    >
    </b-form-select>
  </b-form>
</template>

<script>

//共通関数//
import date_func from '../../api/date_func'
const { 
  toDoubleDigits,
  onCurrentMonth
 } = date_func();

export default {
  props: [],
  data () {
    return {
      selected: 0,
      btnDisable: true,
      options: monthoption(),
      month: onCurrentMonth(),
      outdata: {
        month: null,
        startday: null,
        lastday: null
      }
    }
  },
  watch: {
    month: function(val) {
      if (val != null) {
        this.$emit("update", this.month);
      }  
    },
  /*  selected: function(val) {
      this.$emit('childs-event', val);  
    }*/
  },
  mounted() {
     this.outdata.month = this.month;
     this.outdata.startday = addMonthStr(this.month + "-01");
     this.outdata.lastday = addMonthLast(this.month + "-01");       
     this.$emit("update", this.outdata); 
  },  
  methods: {
    handleSelectChanged: function() {
     this.outdata.startday = addMonthStr(this.outdata.month + "-01");
     this.outdata.lastday = addMonthLast(this.outdata.month + "-01");       
     this.$emit("update", this.outdata);   
    }
  }
}

function addMonthStr(m) {
   var date1 = new Date(m);
    // Date型を（YYYY/MM/DD）形式へ成型して返却
   console.log("month:" + date1)
   var year = date1.getFullYear(); // 年
   var month = toDoubleDigits(date1.getMonth() + 1); // 月
   var day = toDoubleDigits(date1.getDate()); // 日

     return  year + "-" + month + "-" + day;  

}

function addMonthLast(m) {
   var dt = new Date(m);
   var date1 = new Date(dt.getFullYear(), dt.getMonth() + 1, 0); 
    // Date型を（YYYY/MM/DD）形式へ成型して返却

   var year = date1.getFullYear(); // 年
   var month = toDoubleDigits(date1.getMonth() + 1); // 月
   var day = toDoubleDigits(date1.getDate()); // 日
 //  if (month != "00") {
     return  year + "-" + month + "-" + day; 
}


function addYearStr(m) {
   var date1 = new Date();
   date1.setFullYear(date1.getFullYear() + m); 
   var year = date1.getFullYear(); // 年
     return  year; 
}

function monthoption() {
    var mt = [];
    var ystart = addYearStr(-1)
    var yend = addYearStr(1)

    for (var i = ystart; i <= yend ; i++) { //年のループ
      for(var m_i=1;m_i<=12;m_i++){ //月のループ
         var temp = "" + i + "-" + toDoubleDigits(m_i);
         mt.push({ value: temp, text: temp })        
      }
    }
   return mt;
}

function addDay(date1) {
 //  date1.setDate(date1.getDate() + 0);
    // Date型を（YYYY/MM/DD）形式へ成型して返却
   var year = date1.getFullYear(); // 年
   var month = toDoubleDigits(date1.getMonth() + 1); // 月
   var day = toDoubleDigits(date1.getDate()); // 日

   return  year + "-" + month + "-" + day; 
}  


</script>