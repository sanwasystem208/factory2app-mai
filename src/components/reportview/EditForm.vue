<template>
  <b-container fluid class="bg-secondary">
    <b-row class="h-10 titles2">
      <b-col xl="12" class="m-0">
         <b-button class="m-1 closebutton float-right" size="sm" @click="onClose">閉じる</b-button>     
      </b-col>
    </b-row>
    <b-row class="h-90 p-0 mt-3 mb-0 ml-0 mr-0">
        <b-col class="col-12 p-0"> 
          <b-row class="m-0 p-0" >
             <b-col class="col-1 m-0 p-1"> 
                <h6><label class="label2">製品名</label></h6>
            </b-col>     
            <b-col class="col-6 m-0 p-1"> 
                <h4><input type="text" v-model="check.modelname" data-layout="normal" class="info bg-dark text-white"  /></h4>
            </b-col> 
             <b-col class="col-1 m-0 p-1"> 
                <h6><label class="label2">区分</label></h6>
             </b-col> 
             <b-col class="col-4 m-0 p-1"> 
                <h4><b-form-select v-model="check.production" :options="productionlist" size="md" class="bg-dark text-white"></b-form-select></h4>
             </b-col>
          </b-row>
          <b-row class="m-0 p-0" >
            <b-col class="col-1 m-0 p-1"> 
               <h6><label class="label2">生産No</label></h6>
               <modal name="tenkey-window" :width="400" :height="400">
                  <ten-key @close="tenkeyhide" @dataset="tenkeyretdata" :target="currenttarget" />
               </modal>
            </b-col> 
            <b-col class="col-6 m-0 p-1">         
              <h4><input type="text" v-model="check.order_no" data-layout="normal" class="info bg-dark text-white"  /></h4>
            </b-col>
            <b-col class="col-1 m-0 p-1"> 
                <h6><label class="label2">生産数</label></h6>
            </b-col> 
            <b-col class="col-4 m-0 p-1"> 
                <h4><input type="text" v-model="check.qty" data-layout="normal" class="text-center info bg-dark text-white"  /></h4>
            </b-col>
          </b-row>
          <b-row class="m-0 p-0" >
            <b-col class="col-1 m-0 p-1"> 
               <h6><label class="label2">総ﾛｯﾄ数</label></h6>
            </b-col> 
            <b-col class="col-2 m-0 p-1">         
              <h4><input type="text" v-model="totallotcount" data-layout="normal" class="text-center info bg-dark text-white"  /></h4>
            </b-col>
            <b-col class="col-1 m-0 p-1"> 
               <h6><label class="label2">ﾛｯﾄNo</label></h6>
            </b-col> 
            <b-col class="col-2 m-0 p-1">         
              <h4><input type="text" v-model="check.lotno" data-layout="normal" class="text-center info bg-dark text-white"  /></h4>
            </b-col>
            <b-col class="col-1 m-0 p-1">         
            </b-col>
            <b-col class="col-1 m-0 p-1">
                <h6><label class="label2">ﾛｯﾄ数量</label></h6>
            </b-col>   
            <b-col class="col-4 m-0 p-1"> 
                <h4><input type="text" v-model="check.lot_count" data-layout="normal" class="text-center info bg-dark text-white"  /></h4>
            </b-col>
          </b-row>
          <b-row class="m-1 p-0" >
             <b-col class="col-1 p-1"> 
                <h6><label  class="label2">ﾛｯﾄ状況</label></h6>
             </b-col> 
             <b-col class="col-4 p-1"> 
                <b-form-radio-group
                  id="checkbox-group-4"
                  v-model="check.lot_info"
                  :options="lotinfolist"
                  class="radiobutton mt-2"
                  name="flavour-4"
                ></b-form-radio-group>
             </b-col>
             <b-col class="col-2 p-1"> 
             </b-col>
            <b-col class="col-1 p-1">
                <h6><label class="label2">累計数</label></h6>
            </b-col>   
            <b-col class="col-4 p-1"> 
                <h4><input type="text" v-model="check.total_lot_count" data-layout="normal" class="text-center info bg-dark text-white"  /></h4>
            </b-col>
          </b-row>
          <b-row class="m-1 p-0" >
             <b-col class="col-1 m-0 p-1"> 
                <h6><label class="label2">NGコード</label></h6>
             </b-col> 
             <b-col class="col-9 m-0 p-1">
                <b-row class="p-0 m-0 waku bg-dark ">
                    <b-col class="p-0 m-0"><count-button id="0" @tenkey="tenkeyshow" :title="nglists[0].text" v-model="check.checklist[0].value"/></b-col>  
                    <b-col class="p-0 m-0"><count-button id="1" @tenkey="tenkeyshow" :title="nglists[1].text" v-model="check.checklist[1].value"/></b-col> 
                    <b-col class="p-0 m-0"><count-button id="2" @tenkey="tenkeyshow" :title="nglists[2].text" v-model="check.checklist[2].value"/></b-col> 
                    <b-col class="p-0 m-0"><count-button id="3" @tenkey="tenkeyshow" :title="nglists[3].text" v-model="check.checklist[3].value"/></b-col> 
                    <b-col class="p-0 m-0"><count-button id="4" @tenkey="tenkeyshow" :title="nglists[4].text" v-model="check.checklist[4].value"/></b-col> 
                    <b-col class="p-0 m-0"><count-button id="5" @tenkey="tenkeyshow" :title="nglists[5].text" v-model="check.checklist[5].value"/></b-col> 
                    <b-col class="p-0 m-0"><count-button id="6" @tenkey="tenkeyshow" :title="nglists[6].text" v-model="check.checklist[6].value"/></b-col> 
                    <b-col class="p-0 m-0"><count-button id="7" @tenkey="tenkeyshow" :title="nglists[7].text" v-model="check.checklist[7].value"/></b-col> 
                    <b-col class="p-0 m-0"><total-count title="NG合計" :value="totalcount"/></b-col> 
                </b-row>    
             </b-col>
             <b-col class="col-2 p-1"> 
                <b-row class="waku bg-dark m-0 p-0"> 
                  <b-col class="col-12 p-0"> 
                      <b-col class="p-0 m-0"><count-button id="10" @tenkey="tenkeyshow" title="抜き取り数" v-model="check.nukitori"/></b-col> 
                  </b-col> 
                </b-row>
             </b-col> 
          </b-row>
          <b-row class="m-1 p-0" >
             <b-col class="col-1 p-1"> 
                <h6><label class="label2">判定</label></h6>
             </b-col> 
             <b-col class="col-3 text-left"> 
                <b-form-radio-group
                  id="checkbox-group-2"
                  v-model="check.ngjudgment"
                  :options="ngjudgment"
                  class="radiobutton mt-2 text-left"
                  name="flavour-2"
                ></b-form-radio-group>
             </b-col> 
             <b-col class="col-3 text-left"> 
                <b-form-radio-group
                  id="checkbox-group-3"
                  v-if="check.ngjudgment==1"
                  v-model="check.ngmethod"
                  :options="ngmethods"
                  class="radiobutton mt-2 text-left"
                  name="flavour-3"
                ></b-form-radio-group>
             </b-col> 
             <b-col class="col-5 text-left"> 
             </b-col>
          </b-row>
          <b-row class="m-1 p-0" >
             <b-col class="col-1 p-1"> 
                <h6><label class="label2">備考</label></h6>
             </b-col> 
             <b-col class="col-11 text-left"> 
                  <b-form-textarea
                    id="textarea"
                    v-model="check.comment"
                    placeholder=""
                    rows="2"
                    class="bg-dark text-white"
                    max-rows="6"
                  ></b-form-textarea>
             </b-col>
          </b-row>
          <b-row class="m-5 p-0" >
             <b-col class="col-12">
               <b-row class="p-0">
                  <b-col cols="6" class="p-1 m-0">  
                      <b-button block variant="primary" size="lg" class="p-3" @click="setreport()">登録</b-button>                
                  </b-col>  
                  <b-col cols="6" class="p-1 m-0">  
                      <b-button block variant="danger" size="lg" class="p-3" @click="onClose()">取消</b-button>              
                  </b-col>  
               </b-row>
             </b-col>  
          </b-row>  
        </b-col>       
    </b-row>
  </b-container>
</template>

<script>
//<ag-grid :items="modeldata" ></ag-grid>
/* eslint-disable no-unused-vars */
import Vue from 'vue'
import axios from "axios";

import CountButton from './CountButton.vue'
import TotalCount from './TotalCount.vue'

import { mapState } from 'vuex'

import VModal from 'vue-js-modal'
Vue.use(VModal);

export default {
  name: 'sampleGrid',
  props: ["item"],
  components: {
     'count-button': CountButton,
     'total-count': TotalCount  
  },
  data() {
    return {
      bc: "",
      checklogs: [],
      currenttarget: null,
      workday: getDay3(new Date(),0),
      dispflg: false,
      selectedRows: [],
      selectval: 0,
      qty: 0,
      msg: "",
      check: {
        _id: null,
        modelname: null,
        qty: 0,
        nukitori: 0,
        daisu: 0,
        ngcode: [],
        ngmethod: [],
        ngmethod_sub: [],    
        workday: null,
        production: 0,
        comment: "",
        msg: null,
        apaddress: null,
        daystr: null
      },
      visible: false,
      layout: "normal",
      input: null,
      options: {
        useKbEvents: true,
        preventClickEvent: false
      }
    }
  },
  computed: {
      ...mapState({
        customerid: 'customerid',
        workerid: 'workerid',
        workername: 'workername',
        loginflg: 'loginflg',
        order_no: 'order_no'
      }),
      ...mapState("checkreport",{
        checkserver: "checkServer",
        nglists: "nglists",
        ngmethods: "ngmethods",
        ngjudgment: "ngjudgment",
        productionlist: "productionlist",
        lotinfolist: "lotinfolist"
      }),
      totalcount: function() {
        var total= 0;
        for (var i in this.check.checklist){
           total += parseInt(this.check.checklist[i].value);
        }
        return total;
      },
      totallotcount: function() {
        return this.check.qty / this.check.lot_count;
      }
  },
  watch: {
    selectedRows: function(val){
      this.check = val[0];
    },
    order_no: function(val) {
      if (val != null) {
         this.getorder(val);     
      }
    }
  },
  mounted() {
    this.check = this.item;
  } ,
  methods: {
    setreport(){
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
        self.$emit("update",self.check);
      })
      .catch(function() {
        console.log('実行はキャンセルされました');
      });
    },
    onClose() {
      this.$emit("close",null);
    }
  }
}
/********************************************* 
                  共通関数
******************************************** */

//月日０埋め
var toDoubleDigits = function(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
 return num;     
};

function getDay3(str,i) {
     var date1 = new Date(str);
     date1.setDate(date1.getDate() + i);  
   //   var off = weekday_offset(date1)  
   //   date1.setDays(date1.getDays() + off); 
      // Date型を（YYYY/MM/DD）形式へ成型して返却
     var year = date1.getFullYear(); // 年
     var month = toDoubleDigits(date1.getMonth() + 1); // 月
     var day = toDoubleDigits(date1.getDate()); // 日 
     return  year + "-" + month + "-" + day; 
}

function addId() {
  var date1 = new Date();

   // Date型を（YYYY/MM/DD）形式へ成型して返却
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  var hour = toDoubleDigits(date1.getHours()); // 時
  var min = toDoubleDigits(date1.getMinutes()); // 分
  var sec = toDoubleDigits(date1.getSeconds()); // 秒 

  return  year +  month + day + hour + min + sec; 

}

function addTime() {
  var date1 = new Date();

   // Date型を（YYYY/MM/DD）形式へ成型して返却
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日
  var hour = toDoubleDigits(date1.getHours()); // 時
  var min = toDoubleDigits(date1.getMinutes()); // 分
  var sec = toDoubleDigits(date1.getSeconds()); // 秒 

  return  year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec; 

}

function addDay() {
  var date1 = new Date();

   // Date型を（YYYY/MM/DD）形式へ成型して返却
  var year = date1.getFullYear(); // 年
  var month = toDoubleDigits(date1.getMonth() + 1); // 月
  var day = toDoubleDigits(date1.getDate()); // 日

  return  year + "-" + month + "-" + day; 

}
/* eslint-enable no-unused-vars */
</script>

<style scoped>
  html, body {
    width: 100%;
    height: 100%;
  }
  .inputwidth {
    width: 120px;
  }

  .container-fluid {
    margin: 0px;
    padding: 0px;
  }

  .bigfont { 
    font-size: 32px;
    color: brown;
  }

  .bigfont2 { 
    font-size: 24px;
  }

  .bigfont3 { 
    font-size: 40px;
  }

  .bigfont4 {
    font-size: 20px;
  }

  .redfont {
    color: red;
    font-size: 30px;
  }

  #keyboard {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;

    z-index: 1000;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;

    padding: 1em;

    background-color: #EEE;
    box-shadow: 0px -3px 10px rgba(black, 0.3);

    border-radius: 10px;
  }

  .radiobutton {
    color: white;
  }

  .outline {
    border: 1px solid #bebebe;	/* 境界線を実線で指定 */
    border-radius: 10px;
    color: white;

  }

  .waku {
    border : solid 1px rgb(255, 255, 255) ; 
    border-radius: 3px;
  }
</style>