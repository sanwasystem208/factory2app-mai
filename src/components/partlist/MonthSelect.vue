<template>
  <b-form inline>
    <label class="mr-sm-2" for="inline-form-custom-select-pref">月度：</label>
    <b-form-select
      class="mb-2 mr-sm-2 mb-sm-0"
      v-model="month"
      :options="options"
      id="inline-form-custom-select-pref"
    >
    </b-form-select>
  </b-form>
</template>

<script>
import axios from "axios";

export default {
  props: [
  ],
  data () {
    return {
      selected: 0,
      btnDisable: true,
      options: monthoption(),
      month: addMonthStr(0)
    }
  },
  watch: {
    month: function(val) {
      if (val == null) {
        this.month = addMonthStr(0);   
        this.$emit("update", this.split_month(this.month));   
      } else {
        this.$emit("update", this.split_month(this.month));   
      }   
    },
  /*  selected: function(val) {
      this.$emit('childs-event', val);  
    }*/
  },
  mounted() {
     this.$emit("update", this.split_month(this.month)); 
  },  
  methods: {
    split_month(s) {
      var y = s.substr( 0, 4 );
      var m = s.substr( 4, 2 );
      var last = addDay(new Date(y, m, 0));
      var start = addDay(new Date(y, parseInt(m)-1,1));
      return { startday: start, lastday: last, month: s }
    } 
  }
}

var toDoubleDigits = function(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
 return num;     
};

function addMonthStr(m) {
   var date1 = new Date();

    // Date型を（YYYY/MM/DD）形式へ成型して返却
   date1.setMonth(date1.getMonth() + m); 
   console.log("month:" + date1)
   var year = date1.getFullYear(); // 年
   var month = toDoubleDigits(date1.getMonth() + 1); // 月
 //  if (month != "00") {
     return  year + month; 
 //  } else {
 //    return  null; 
 //  }

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
         var temp = "" + i + toDoubleDigits(m_i);
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