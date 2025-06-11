<template>
   <b-container fluid>
    <b-row class="h-90">
        <b-col cols="12" class="p-2">
          <div :style="styles">
            <c-grid :data="records" :frozen-col-count="2" :theme="userTheme" :defaultRowHeight="50">
              <c-grid-check-column field="check" width="5%" @changed-value="onChangedCheck($event)">選択</c-grid-check-column> 
              <c-grid-menu-column field="optionid" width="30%" min-width="0" sort="true" :options="options" @changed-value="onChangedOption($event)">オプション名</c-grid-menu-column>
              <c-grid-input-column field="url" width= "20%" :column-style='column_num' min-width="0" sort="true">情報</c-grid-input-column>
              <c-grid-button-column caption="部品編集" width="120" @click="onClickRecord">Button2</c-grid-button-column> 
              <c-grid-input-column field="col1" width= "5%" :column-style='column_num' min-width="0" sort="true">1</c-grid-input-column>
              <c-grid-input-column field="col2" width= "5%" :column-style='column_num' min-width="0" sort="true">2</c-grid-input-column>
              <c-grid-input-column :field="onData" width= "5%" :column-style='column_num' min-width="0" sort="true">3</c-grid-input-column>           
            </c-grid>
          </div>
          <div class="option-grid"></div>
        </b-col>
     </b-row>
  </b-container> 
</template>

<script>
import axios from "axios";
import Decimal from 'decimal.js';

import { mapState } from 'vuex'
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
    formatStartDay,
    month_startday
  } = date_func();

export default {
  name: 'DEMO',
  components: {
  },
  data () {
    return {
      records: [{ check: false, optionid: 0, url: "https://www.bing.com/", col1: 1, col2: 3},
                { check: true, optionid: 1, url: "https://www.yahoo.co.jp/", col1: 10, col2: 3}
               ],
      options: [
        { value: 0, label: "bing"},
        { value: 1, label: "yahoo"},
      ],
      styles: "height: 37vh; border: solid 1px #545454;",
      themas : {
        headercolor: 'indigo darken-3',
        gridtheme: {
          color: "#2c3e50",
          font: "normal normal normal 14px/1 FontAwesome",
        // frozenRowsColor: "#fff",
        // frozenRowsBgColor: "#2196F3",
          borderColor: "#35495e",
          frozenRowsBorderColor:"#BDBDBD",  
          frozenRowsBgColor: "#40b883",
          frozenRowsColor: "white",
          checkbox: {
            checkBgColor: "#35495e",
            borderColor: "#35495e",
          },
          button: {               
              color: "#fff",
              bgColor: "#20c997",//"#32cd32",
              padding: "16px",
              font: "normal normal normal 10px/1 FontAwesome"
          }   
        }, 
      }
    }
  },
  computed: { 
  },
  watch: {
  },
  mounted () {
   // this.records = this.data_make();
  },
  created () {

  },
  methods: {
    onData: function(row){
      return row.col1 * row.col2
    },
    data_make: function() {
      var ret = [];
      ret.push({ check: false, optionid: 0, url: "https://www.bing.com/"});
      ret.push({ check: true, optionid: 1, url: "https://www.yahoo.co.jp/"});   
      return ret;
    },
    onChangedCheck: function(e) {
      console.log(e)
    },
    onChangedOption: function(e) {
      console.log(e)
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
        frozenRowsBgColor: "#2196F3",
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
    column(rec) {
      var ret = null;
      ret = { bgColor: "silver", color: "#000", textAlign: "left"};
      return ret
    },
    column_num(rec) {
      var ret = null;
      ret = { bgColor: "white", color: "#000", textAlign: "right"};
      return ret
    },
    onClickRecord: function(e) {
      console.log(e)
    },
  }
}
</script>
<style>

</style>
