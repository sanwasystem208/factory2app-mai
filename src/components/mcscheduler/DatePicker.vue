<template>
  <datepicker 
      v-model="date" 
      name="uniquename" 
      :format="customFormatter"
      :language="ja"
      :input-class="$style.inclass"
      :calendarClass="inclass"
      >
  </datepicker>
</template>


<script>
import Vue from 'vue';
import Datepicker from 'vuejs-datepicker';
import moment from 'moment';

export default {
  props: [ "value"],
  data () {
    return {
         date: this.value,
         btnDisable: true
      } 
  },  
  components: {
    Datepicker
  },
  watch: {
    selectcount: function(val) {
      if (val ==0 ) {
        this.btnDisable = true;
      } else {
        this.btnDisable = false;
      }
    },
    date: function (val) {
      this.$emit('update-row', this.customFormatter(this.date));
    }
  },
  methods: {
    customFormatter(date) {
      return moment(date).format('YYYY-MM-DD');
    },
    update_row: function() {
      this.$emit('update-row', this.date);
   }
  }   
}
</script>

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
