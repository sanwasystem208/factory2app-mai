<template>
  <div>
    <div style="height: 55vh; border: solid 1px #545454;">
        <c-grid
        :data="records"
        :frozen-col-count="0"
        :theme="userTheme"
        :defaultRowHeight="24"
        >
        <c-grid-input-column
          field="_id"
          width= "10%"
          :column-style='column'
          min-width="0"
          sort="true"
        >
         生産No
        </c-grid-input-column>
        <c-grid-input-column
          field="modelname"
          width= "20%"
          :column-style='column'
          min-width="0"
          sort="true"
        >
          機種名
        </c-grid-input-column>
        <c-grid-input-column
          field="date"
          width= "10%"
          :column-style='column'
          min-width="0"
          sort="true"
        >
          納期
        </c-grid-input-column>
        <c-grid-input-column
          field="price"
          width= "5%"
          :column-style='column_num'
          min-width="0"
          sort="true"
        >
          単価
        </c-grid-input-column>
        <c-grid-input-column
          :field="onDestination"
          width= "5%"
          :column-style='column'
          min-width="0"
          sort="true"
        >
          仕向け
        </c-grid-input-column>
        <c-grid-input-column
          field="pintype"
          width= "5%"
          :column-style='column_num'
          min-width="0"
          sort="true"
        >
          ピン数
        </c-grid-input-column>
        <c-grid-input-column
          field="pice"
          width= "5%"
          :column-style='column_num'
          min-width="0"
          sort="true"
        >
          極数
        </c-grid-input-column>
        <c-grid-input-column
          field="daymaxcount"
          width= "10%"
          :column-style='column_num'
          min-width="0"
          sort="true"
        >
          時間生産数
        </c-grid-input-column>
        <c-grid-input-column
          field="qty"
          width= "5%"
          :column-style='column_num'
          min-width="0"
          sort="true"
        >
          数量
        </c-grid-input-column>
        <c-grid-input-column
          field="checkqty"
          width= "5%"
          :column-style='column_num'
          min-width="0"
          sort="true"
        >
          検査数
        </c-grid-input-column>
        <c-grid-input-column
          field="plancount"
          width= "5%"
          :column-style='column_num'
          min-width="0"
          sort="true"
        >
          取込数
        </c-grid-input-column>
        <c-grid-button-column
              caption="取込"
              width="5%"
              @click="onAddRecord($event)"
              >
              取込
              </c-grid-button-column>
    </c-grid>
    </div>
    <div class="grid-sample"></div> 
  </div>  
</template>

<script>

  //共通関数//
  import date_func from '../../api/date_func'
  const { 
    toDoubleDigits,
    onCurrentMonth,
    formatDay,
    getMonth_Day
   } = date_func();
  
  import axios from 'axios'
  import { mapState } from 'vuex'

  export default {
    name: 'csvinport',
    props: ["spec","filterflg","keyword"],
    components: {
    },  
    data() {
      return {
        records: [],
        userTheme: null
      }
    },
    watch: {
      filterflg: function() {
        this.onGetCsv();
      },
      keyword
      : function() {
        this.onGetCsv();
      }
    },
    created() {
      this.onTheme();
      this.onGetCsv();
    },
    mounted() {    
    },
    computed: {
      //共通変数
      ...mapState({
        mcplanserver: 'mcplanserver'
      })
    },
    methods: {
      onDestination: function(e){
        if (e.destination != undefined) {
          return e.destination;
        } else {
          return "";     
        }
      },
      onDayMaxCount: function(e){
         return ((( e.pice * this.spec.spm * 60 / 100 ) * 100 ) * 0.85 ).toFixed(1);
      },
      onAddRecord: function(e){
        if (e.pice > 0 && e.pintype > 0) {
          var olddata = e;
         // e.plancount += (e.qty-e.plancount);        
          this.records.splice(this.records.indexOf(olddata), 1, e);
          this.$emit("select", [e]);
        } else {
          alert("情報が不足しています");
        }  
      },
      onGetCsv(){
        var self = this;
        var senddata = {
          params: {  
            type: self.spec.type,
            filter: self.spec.filter1, 
            modeltype: self.spec.text,
            spm: self.spec.spm,
            basehour: 0,  
            retdata: "",
            filterflg: self.filterflg,
            keyword: self.keyword
          }
        } 
        let promise = axios.get( this.mcplanserver + "/getcsvdata", senddata)  
        return promise.then((result) => {
          self.records = result.data.retdata;
          self.basehour = result.data.basehour;
        }).catch(error => {
          console.log("error " + error) 
        }) 
      },
      onTheme() {
        var ret = {
          frozenRowsBgColor: "#40b883",
          frozenRowsColor: "white",
         //  frozenRowsBorderColor: "black",
          font: "normal normal normal 12px/1 FontAwesome",
          borderColor({ col, row, grid }) {
            if (row < 9) { // ヘッダー
              return [null /*top*/, "#616161" /*right and left*/, "#616161" /*bottom*/];
            } else {
              return [null /*top*/, "#616161" /*right and left*/,"#616161" /*bottom*/];
            }
          },
        }
        this.userTheme = ret;
      },
      column(rec) {
        if (rec.plancount > 0) {
          var ret = { bgColor: "silver", color: "#000", textAlign: "left"};
        } else {
          var ret = { bgColor: "white", color: "#000", textAlign: "left"};
        }
        return ret
      },
      column_num(rec) {
        if (rec.plancount > 0) {
          var ret = { bgColor: "silver", color: "#000", textAlign: "right"};
        } else {
          var ret = { bgColor: "white", color: "#000", textAlign: "right"};
        }
        return ret
      },
    }
  }

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