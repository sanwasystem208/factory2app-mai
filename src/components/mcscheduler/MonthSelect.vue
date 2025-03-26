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
//共通関数//
import date_func from '../../api/date_func'
const { 
  toDoubleDigits,
  onCurrentMonth,
  formatDay,
  getMonth_Day,
  addMonthStr,
  monthoption
  } = date_func();

export default {
  props: [],
  data () {
    return {
      options: monthoption(),
      month: addMonthStr(0)
    }
  },
  watch: {
    month: function(val) {
      if (val == null) {  
        this.$emit("update", this.split_month(this.month));   
      } else {
        this.$emit("update", this.split_month(this.month));   
      }   
    },
  },
  created() {
  },
  mounted() {
     this.$emit("update", this.split_month(this.month)); 
  },  
  methods: {
    split_month(s) {
      var y = s.substr( 0, 4 );
      var m = s.substr( 4, 2 );
      var last = formatDay(new Date(y, m, 0));
      var start = formatDay(new Date(y, parseInt(m)-1,1));
      return { startday: start, lastday: last, month: y + "-" + m }
    } 
  }
}

/*
function addDay(date1) {
 //  date1.setDate(date1.getDate() + 0);
    // Date型を（YYYY/MM/DD）形式へ成型して返却
   var year = date1.getFullYear(); // 年
   var month = toDoubleDigits(date1.getMonth() + 1); // 月
   var day = toDoubleDigits(date1.getDate()); // 日

   return  year + "-" + month + "-" + day; 
}   */

</script>