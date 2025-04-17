<template>
  <b-container fluid>
    <b-row class="h-8 p-1">
      <b-col class="col-2 p-0"> 
          <!-- <month-select @update="onMonth" class="mt-1 float-left"/>-->
          <b-form inline>
             <label class="mr-sm-2" for="inline-form-custom-select-pref">開始日:</label>
             <b-form-datepicker id="orderview-start" v-model="start"></b-form-datepicker>
             <label class="mr-sm-2 mt-1" for="inline-form-custom-select-pref">終了日:</label>
             <b-form-datepicker id="orderview-last" v-model="last" class="mt-1"></b-form-datepicker>
          </b-form>   
        </b-col>
        <b-col class="col-2 p-0">
          <b-form inline>
            <label class="mr-sm-2 mt-2" for="inline-form-custom-select-pref">抽出：</label>
            <b-form-input ref="filter-input" id="filter-input" type="text" v-model="filterstr" class="mt-1 mr-1 inputwidth" autocomplete="off" @keydown.enter="onListRefrash()"></b-form-input>
          </b-form>
        </b-col>
        <b-col class="col-4 p-0">
           <button type="button" class="btn float-left btn-danger btn-sm m-1" v-on:click="onListRefrash()">更新</button> 
           <button type="button" class="btn float-left btn-primary btn-sm m-1" v-on:click="onShowDialog()">追加</button>  
           <button type="button" class="btn float-left btn-sm m-1" style="background-color: #80DEEA;" v-on:click="onCheckRefrash()">チェック解除</button> 
           <button type="button" class="btn float-left btn-success btn-sm m-1" v-on:click="monthDisable()">非表示</button> 
           <button type="button" class="btn float-left btn-warning btn-sm m-1" v-on:click="onSelectDisable()">選択非表示</button> 
           <button type="button" class="btn float-left btn-info btn-sm m-1" v-on:click="onShowDisable()">非表示の解除</button> 
           <button type="button" class="btn float-left btn-sm m-1" style="background: rgb(200, 200, 200);" v-on:click="showModal = true">テーピング</button> 
           <b-modal v-model="showModal" title="テーピング" @shown="focusInput">
              <b-form-group label="生産No">
                <b-form-input ref="nameInput" v-model="code" @keydown.enter="keshikomi"></b-form-input>
              </b-form-group>
              <template #modal-footer>
                <b-button variant="secondary" @click="showModal = false">戻る</b-button>
              </template>
            </b-modal>
           <button type="button" class="btn float-left btn-success btn-sm m-1" v-on:click="checkevent()">No.1</button>
           <button type="button" class="btn float-left btn-sm m-1" style="background: rgb(200, 170, 220);" v-on:click="showModal = true">AAA</button> 
           <b-modal v-model="showModal" title="AAA" @shown="focusInput">
              <b-form-group label="生産No">
                <b-form-input ref="nameInput" v-model="code" @keydown.enter="keshikomi2"></b-form-input>
              </b-form-group>
              <template #modal-footer>
                <b-button variant="secondary" @click="showModal = false">戻る</b-button>
              </template>
            </b-modal>
        </b-col>
        <b-col class="col-4 p-0">
          <b-form inline>
            <h4 class="mr-sm-2 mt-2 mr-2" for="inline-form-custom-select-pref"><b-badge>総受注金額：</b-badge> {{ totalprice }}</h4>
            <h4 class="mr-sm-2 mt-2 mr-2" for="inline-form-custom-select-pref"><b-badge>総出荷金額：</b-badge> {{ checkprice }}</h4>
            <h4 class="mr-sm-2 mt-2 mr-2" for="inline-form-custom-select-pref"><b-badge>当月出荷金額：</b-badge> {{ monthcheckprice }}</h4>         
          </b-form>    
        </b-col>
    </b-row>
    <b-row class="h-92 p-1">
        <b-col class="col-12 p-0">
          <b-tabs content-class="mt-3">
            <b-tab title="受注一覧" active @click="onTabClick(1)">
              <csv-grid ref="OrderCsvGrid" :items="records" :key="updatekey" @click="onClickRow" @check="onCheckSave"></csv-grid>
            </b-tab>
            <b-tab title="売上実績"  @click="onTabClick(2)">
                <price-grid :items="records2" :key="updatekey2"></price-grid>
            </b-tab>
            <b-tab title="非表示一覧"  @click="onTabClick(3)">
                <csv-old-grid :items="records3" :key="updatekey3" @click="onClickRow"></csv-old-grid>
            </b-tab>
          </b-tabs>
          <modal name="orderadd" :width="800" :height="600">
             <order-edit :items="editdata" @update="onUpdateOrder" @close="ordereditclose"></order-edit>
          </modal>
          <modal name="progress-view"       
            :width="350"
            :height="100">
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
import CsvGrid from './orderview/CsvGrid.vue'
import CsvOldGrid from './orderview/CsvOldGrid.vue'
import PriceGrid from './orderview/PriceGrid.vue'

import { mapState } from 'vuex'

import date_func from '../api/date_func'
import { forEach } from 'mathjs';
const { 
  getOffsetDate,
  getOffsetMonth2
 } = date_func();

export default {
  components: {
    "order-grid": OrderGrid,
    "month-select": MonthSelect,
    "order-edit": OrderEdit,
    "progress-view": ProgressView,
    "csv-grid": CsvGrid,
    "price-grid": PriceGrid,
    "csv-old-grid": CsvOldGrid,
  },
  data() {
    return {
      currenttab: 1,
      orderlist: [],
      records: [],
      records2: [], 
      records3: [],   
      checklist: [], 
      updatekey: 0,
      updatekey2: 0, 
      updatekey3: 0,      
      userTheme: null,
      month: null,
      filterstr: "",
      editdata: null,
      start: getOffsetMonth2(new Date(),-1, 28),
      last: getOffsetMonth2(new Date(),0, 28),
      showModal: false,
      name: ''
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
      if (this.currenttab==1) {
        var ret = this.records.reduce(function (sum, tax) {
          return sum + (num_check(tax.monthcheckprice));
        }, 0);
      } else {
      /*  var ret = this.records2.reduce(function (sum, tax) {
         return sum + tax.totalprice;
        }, 0);*/
        var ret = 0;
        for (var i in this.records2) {
           ret += this.records2[i].sum * this.records2[i].price;
        }
      }
      return ret.toLocaleString();
    }
  },
  watch: {   
  },
  mounted() {
    this.onTheme();
  //  this.onGetView();
  } ,
  methods: {
    onCheckSet: function() {
      var self = this;
      for(var i in this.records) {
        var tmp = self.checklist.filter(function(value) {
          return value === self.records[i]._id;
        })
        if(tmp.length > 0) {
          self.records[i].check = true;
         // self.records.splice(i, 1, tmp[0]);
        }
      }
    },
    onCheckSave: function(e) {
      for(var i in this.records) {
        if(this.records[i].check) {
          this.checklist.push(this.records[i]._id)
        } else {
          var index = this.checklist.indexOf(this.records[i]._id);
          this.checklist.splice(index, 1);
        }
      }
      console.log(this.checklist)
    },
    onCheckRefrash() {
      this.checklist = [];
      this.onGetView()
    },
    onTabClick(flg){
       this.currenttab = flg;
       if (flg==1) {
         this.onGetView();
       }
       if (flg==2) {
         this.onGetView2();
       }
       if (flg==3) {
         this.onGetOldView();
       }
    },   
    onListRefrash() {
      if (this.currenttab==1) {
        this.onGetView();
      }
      if (this.currenttab==2) {
        this.onGetView2(); 
      } 
      if (this.currenttab==3) {
        this.onGetOldView(); 
      } 
    },
    onGetView: function() {
      this.$modal.show("progress-view");
      this.records = [];
      this.updatekey += 1;
      var url = "/getorderlist3";
      var senddata = {
          params: {
          start: this.start,
          last: this.last,
          filterstr: this.filterstr,
          // month: val.month.replace("-","/"),
          retdata: null
        } 
      }    
      let promise = axios.get( this.orderserver + url, senddata)  
      return promise.then(this.onOrder).catch(error => {
      console.log("error " + error) 
      })  
    }, 
    onOrder: function(data) {
       this.$modal.hide("progress-view");
       this.records = data.data.retdata;   
       this.onCheckSet();
    },
    onGetView2: function() {
        this.$modal.show("progress-view");
        this.records2 = [];
        this.updatekey2 += 1;
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
       this.records2 = data.data.retdata;   
    },
    onGetOldView: function() {
        this.$modal.show("progress-view");
        this.records3 = [];
        this.updatekey3 += 1;
        var url = "/getorderlist_old";
        var senddata = {
            params: {
            start: this.start,
            last: this.last,
            filterstr: this.filterstr,
           // month: val.month.replace("-","/"),
            retdata: null
          } 
        }    
        let promise = axios.get( this.orderserver + url, senddata)  
        return promise.then(this.onOldOrder).catch(error => {
        console.log("error " + error) 
        })  
    }, 
    onOldOrder: function(data) {
       this.$modal.hide("progress-view");
       this.records3 = data.data.retdata;   
    },
    setupdaterow: function(rec){
      this.$refs.OrderCsvGrid.setupdaterow(rec);
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
            start: self.start,
            last: self.last,
            month: self.month.replace("-","/"),
            retdata: null
        }    
        let promise = axios.post( self.orderserver + url, senddata)  
        return promise.then(self.onOrder).catch(error => {
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
            start: self.start,
            last: self.last,
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
    onMonth: function(val){
      this.month = val.month;
      this.onGetView();
      this.onGetView2();
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
        let promise = axios.get(this.orderserver + url, senddata)  
        return promise.then(this.onOrder).catch(error => {
        console.log("error " + error) 
        })  
    }, 
    monthDisable() {
      var list = []
      this.records.forEach((item, index) => {
        if(item.qty === item.checkqty || item.qty < item.checkqty) {
          list.push(item._id)
        }
      })
      var url = "/disabledata";
      var data = { orderid: list }
      let promise = axios.post(this.orderserver + url, data) //工数をデータベースに登録
      return promise.then((result) => {
        this.setupdaterow(result.data.newValue);
        console.log("更新", result.data.newValue)
      }).catch(error => {
        console.log('実行はキャンセルされました');
      });
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
            return promise.then(self.onOrder).catch(error => {
            console.log("error " + error) 
            })
          });   
      }   
    },
    focusInput() { //消し込みフォームを表示した時にカーソルを当てる
      this.$refs.nameInput.focus();
    },
    keshikomi() {
      var data = { orderid: this.code.slice(-6) } //頭のゼロを省く
      var url = "/setmakeinstruct";
      let promise = axios.post(this.orderserver + url, data) //工数をデータベースに登録
      return promise.then((result) => {
        if (result.data.newValue !=null) {
          this.setupdaterow(result.data.newValue);
          this.code = ""
          this.showModal = false
          console.log("更新", result.data.newValue)
        } else {
          alert("No.1を発行していません。")
        }
      }).catch(error => {
        console.log('実行はキャンセルされました');
      });
    },
    keshikomi2() {
      var data = { orderid: this.code.slice(-6) } //頭のゼロを省く
      var url = "/setmakeinstruct2";
      let promise = axios.post(this.orderserver + url, data) //工数をデータベースに登録
      return promise.then((result) => {
        if (result.data.newValue != null) {
          this.setupdaterow(result.data.newValue);
          this.code = ""
          this.showModal = false
          console.log("更新", result.data.newValue)
        } else {
          alert("No.1を発行していません。")
        }
      }).catch(error => {
        console.log('実行はキャンセルされました');
      });
    },
    checkevent() {
      var url = "/setcheckflgreset";
      let promise = axios.post(this.orderserver + url) //チェックフラグをfalseにリセット
      return promise.then((result) => {
        var self = this;
        //チェックが入ったデータを抽出
        var result = this.records.filter(function(value) {
          return value.check === true;
        })
        result.forEach(function(item) {
          if(item.makeinstruct === true || item.makeinstruct2 === true) {
            alert("既に印刷済のデータがあります。")
          } else {
            var data = { orderid: item._id, 
                          checkflg: item.check,
                          start: self.start,
                          last: self.last
                        }
            var url = "/setcheckflg";
            let promise = axios.post(self.orderserver + url, data) //チェックフラグを更新
            return promise.then((result) => {
              self.setupdaterow(result.data.newValue);
            }).catch(error => {
              console.log('更新エラー');
            });
          }
        })
      }).catch(error => {
        console.log('リセットエラー');
      });
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
