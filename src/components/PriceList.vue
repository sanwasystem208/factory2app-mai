<template>
  <b-container fluid>
    <b-row class="h-8 p-1">
      <b-col class="col-4 p-0"> 
          <!-- <month-select @update="onMonth" class="mt-1 float-left"/>-->
          <b-form inline>
             <label class="mr-sm-2" for="inline-form-custom-select-pref">開始日:</label>
             <b-form-datepicker id="orderview-start" v-model="start"></b-form-datepicker>
             <label class="ml-sm-2 mr-sm-2 mt-1" for="inline-form-custom-select-pref">終了日:</label>
             <b-form-datepicker id="orderview-last" v-model="last" class="mt-1"></b-form-datepicker>
          </b-form>   
        </b-col>
        <b-col class="col-5 p-0">
          <b-form inline>
            <label class="mr-sm-2 mt-2" for="inline-form-custom-select-pref">抽出：</label>
            <b-form-input ref="filter-input" id="filter-input" type="text" v-model="filterstr" class="mt-1 mr-1 inputwidth" autocomplete="off"></b-form-input>
            <button type="button" class="btn float-left btn-danger btn-sm m-1" v-on:click="onGetView()">更新</button> 
          </b-form>
        </b-col>
        <b-col class="col-3 p-0">
          <b-form inline>
            <label class="mr-sm-2 mt-2 mr-2" for="inline-form-custom-select-pref">当月出荷金額：{{  monthcheckprice }}</label>         
          </b-form>    
        </b-col>
    </b-row>
    <b-row class="h-92 p-1">
        <b-col class="col-12 p-0">
            <b-tabs content-class="mt-3">
              <b-tab title="ロット別" active @click="onTabClick(1)">
                  <div style="height: 87vh; border: solid 1px #545454;">
                    <c-grid
                      :data="records"
                      :frozen-col-count="0"
                      :theme="userTheme"
                      :defaultRowHeight="24"
                      >
                      <c-grid-check-column 
                        field="check" 
                        width="50">
                        選択
                      </c-grid-check-column>  
                      <c-grid-input-column
                          field="orderno"
                          width= "100"
                          :column-style='column'
                          min-width="0"
                          sort="true"
                        >
                        生産No
                      </c-grid-input-column>
                      <c-grid-input-column
                          field="modelname"
                          width= "350"
                          :column-style='column'
                          min-width="0"
                          sort="true"
                        >
                        品番
                      </c-grid-input-column>
                      <c-grid-input-column
                          field="qty"
                          width= "95"
                          :column-style='column_num'
                          min-width="0"
                          sort="true"
                          column-type="number"
                        >
                        ロット数
                      </c-grid-input-column>
                      <c-grid-input-column
                          field="sum"
                          width= "85"
                          :column-style='column_num'
                          min-width="0"
                          sort="true"
                          column-type="number"
                        >
                        検査数
                      </c-grid-input-column>
                      <c-grid-input-column
                          field="price"
                          width= "85"
                          :column-style='column_num'
                          min-width="0"
                          sort="true"
                          column-type="number"
                        >
                        単価
                      </c-grid-input-column>
                      <c-grid-input-column
                          field="totalprice"
                          width= "95"
                          :column-style='column_num'
                          min-width="0"
                          sort="true"
                          column-type="number"
                        >
                        売上金額
                      </c-grid-input-column>
                    </c-grid>
                  </div>
                  <div class="grid-sample"></div>
              </b-tab>
              <b-tab title="部品別" @click="onTabClick(2)">

              </b-tab>
            </b-tabs>


          <modal name="orderadd" :width="800" :height="460">
             <order-edit :items="editdata" @update="onUpdateOrder" @close="ordereditclose"></order-edit>
          </modal>
          <modal name="progress-view"       
            :width="350"
            :height="100"
            >
            <progress-view ref="progressview"></progress-view>
          </modal>
        </b-col>
    </b-row>
  </b-container>
</template>

<script>
//<ag-grid :items="modeldata" ></ag-grid>
import axios from "axios";
import OrderGrid from './orderview/OrderGrid.vue'
import MonthSelect from './orderview/MonthSelect.vue'
import OrderEdit from './orderview/OrderEdit.vue'
import ProgressView  from './ProgressView.vue'

import { mapState } from 'vuex'

import date_func from '../api/date_func'
const { 
  getOffsetDate,
  getOffsetMonth2
 } = date_func();

export default {
  components: {
    "order-grid": OrderGrid,
    "month-select": MonthSelect,
    "order-edit": OrderEdit,
    "progress-view": ProgressView
  },
  data() {
    return {
      orderlist:[],
      records: [],
      userTheme: null,
      month: null,
      filterstr: "",
      editdata: null,
      start: getOffsetMonth2(new Date(),-1, 28),
      last: getOffsetMonth2(new Date(),0, 28),
    }
  },
  computed: {
    //共通変数
    ...mapState({
      orderserver: "orderserver",
      priceserver: "priceserver"
    }),
    totalprice: function() {
      var ret = this.records.reduce(function (sum, tax) {
         return sum + (num_check(tax.qty) * num_check(tax.price));
      }, 0);
      return ret.toLocaleString();
    },
    checkprice: function() {
      var ret = this.records.reduce(function (sum, tax) {
         return sum + (num_check(tax.checkqty) * num_check(tax.price));
      }, 0);
      return ret.toLocaleString();
    },
    monthcheckprice: function() {
      var ret = this.records.reduce(function (sum, tax) {
         return sum + (num_check(tax.totalprice));
      }, 0);
      return ret.toLocaleString();
    }
  },
  watch: {   
  },
  mounted() {
    this.onTheme();
    this.onGetView();
  } ,
  methods: {
    onGetView: function() {
        this.$modal.show("progress-view");
        this.records = [];
        var url = "/getchecklist";
        var senddata = {
            params: {
            start: this.start,
            last: this.last,
            filterstr: this.filterstr,
           // month: val.month.replace("-","/"),
            retdata: null
          } 
        }    
        let promise = axios.get( this.priceserver + url, senddata)  
        return promise.then(this.onCheckList).catch(error => {
        console.log("error " + error) 
        })  
    }, 
    onCheckList: function(data) {
       this.$modal.hide("progress-view");
       this.records = data.data.retdata;   
    },
    setupdaterow: function(rec){
      const index = this.records.findIndex((v) => v._id === rec._id);
      if (rec.endplan || rec.disable) {
        this.records.splice(index, 1);
      } else {
        this.records.splice(index, 1, rec);
      }
      //this.grid.invalidate();
    },
    onClickRow(row){
      this.editdata = row;
      this.$modal.show("orderadd"); 
    },
    onShowDialog() {
      this.$modal.show("orderadd"); 
    },
    onAddOrder(rec){
      var self = this;
      this.$dialog
      .confirm({
        title: '追加確認',
        body: '追加してもよろしいですか？'
      },{
        okText: 'はい',
        cancelText: 'キャンセル',
      })
      .then(function() {
        var url = "/setorderdata";
        var senddata = {
            value: rec,
            month: self.month.replace("-","/"),
            retdata: null
        }    
        let promise = axios.post( self.orderserver + url, senddata)  
        return promise.then(self.onCheckList).catch(error => {
        console.log("error " + error) 
        }) 
      })
      .catch(function() {
        console.log('実行はキャンセルされました');
      });

    },
    onUpdateOrder(rec){
      var self = this;
      this.$dialog
      .confirm({
        title: '更新確認',
        body: '更新してもよろしいですか？'
      },{
        okText: 'はい',
        cancelText: 'キャンセル',
      })
      .then(function() {
        var url = "/setorderdata";
        var senddata = {
            value: rec,
            newValue: null,
            retdata: null
        }    
        let promise = axios.post( self.orderserver + url, senddata)  
        return promise.then((result) => {
            self.setupdaterow(result.data.newValue);
          }).catch(error => {
            console.log('実行はキャンセルされました');
          });
        });    

    },
    onFormatCheckQty(rec){
      var qty = 0;
      if (rec.checkqty != undefined) {
        qty = rec.checkqty;
      }
      return qty.toLocaleString();
    },
    onFormatMonthQty(rec){
      var qty = 0;
      if (rec.monthcheckqty != undefined) {
        qty = rec.monthcheckqty;
      }
      return qty.toLocaleString();
    },
    onFormatShipmentQty(rec){
      var qty = 0;
      if (rec.shipmentqty != undefined) {
        qty = rec.shipmentqty;
      }
      return qty.toLocaleString();
    },
    onPrice(rec){
      var price = 0;
      if (rec.price != undefined) {
        price = rec.price;
      }
      return price.toLocaleString();
    },
    onTotalPrice(rec){
      var price = 0;
      if (rec.price != undefined && rec.qty != undefined) {
        price = rec.qty * rec.price;
      }
      return price.toLocaleString();
    },
    onCheckPrice(rec){
      var price = 0;
      if (rec.price != undefined && rec.checkqty != undefined) {
        price = rec.checkqty * rec.price;
      }
      return price.toLocaleString();
    },
    onMonthPrice(rec){
      var price = 0;
      if (rec.price != undefined && rec.monthcheckqty != undefined) {
        price = rec.monthcheckqty * rec.price;
      }
      return price.toLocaleString();
    },
    onSabunPrice(rec){
      var price = 0;
      if (rec.price != undefined && rec.qty != undefined && rec.checkqty != undefined) {
        price = (rec.checkqty * rec.price)-(rec.qty * rec.price);
      }
      return price.toLocaleString();
    },
    onFormatQty(rec){
      return rec.qty.toLocaleString() || 0;
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
      if (rec.qty <= rec.checkqty) {
        ret = { bgColor: "silver", color: "#000", textAlign: "left"};
      } else {
        ret = { bgColor: "white", color: "#000", textAlign: "left"};
      }
      return ret
    },
    column_num(rec) {
      var ret = null;
      if (rec.qty <= rec.checkqty) {
        ret = { bgColor: "silver", color: "#000", textAlign: "right"};
      } else {
        ret = { bgColor: "white", color: "#000", textAlign: "right"};
      }
      return ret
    },
    onMonth: function(val){
      this.month = val.month;
      this.onGetView();
    },
    onDisaboeOff: function(no) {
       // this.month = val.month;
        this.records = [];
        var url = "/setdisableoff";
        var senddata = {
            params: {
            orderid: no,
            filterstr: this.filterstr,
            retdata: null
          } 
        }    
        let promise = axios.get( this.orderserver + url, senddata)  
        return promise.then(this.onCheckList).catch(error => {
        console.log("error " + error) 
        })  
    }, 
    onSelectDisable: function(val) {
        // this.month = val.month;
      var self = this;
      var ids = [];
      this.records.forEach((item, index) => {
          if (item.check) {
            ids.push(item._id)            
          }
      }); 
      if (ids.length > 0) {
          this.$dialog
          .confirm({
            title: '非表示確認',
            body: ids.length + ' 件をまとめて非表示にしますか？'
          },{
            okText: 'はい',
            cancelText: 'キャンセル',
          })
          .then(function() {  
            self.records = [];
            var url = "/setselectdisable";
            var senddata = {
              ids: ids,
              filterstr: self.filterstr,
              // month: val.month.replace("-","/"),
              retdata: null
            }    
            let promise = axios.post( self.orderserver + url, senddata)  
            return promise.then(self.onCheckList).catch(error => {
            console.log("error " + error) 
            })
          });   
      }   
    },
    ordereditclose: function(data) {
      this.$modal.hide("orderadd");   
    },
    onShowDisable() {
      // 入力ダイアログを表示 ＋ 入力内容を user に代入
      var no = window.prompt("表示する生産Noを入力してください", "");
      if(no != "" && no != null){
        this.onDisaboeOff(no);
      }
      else{
        window.alert('キャンセルされました');
      }
    },
  }
}

function num_check(num) {
  var ret = 0;
  if (num != undefined) {
    ret = num;
  }
  return ret;
}
</script>

<style scoped>
.backcl {
  background-color: #ffffff;
}

.title {
  font-family:'Impact',sans-serif;
  font-weight: bold;
}

.header { 
    max-height: 60px;
    min-height: 40px;
}

.gantt {
 height: 200px;
}

.fa-icon {
  width: auto;
  height: 1em; /* or any other relative font sizes */
  max-width: 100%;
  max-height: 100%;

}
.vcenter {
  display: inline-block;
  vertical-align: middle;
  float: none;
}

.textwhite {
  color: white;
}

.inputwidth {
  width: 150px;
}
</style>
