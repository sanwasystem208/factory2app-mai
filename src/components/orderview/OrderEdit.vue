,<template>
   <b-container fluid class="p-0 m-0">
    <!-- User Interface controls -->
    <b-row class="h-10 titles2 m-0">
        <b-col xl="9">
          <h5 class="m-2" style="color:white">注文編集</h5>
        </b-col>
        <b-col xl="3">
          <b-button class="closebutton float-right m-2" size="sm" @click="closewindow">閉じる</b-button>
        </b-col>
    </b-row>
    <b-row class="h-100 ml-0 mr-0 mt-3 p-1">
      <b-col xl="7">
        <b-row>
            <b-col xl="3">
                <label class="mt-2">生産No</label>
            </b-col>
            <b-col xl="9">
                <b-form-input type="number" id="input-orderno" v-model="order._id" required placeholder="" class="m-1"></b-form-input>
            </b-col>
        </b-row>
        <b-row>
            <b-col xl="3">
                <label class="mt-2">機種名</label>
            </b-col>
            <b-col xl="9">
              <b-form-select
                class="m-1"
                v-model="order.modelid"
                :options="modellist">
              </b-form-select>
            </b-col>
        </b-row>
        <b-row>
          <b-col xl="3">
            <label class="mt-2">機種ID</label>
          </b-col>
          <b-col xl="9">
            <label class="mt-2">{{ order.modelid }}</label>
          </b-col>
        </b-row>
        <b-row>
          <b-col xl="3">
              <label class="mt-2">数量</label>
          </b-col>
          <b-col xl="9">
            <b-form-input type="number" id="input-orderno" v-model="order.qty" required placeholder="" class="m-1"></b-form-input>
          </b-col>
          <b-col xl="3">
            <label class="mt-2" for="inline-form-custom-select-pref">単価</label>
          </b-col>
          <b-col xl="9">
            <b-form-input type="number" id="input-comment" v-model="order.price" step="0.001" required placeholder="" class="m-1"></b-form-input>
          </b-col>
        </b-row>
        <b-row>
          <b-col xl="3">
            <label class="mt-2" for="inline-form-custom-select-pref">仕向け</label>
          </b-col>
          <b-col xl="9">
            <b-form-input type="text" id="input-destination" v-model="order.destination" required placeholder="" class="m-1"></b-form-input>
          </b-col>
        </b-row>
        <b-row>
          <b-col xl="3">
            <label class="mt-2" for="inline-form-custom-select-pref">納期</label>
          </b-col>
          <b-col xl="9">
            <b-form-input type="date" id="input-destination" v-model="date" required placeholder="" class="m-1"></b-form-input>
          </b-col>
        </b-row>
        <b-row>
          <b-col xl="3">
              <label class="mt-2">非表示</label>
          </b-col>
          <b-col xl="3">
            <b-form-checkbox v-model="order.disable" name="check-button" class="mt-2" switch size="lg">
            </b-form-checkbox>
          </b-col>
          <b-col xl="3">
              <label class="mt-2">計画完</label>
          </b-col>
          <b-col xl="3">
            <b-form-checkbox v-model="order.endplan" name="check-button" class="mt-2" switch size="lg">
            </b-form-checkbox>
          </b-col>
        </b-row>
        <b-row>
          <b-col xl="6">
              <label class="mt-1">オーダー指示書発行</label>
          </b-col>
          <b-col xl="6">
            <b-form-checkbox v-model="order.makeinstruct" name="check-button" class="mt-1" switch size="lg">
            </b-form-checkbox>
          </b-col>
        </b-row>
        <b-row>
          <b-col xl="6">
              <label class="mt-1">テーピング指示書発行</label>
          </b-col>
          <b-col xl="6">
            <b-form-checkbox v-model="order.makeinstruct2" name="check-button" class="mt-1" switch size="lg" @change="handleChange">
            </b-form-checkbox>
          </b-col>
        </b-row>
        <b-row>
          <b-col xl="9">   
            <!--   <b-button type="button" variant="success" class="mt-3 ml-1 float-left" v-on:click="onnewpart" v-if="newpart">新規登録</b-button>
                <b-button type="button" variant="primary" class="mt-3 ml-1 float-left" v-on:click="oneditpart" v-else>登録</b-button>
                <b-button type="button" variant="danger" class="mt-3 ml-2 mr-2 float-left" v-on:click="onDelete">削除</b-button>-->
                <b-button type="button" variant="info" class="mt-3 ml-2 mr-2 float-left" v-on:click="onSave">保存</b-button>
          </b-col>
          <b-col xl="3">
              <label class="m-1"><h6>{{ msg }}</h6></label>
          </b-col>
        </b-row>
      </b-col>  
      <b-col xl="5">
          <div style="height: 37vh; border: solid 1px #545454;">
              <c-grid
              :data="records"
              :frozen-col-count="0"
              :theme="onTheme()"
              :defaultRowHeight="24"
              >
              <c-grid-input-column
                field="daystr"
                width= "50%"
                :column-style='column'
                min-width="0"
                sort="true"
              >
                検査日
              </c-grid-input-column>
              <c-grid-input-column
                field="qty"
                width= "40%"
                :column-style='column_num'
                column-type="number"
                min-width="0"
                sort="true"
              >
                数量
              </c-grid-input-column>
          </c-grid>
          </div>
          <div class="grid-sample"></div> 
      </b-col>
    </b-row>
   </b-container>
</template>

<script>

import Vue from 'vue'
import axios from "axios";
import { mapState } from 'vuex'

import date_func from '../../api/date_func'
  const { 
    toDoubleDigits,
    formatDay,
    addnextmonth,
    make_id,
    isNumber,
    addnextstart,
    addnextlast,
    make_daylist,
    getDateTime,
    getOffsetDate2
  } = date_func();

  export default {
    name: 'editorder',
    props: ["items"],
    components: {
    },  
    data() {
      return {
        records: [],
        order: {
          _id: null,
          orderno: 0,
          qty: 0,
          modelid: "",
          modelname: null,
          shipmentqty: 0,
          checkqty: 0,
          date: null,
          endplan: false,
          disable: false,
          makeinstruct: false
        },
        modelid: 0,
        modellist: [],
        msg: null,
        date: null
      }
    },
    watch: {
      items: function(val) {
        this.order = val;
        this.records = val.checklist;
      }
    },
    created() {
      this.onModelList();
    },
    mounted() { 
      this.date = this.items.date.replace(/\//g, "-")
      this.order = JSON.parse(JSON.stringify(this.items));
      this.records = this.items.checklist;
    },
    computed: {
        //共通変数
        ...mapState({
            workerid: 'workerid',
            workername: 'workername',
            managementlevel: 'managementlevel',
            serverurl : 'serverurl',
            serverurl2 : 'serverurl2',
            customerid: 'customerid',
            customername: 'customername',
            loginflg: 'loginflg',
            fllowdata: "fllowdata",
            customer: 'customer',   
            partserver: 'partserver',
            division: 'division',
            orderserver: 'orderserver'
      }),
    },
    methods: {
      onModelList: function() {
          var url = "/getmodellist";
          var senddata = {
              params: {
                modellist: null
              } 
          }    
        let promise = axios.get( this.orderserver  + url, senddata)  
         return promise.then((result) => {
             this.modellist = result.data.modellist;
        }).catch(error => {
            console.log("error " + error) 
        }) 
      },
      onSave: function() {
        this.order.date = this.date.replace(/-/g, "/");
        var self = this;
        self.$emit("update", this.order)
      },
      closewindow: function() {
         this.$emit("close", null);
      },
      column(rec) {
        var ret = { bgColor: "white", color: "#000", textAlign: "left"};
        return ret
      },
       column_num(rec) {
        var ret = { bgColor: "white", color: "#000", textAlign: "right"};
        return ret
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
          frozenRowsBgColor: "gray",
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
        return ret;
      },
      handleChange() {
        if(this.order.makeinstruct === false && this.order.makeinstruct2 === true) {
          this.order.makeinstruct2 = false
        }
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